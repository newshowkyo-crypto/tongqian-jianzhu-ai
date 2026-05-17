# 09 支付网关 - Design

## 1. 模块结构

```
apps/api/src/modules/payment/
├── payment.module.ts
├── payment.service.ts                  # 主入口
├── providers/
│   ├── payment-provider.interface.ts
│   ├── wechat.provider.ts              # 含 H5 / 公众号 / Native / 协议支付
│   └── alipay.provider.ts              # H5 / Native / 周期扣款
├── orders/
│   ├── order.service.ts
│   └── order.controller.ts
├── refund/
│   ├── refund.service.ts
│   ├── protection-period.service.ts    # BR-201 7 天保护期
│   └── refund-rule.service.ts          # BR-202 分级
├── auto-charge/
│   ├── wechat-contract.service.ts      # 协议支付
│   └── auto-charge.service.ts
├── commission/                          # 与 [`22-agent-workspace`] 桥接
│   ├── settlement.service.ts           # BR-303 跨域代扣代付
│   ├── lifecycle.service.ts            # BR-304 状态机
│   └── clawback.service.ts             # BR-201 退款扣回
├── withdrawal/
│   ├── withdrawal.service.ts           # 提现
│   └── withdrawal.controller.ts
└── webhook/
    ├── wechat-webhook.controller.ts
    └── alipay-webhook.controller.ts
```

## 2. 数据模型

```prisma
model PaymentOrder {
  id              String   @id @default(cuid())
  tenant_id       String
  user_id         String
  type            String   // subscription / topup / consulting_order / commission_settle
  amount          Decimal  @db.Decimal(10,2)
  currency        String   @default("CNY")
  status          PayStatus
  channel         String   // wechat / alipay
  external_order_no String? @unique
  paid_at         DateTime?
  metadata        Json?
  idempotency_key String   @unique
  trace_id        String
  created_at      DateTime @default(now())
}

model PaymentRefund {
  id              String   @id @default(cuid())
  order_id        String
  amount          Decimal  @db.Decimal(10,2)
  tier            RefundTier  // full / half / system_failure
  reason          String
  approval_flow_id String?
  status          String   // requested / approved / rejected / completed
  external_refund_no String?
  created_at      DateTime @default(now())
  completed_at    DateTime?
}

model AutoChargeContract {
  id                String   @id @default(cuid())
  user_id           String
  channel           String
  external_contract_id String
  status            String   // active / revoked
  bound_at          DateTime @default(now())
  revoked_at        DateTime?
}

model AgentCommission {
  id              String   @id @default(cuid())
  agent_id        String
  client_tenant_id String
  type            String   // subscribe_y1 / subscribe_y2+ / topup / dispatch_5pct / referral_fee
  amount          Decimal  @db.Decimal(10,2)
  status          CommissionStatus  // frozen / settlable / withdrawable / paid
  source_order_id String
  freeze_until    DateTime?       // 保护期 / 验收期
  settled_at      DateTime?
  paid_at         DateTime?

  @@index([agent_id, status])
}

model AgentWithdrawal {
  id              String   @id @default(cuid())
  agent_id        String
  amount          Decimal  @db.Decimal(10,2)
  bank_card_id    String
  approval_flow_id String?
  status          String   // requested / approved / rejected / paid / failed
  external_payout_no String?
  fee             Decimal  @db.Decimal(10,2)  // 手续费
  created_at      DateTime @default(now())
  paid_at         DateTime?
}

enum PayStatus { pending paid failed canceled refunded partial_refunded }
enum RefundTier { full half system_failure none }
enum CommissionStatus { frozen settlable withdrawable paid }
```

## 3. 退款规则（BR-202 分级）

```ts
class RefundRuleService {
  resolveTier(order: PaymentOrder, daysSincePaid: number): RefundTier {
    if (daysSincePaid <= 7)  return 'full';    // BR-201
    if (daysSincePaid <= 30) return 'half';
    return 'none';
  }

  resolveApprover(amount: Decimal): PlatformRole {
    if (amount.lt(500))   return 'PLATFORM_CS';
    if (amount.lt(10000)) return 'PLATFORM_FIN';
    return 'PLATFORM_OWNER';
  }
}
```

## 4. 跨域代扣代付（BR-303）

```ts
async settleCrossDomain(dispatchId: string): Promise<void> {
  const d = await this.dispatchRepo.findOne(dispatchId);
  if (d.pool !== 'cross') return;
  
  const ownerAgentId = (await this.attribution.findByClient(d.client_tenant_id)).agent_id;
  const fee = d.actual_amount.mul(0.05);  // 5%
  
  await this.prisma.$transaction(async (tx) => {
    // 1. 扣服务方 5%
    await tx.agentCommission.create({
      data: {
        agent_id: d.assigned_agent_id,
        type: 'dispatch_5pct',
        amount: fee.negated(),
        status: 'settlable',  // 直接进可结算
        source_order_id: d.id,
      },
    });
    // 2. 入归属智能管家
    await tx.agentCommission.create({
      data: {
        agent_id: ownerAgentId,
        type: 'dispatch_5pct',
        amount: fee,
        status: 'frozen',
        freeze_until: addDays(new Date(), 7),  // BR-201
        source_order_id: d.id,
      },
    });
    // 3. 资金流：写流水但不入平台收入
    await this.platformRevenueLogger.skip(d.id, 'cross_domain_fee_5pct');
  });
}
```

## 5. 退款扣回（BR-201）

```ts
async clawbackOnRefund(refundId: string): Promise<void> {
  const refund = await this.refundRepo.findOne(refundId);
  const order = await this.orderRepo.findOne(refund.order_id);
  
  // 找该订单产生的 frozen 分润
  const commissions = await this.commissionRepo.findMany({
    where: { source_order_id: order.id, status: 'frozen' },
  });
  
  // 反向操作（创建反向 commission，type 标记 clawback）
  for (const c of commissions) {
    await this.commissionRepo.create({
      agent_id: c.agent_id,
      type: `clawback.${c.type}`,
      amount: c.amount.negated(),
      status: 'settlable',
      source_order_id: c.source_order_id,
    });
  }
  await this.audit.write({ action: 'COMMISSION_CLAWBACK', ... });
}
```

## 6. 自动续费协议支付

微信"协议支付"高级接口：
- 首次订阅时签约 → 拿到 contract_id
- 后续续费调 `pap-pay/apply` 自动扣款

## 7. 关键 API

```yaml
POST /api/v1/payments/orders            # 创建订单（subscription / topup）
POST /api/v1/payments/wechat/webhook    # 微信回调
POST /api/v1/payments/alipay/webhook
GET  /api/v1/payments/orders/:id

POST /api/v1/refunds/request            # 退款申请（走审批）
GET  /api/v1/refunds/me

POST /api/v1/agent/commissions/me       # 智能管家分润看板
POST /api/v1/agent/withdrawals          # 提现申请
GET  /api/v1/agent/withdrawals/me
```

## 8. 错误码

`PAY.*`：
- `PAY.ORDER.PAYMENT_FAILED` (502)
- `PAY.ORDER.AMOUNT_MISMATCH` (422)
- `PAY.WEBHOOK.SIGNATURE_INVALID` (401)
- `PAY.REFUND.WINDOW_EXPIRED` (422)
- `PAY.WITHDRAWAL.INSUFFICIENT_BALANCE` (422)
- `PAY.AUTO_CHARGE.CONTRACT_REVOKED` (422)

## 9. PBT（强制）

| 属性 | 函数 |
|---|---|
| 退款金额 ≤ 原订单金额 | refund |
| 退款分级单调 | RefundRule |
| 跨域 5% 守恒（服务方扣 = 归属方进 = 平台 0）| settleCrossDomain |
| Webhook 签名验证 | webhook controllers |

## 10. 后台覆盖

| key | 内容 |
|---|---|
| `payment.refund_thresholds` | 7/30 天分级阈值 |
| `payment.refund_approver` | 退款审批角色阈值 |
| `payment.withdrawal_min` / `max` | 提现限额 |
| `payment.withdrawal_speed_by_level` | 等级 → T+N |


---

## V4 升级·大奖对公转账（R10 / P6 补丁）

### V4.1 服务结构

```
apps/api/src/modules/payment/large-reward/
├── reward-payment-router.service.ts    # ≥ ¥800 强制对公（拒微信红包路径）
├── tax-withholding.service.ts          # 个税 20% 代扣
├── corporate-transfer.service.ts        # 对公转账
└── tax-knowledge-letter.service.ts     # 偶然所得税扣缴知情书电子签
```

### V4.2 流程

```
RewardClaim 创建（amount ≥ 800）
  → CS 后台审核
  → PLATFORM_OWNER 双签
  → tax-withholding 计算 20% 代扣
  → 中奖人电子签《偶然所得税扣缴知情书》
  → corporate-transfer.execute（对公账户打款）
  → audit log 6 年留存
```
