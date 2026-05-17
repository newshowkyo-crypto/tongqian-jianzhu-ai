# 08 点数系统 - Design

## 1. 模块结构

```
apps/api/src/modules/credit/
├── credit.module.ts
├── credit.service.ts                  # 主入口（balance / preCharge / commit / refund / gift / topup）
├── credit.controller.ts
├── lot/
│   ├── lot.service.ts                 # 多池 lot 管理
│   └── lot-allocator.service.ts       # 先到期先扣算法
├── preCharge/                         # 与 [`04`] 同款 idempotent 扣点
│   ├── pre-charge.service.ts
│   ├── commit.service.ts
│   └── refund.service.ts
├── topup/
│   ├── topup.service.ts               # 充值入账
│   └── topup-package.service.ts       # 充值套餐
├── expiry/
│   └── expiry.worker.ts               # cron 每天 03:30 扫描过期
├── reactivation/
│   └── reactivation.service.ts        # BR-406 复活
└── log/
    └── credit-log.service.ts
```

## 2. 数据模型

```prisma
model CreditAccount {
  id              String   @id @default(cuid())
  user_id         String   @unique     // 一用户一账户
  tenant_id       String
  total_balance   Int      @default(0) // 用户可见余额（点）
  // 衍生字段（实时算）：subscription_balance / topup_balance / gift_balance
  created_at      DateTime @default(now())
}

model CreditLot {
  id              String   @id @default(cuid())
  account_id      String
  source          String   // subscription_y2025_05 / topup_2025_05_15 / gift.signin / gift.ladder.rebate / refund.ai
  initial_amount  Int
  remaining_amount Int
  expires_at      DateTime?         // null = 永久（充值）
  frozen_until    DateTime?         // BR-406 复活机制
  created_at      DateTime @default(now())

  @@index([account_id, expires_at, remaining_amount])
}

model CreditLog {
  id                String   @id @default(cuid())
  account_id        String
  type              CreditLogType  // pre_charge / commit / refund / topup / gift / expire
  amount            Int      // 带符号：+ 入账 / - 出账
  balance_after     Int
  source_module     String
  source_resource   String?
  idempotency_key   String?  @unique  // 唯一约束防重复
  trace_id          String
  created_at        DateTime @default(now())

  @@index([account_id, created_at])
}

enum CreditLogType {
  pre_charge
  pre_charge_release  // 命中缓存 / 失败时释放预扣
  commit
  refund
  topup
  gift
  expire
}
```

## 3. 多池消费算法

```ts
class LotAllocatorService {
  /** 先到期先扣 */
  async allocate(accountId: string, amount: number, ctx: AllocCtx): Promise<AllocResult> {
    const lots = await this.repo.findActiveLots(accountId, {
      orderBy: [
        { expires_at: 'asc', nulls: 'last' },  // 先扣最早到期，永久最后
        { created_at: 'asc' },                  // 同期先扣早创建
      ],
    });

    let remaining = amount;
    const allocations: LotAllocation[] = [];
    for (const lot of lots) {
      if (remaining <= 0) break;
      if (lot.frozen_until && lot.frozen_until > new Date()) continue;
      const take = Math.min(lot.remaining_amount, remaining);
      allocations.push({ lotId: lot.id, take });
      remaining -= take;
    }
    if (remaining > 0) throw new BusinessError('CREDIT.DEDUCT.INSUFFICIENT');
    return allocations;
  }
}
```

## 4. 预扣 / 实扣 / 退还（idempotent）

```ts
class PreChargeService {
  async preCharge(userId: string, amount: number, opts: { idempotencyKey: string }): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.creditLog.findUnique({
        where: { idempotency_key: opts.idempotencyKey },
      });
      if (existing) return;  // 幂等：已处理直接返回

      const account = await tx.creditAccount.findUnique({ where: { user_id: userId } });
      const allocs = await this.allocator.allocate(account.id, amount, { tx });

      // 扣减各 lot
      for (const a of allocs) {
        await tx.creditLot.update({
          where: { id: a.lotId },
          data: { remaining_amount: { decrement: a.take } },
        });
      }

      await tx.creditAccount.update({
        where: { id: account.id },
        data: { total_balance: { decrement: amount } },
      });

      await tx.creditLog.create({
        data: {
          account_id: account.id,
          type: 'pre_charge',
          amount: -amount,
          balance_after: account.total_balance - amount,
          source_module: 'ai-gateway',
          idempotency_key: opts.idempotencyKey,
          trace_id: this.ctx.get().traceId,
        },
      });
    });
  }
}
```

`refund.service.ts` 反向操作（同样 idempotent）：还原 lot 的 remaining_amount + balance + log。

## 5. 充值入账

```ts
async topup(userId: string, packageId: string, paymentId: string): Promise<void> {
  const pkg = await this.topupPkg.get(packageId);
  // 创建 lot（永久有效）
  await this.lot.create({
    account_id: ...,
    source: `topup_${formatDate()}_${paymentId}`,
    initial_amount: pkg.bonusCredits,
    remaining_amount: pkg.bonusCredits,
    expires_at: null,  // 永久
  });
  // 写 log
  await this.log.write({ type: 'topup', amount: pkg.bonusCredits, ... });
}
```

## 6. 有效期 Worker

```ts
// 每天 03:30 cron
async expireWorker() {
  const lots = await this.repo.findExpiredLots(new Date());
  for (const lot of lots) {
    if (lot.remaining_amount <= 0) continue;
    await this.expire(lot);  // 写 expire log + total_balance 减扣
  }
}
```

## 7. 复活机制（BR-406）

```ts
async reactivate(tenantId: string): Promise<void> {
  const sub = await this.subRepo.findOne({ tenant_id: tenantId });
  if (sub.status !== 'canceled') throw new BusinessError('SUB.STATUS.INVALID_TRANSITION');
  if (sub.canceled_at < daysAgo(30)) throw new BusinessError('SUB.REACTIVATION.WINDOW_EXPIRED');

  // 解除所有 frozen_until
  await this.lot.unfreeze(tenantId);
  await this.subService.reactivate(tenantId);
}

// 取消订阅时：
async onSubscriptionCanceled(tenantId: string): Promise<void> {
  await this.lot.freeze(tenantId, daysFromNow(30));  // 30 天后过期
}
```

## 8. 关键 API

```yaml
GET  /api/v1/credits/balance              # 总余额 + 各池
GET  /api/v1/credits/lots                  # 我的 lot 列表
GET  /api/v1/credits/logs                  # 流水
GET  /api/v1/topup/packages
POST /api/v1/topup                         # 充值
GET  /api/v1/admin/credits/anomalies       # 余额异常用户
```

## 9. 错误码

`CREDIT.*`：
- `CREDIT.DEDUCT.INSUFFICIENT` (422)
- `CREDIT.IDEMPOTENCY.DUPLICATE_KEY` (409)
- `CREDIT.LOT.NOT_FOUND` (404)
- `CREDIT.TOPUP.PACKAGE_INVALID` (404)
- `CREDIT.REFUND.NO_MATCHING_PRECHARGE` (422)

## 10. PBT 落点（强制）

| 属性 | 函数 |
|---|---|
| 幂等 | preCharge / commit / refund / gift（同 key 重复调用结果一致）|
| 余额 = sum(lot.remaining) | balance reconcile |
| 先到期先扣 | LotAllocator |
| 退点不超原扣量 | refund |

## 11. 后台覆盖

| key | 内容 |
|---|---|
| `credit.gift_default_expiry_days` | 默认 90 |
| `credit.topup_packages` | 充值套餐 + 赠送比例 |
| `credit.subscription_lot_expiry` | 订阅赠送有效期（默认当月）|
