# 26 上瘾系统 - Design

## 1. 模块结构

```
apps/api/src/modules/addiction/
├── checkin/
│   ├── checkin.service.ts
│   └── streak.service.ts          # 连续签到
├── lottery/
│   ├── lottery.service.ts
│   └── prize-pool.service.ts
├── share-unlock/
│   └── unlock.service.ts
├── building-level/                 # 建筑能力等级（与智能管家信誉独立）
│   ├── level.service.ts
│   └── progress-tracker.service.ts
├── monthly-growth-report/
│   ├── monthly-report.worker.ts    # 月初 1 号
│   └── prompts/growth-report.ts
├── boss-assistant-maturity/
│   └── maturity.service.ts
├── urgency-push/
│   ├── urgency.service.ts
│   └── throttle.service.ts         # BR-604 上限 3/日
├── content-matrix/
│   └── article.service.ts          # 公众号矩阵
└── opportunity-card/
    └── card.service.ts
```

## 2. 数据模型

```prisma
model UserCheckin {
  id              String   @id @default(cuid())
  user_id         String
  date            DateTime @db.Date
  reward_credits  Int
  streak_days     Int
  @@unique([user_id, date])
  @@index([user_id, date])
}

model LotteryEvent {
  id              String   @id @default(cuid())
  scheduled_at    DateTime
  is_active       Boolean  @default(true)
}

model LotteryDraw {
  id              String   @id @default(cuid())
  user_id         String
  event_id        String
  prize_type      String
  prize_value     String
  drawn_at        DateTime @default(now())
  @@unique([user_id, event_id])
}

model BuildingLevel {
  id              String   @id @default(cuid())
  tenant_id       String   @unique
  level           Int      // 1-5
  exp             Int      @default(0)
  unlocked_features Json
  updated_at      DateTime @updatedAt
}

model MonthlyGrowthReport {
  id              String   @id @default(cuid())
  tenant_id       String
  year_month      String
  h5_url          String?
  ai_task_id      String   @unique
  metrics         Json
  generated_at    DateTime @default(now())
  @@unique([tenant_id, year_month])
}

model UrgencyPushLog {
  id              String   @id @default(cuid())
  user_id         String
  type            String   // qualification_expiring / tender_deadline / opportunity_closing
  resource_id     String
  pushed_at       DateTime @default(now())
  @@index([user_id, pushed_at])
}
```

## 3. 关键约束实现

### 3.1 紧迫感节流（BR-604）

```ts
class UrgencyThrottleService {
  async canPush(userId: string): Promise<boolean> {
    const today = startOfDay(new Date());
    const count = await this.repo.count({
      where: { user_id: userId, pushed_at: { gte: today } },
    });
    return count < (await this.config.get('urgency.daily_limit', 3));
  }
}
```

### 3.2 抽点频率（BR-603）

仅周二 / 周五各 1 次（cron 定时打开 LotteryEvent）。

## 4. 关键 API

```yaml
POST /api/v1/checkins
GET  /api/v1/checkins/streak
POST /api/v1/lottery/draw
GET  /api/v1/lottery/upcoming
GET  /api/v1/building-level/me
GET  /api/v1/monthly-growth-reports/me
POST /api/v1/share-unlock/:resource_type/:resource_id
```

## 5. 错误码 `ADDICT.*`

- `ADDICT.LOTTERY.NOT_ACTIVE` (422)
- `ADDICT.LOTTERY.ALREADY_DRAWN` (409)
- `ADDICT.URGENCY.DAILY_LIMIT_REACHED` (warning，不抛错，丢弃推送)

## 6. PBT

| 属性 | 函数 |
|---|---|
| 紧迫感推送 ≤ 3 / 日 | UrgencyThrottle |
| 签到累积单调 | streak |
| 抽点仅在固定时段 | lottery |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `urgency.daily_limit` | 默认 3 |
| `lottery.schedule` | 周二 / 周五 |
| `building_level.exp_thresholds` | 5 级阈值 |
| `checkin.rewards` | 7/14/30/90 天奖励 |


---

## V4 升级·16 个钩子分组实现（R12-R16 设计）

### V4.1 数据模型

```prisma
model AddictionHook {
  id          String   @id @default(cuid())
  hook_code   String   @unique  // "12.1" / "S1" / etc
  name_zh     String
  group       AddictionGroup     // A/B/C/D/E/F
  phase       Int                // 1=一期 / 2=二期
  enabled     Boolean  @default(true)
  config      Json               // 阈值 / 触发条件 / 奖励配置
  output_red_lines Json           // 输出红线（详见 R13）
}

enum AddictionGroup {
  A_DAILY_INFO     // 每天必看（信息焦虑）
  B_DAILY_PLAY     // 每天必玩（实用钩子）
  C_WEEKLY_WALLET  // 每周必到（钱包钩子）
  D_MONTHLY        // 每月必参（沉淀钩子）
  E_SILENT         // 沉默触点
  F_AGENT_ONLY     // 智能管家专属
}

model HookTriggerLog {
  id          String   @id @default(cuid())
  hook_code   String
  user_id     String
  triggered_at DateTime @default(now())
  context     Json?      // 触发场景上下文
  outcome     String?    // shown / clicked / dismissed / converted
  
  @@index([user_id, hook_code, triggered_at])
}
```

### V4.2 钩子服务结构

```
apps/api/src/modules/addiction/
├── hooks/
│   ├── morning-briefing.service.ts          # 12.1 老板早报（50 点 / 天）
│   ├── industry-dashboard.service.ts        # 12.2 行业宏观仪表盘
│   ├── policy-flash.service.ts              # 12.3 政策快报闪现
│   ├── opportunity-card.service.ts          # 12.4 今日机会卡（复用 11）
│   ├── tender-blind-box.service.ts          # 12.5 招标盲盒
│   ├── daily-quiz.service.ts                # 12.6 标书员每日真题（每天 1 免，第 2 题 50）
│   ├── quote-calendar.service.ts            # 12.7 金句日历
│   ├── peer-pk-rank.service.ts              # 12.8 本省同行 PK 排行
│   ├── weekly-lottery.service.ts            # 12.9 限时抽点
│   ├── monthly-growth-report.service.ts     # 12.10 月度经营成长报告
│   ├── building-level.service.ts            # 12.11 建筑能力等级
│   ├── content-matrix.service.ts            # 12.12 公众号矩阵
│   ├── urgency-pusher.service.ts            # 12.13 紧迫感推送
│   ├── agent-earnings-calendar.service.ts   # S1 智能管家收益日历
│   ├── agent-client-health.service.ts       # S2 智能管家客户健康度
│   └── agent-case-market.service.ts         # S3 案例市场（复用 22）
├── output-red-line/
│   └── output-validator.service.ts          # 输出价值标杆校验（R13 自动校验）
├── reward-clearing/
│   ├── credits-reward.service.ts            # 点数实时入账 90 天有效
│   ├── physical-reward.service.ts           # 实物（CS 后台审 + 物流）
│   └── cash-reward.service.ts               # ≥¥800 对公 + 20% 代扣
└── personalization/
    └── user-preference.service.ts           # 老板可关闭推送 / 选 AI 性格
```

### V4.3 输出价值标杆校验（R13 自动校验）

```typescript
interface OutputRedLineCheck {
  hookCode: string;
  output: any;
  passed: boolean;
  failures: Array<{ rule: string; message: string }>;
}

// 早安简报例：
const briefingRules = [
  { id: 'min_items', check: (o) => o.items?.length >= 5, msg: '至少 5 条干货' },
  { id: 'has_numbers', check: (o) => o.items.every(i => /\d/.test(i.text)), msg: '每条含数字' },
  { id: 'has_source', check: (o) => o.items.every(i => !!i.source), msg: '每条含来源' },
  { id: 'no_ad', check: (o) => !/广告|促销|限时优惠/.test(JSON.stringify(o)), msg: '禁广告' },
];

// 每个钩子输出前必过自己的红线 → 不过则 reroll 或拒绝
```

### V4.4 政企不游戏化（R16 实现）

```typescript
// hook-eligibility.service.ts
function isHookEligibleForRole(hookCode: string, role: UserRole): boolean {
  if (role === 'GOV_USER') {
    return ['12.1', '12.3', '12.10', '12.13'].includes(hookCode); 
    // 仅要情简报 / 政策快报 / 月度工作小结 / 紧迫推送
  }
  return true;
}
```
