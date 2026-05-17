# 22 智能管家工作台 - Design

## 1. 模块结构（10 个子目录，按业务分组）

```
apps/api/src/modules/agent-workspace/
├── workspace.module.ts
├── profile/                              # 智能管家档案
│   └── agent-profile.service.ts
├── attribution/                          # BR-102 归属（被 [`06`] 调）
│   ├── attribution.service.ts
│   └── reassignment.service.ts           # BR-103
├── fission/                              # BR-301 三层裂变
│   ├── fission.service.ts
│   └── relation-builder.service.ts       # 自引用 ≤ 2 级 PBT
├── commission/                           # BR-302 / BR-304
│   ├── calculator.service.ts             # 30%/20%/15%
│   ├── lifecycle.service.ts              # frozen → settlable → withdrawable → paid
│   └── commission.controller.ts
├── referral/                             # BR-305
│   └── referral.service.ts
├── activity/                             # BR-306 月活红线
│   └── activity-monitor.worker.ts        # cron
├── daily-card/                           # 朋友圈日报
│   ├── daily-card.worker.ts              # cron 08:00
│   └── prompts/daily-card.ts
├── dispatch/                             # BR-307 至 BR-316
│   ├── dispatch.module.ts
│   ├── dispatch.service.ts
│   ├── classifier.service.ts             # BR-307 A/B/C
│   ├── router.service.ts                 # BR-308 池路由
│   ├── pool/
│   │   ├── owned-pool.service.ts
│   │   ├── cross-pool.service.ts         # 跨域 5%
│   │   └── public-pool.service.ts
│   ├── scorer.service.ts                 # BR-336 4 维加权
│   ├── quote.service.ts                  # 报价 + 调 [`21`] 标色
│   ├── takeover.service.ts               # BR-311 6 触发
│   ├── customer-pickup.service.ts        # 客户选定
│   └── customer-service-fallback.service.ts  # 抢单 1h 无人接 → 客服
├── rating/                               # BR-312
│   ├── rating.service.ts
│   ├── window-monitor.worker.ts          # 30 天窗口 + 自动 4★ + 防骚扰
│   └── rating.controller.ts
├── reputation/                           # BR-331 至 BR-335
│   ├── reputation.module.ts
│   ├── score.service.ts
│   ├── log.service.ts                    # 事件溯源
│   ├── level-resolver.service.ts         # 5 级 + 新智能管家 30 天保护 + LV1 重启
│   ├── visibility.service.ts             # BR-334 公开度
│   ├── event-bus/                        # BullMQ reputation-events 队列
│   ├── appeal/                           # BR-335
│   └── client-reputation.service.ts      # BR-333（挂 tenant）
├── referral-fee/                         # BR-313
│   ├── referral-fee.service.ts           # 比例 + 触发原因 + 冻结期 7/30/45
│   └── prompts/
├── premium-shelf/                        # BR-316 高端货架
│   ├── premium-shelf.service.ts
│   └── inquire.service.ts
├── appeal/                               # BR-314 申诉三级流程
│   └── appeal.service.ts                 # 复用 [`06`] 审批引擎
├── customer-management/                  # 我的客户
│   └── customer.service.ts
├── ranking/                              # 月度排行榜
│   └── ranking.service.ts
└── co-brand/                             # 联合品牌
    └── co-brand.service.ts
```

## 2. 数据模型（关键表）

```prisma
model AgentProfile {
  id              String   @id @default(cuid())
  user_id         String   @unique
  tenant_id       String   @unique
  subtype         AgentSubtype  // BR-004
  region          String   // 主营地区
  // 保证金已于 2026-05-16 ADR-AUTO 取消（早期为 ¥1000）
  // 字段保留为 nullable 以兼容历史数据，新智能管家统一为 null
  deposit_amount  Decimal? @db.Decimal(10,2)
  promo_code      String   @unique
  activity_status String   @default("active")  // active / dormant / pending_dispose / disposed
  last_active_at  DateTime?
  trained_at      DateTime?
  is_blacklisted  Boolean  @default(false)
}

model AgentRelation {
  id           String   @id @default(cuid())
  child_id     String   @unique  // 下级 agent_id
  parent_id    String              // 上级 agent_id
  level        Int      // 1 = 直接 / 2 = 二级（封顶）
  bound_at     DateTime @default(now())
  @@index([parent_id])
}

model ReputationScore {
  id           String   @id @default(cuid())
  entity_id    String   // user_id（客户）或 agent_id（智能管家）
  entity_type  String   // 'agent' / 'client_tenant'
  score        Int      @default(500)
  level        String   // LV1-LV5
  level_locked_until DateTime?  // 24h 缓冲（BR-332）
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  @@unique([entity_id, entity_type])
}

model ReputationLog {
  // 详见 [`design-flows.md` §8.4](../00-project-overview/design-flows.md)
}

model Dispatch {
  id              String   @id @default(cuid())
  client_tenant_id String
  source_module   String   // 11 / 12 / 14 / 19
  type            String
  amount          Decimal  @db.Decimal(15,2)
  class           String   // A / B
  pool            String?  // owned / cross / public
  status          DispatchStatus
  assigned_agent_id String?
  selected_agent_id String?
  takeover_reason String?  // BR-311
  cross_domain_fee Decimal?  // BR-303 5%
  actual_amount   Decimal?
  bid_window_until DateTime?
  created_at      DateTime @default(now())
  completed_at    DateTime?

  @@index([status, created_at])
}

model DispatchQuote {
  id              String   @id @default(cuid())
  dispatch_id     String
  agent_id        String
  price           Decimal  @db.Decimal(15,2)
  description     String
  color           String   // green / yellow / red / over
  ref_price_id    String?
  is_selected     Boolean  @default(false)
  created_at      DateTime @default(now())
  @@unique([dispatch_id, agent_id])
}

model AgentRating {
  id              String   @id @default(cuid())
  dispatch_id     String   @unique
  client_user_id  String
  agent_id        String
  stars           Int      // 1-5
  comment         String
  tags            Json
  is_auto_rating  Boolean  @default(false)
  rated_at        DateTime @default(now())
}

model ClientRating {
  id              String   @id @default(cuid())
  dispatch_id     String   @unique
  agent_id        String
  client_tenant_id String
  level           String   // 守信 / 一般 / 拖延 / 拒不付款
  tags            Json
  rated_at        DateTime @default(now())
}

model RatingReminder {
  id              String   @id @default(cuid())
  dispatch_id     String
  reminder_no     Int      // 7d / 15d / 29d
  sent_at         DateTime @default(now())
}

model AgentAppeal {
  id              String   @id @default(cuid())
  agent_id        String
  type            String   // suspension / rating / reputation / penalty
  resource_id     String   // 申诉对象
  approval_flow_id String   // 复用 [`06`] 审批引擎
  status          String
  created_at      DateTime @default(now())
}

model ReferralFee {
  id              String   @id @default(cuid())
  agent_id        String   // 归属智能管家
  client_tenant_id String
  service_type    String   // ABS / REITs / 化债 / ...
  trigger_reason  String   // BR-311 触发 1-6
  base_amount     Decimal  // 服务订单金额
  fee_pct         Decimal  // 10-20%
  fee_amount      Decimal
  freeze_days     Int      // 7 / 30 / 45
  status          String   // frozen / settlable / withdrawable / paid
  freeze_until    DateTime
  created_at      DateTime @default(now())
}

model PremiumServiceItem {
  id              String   @id @default(cuid())
  category        String   // 10 类
  name            String
  price_low       Decimal? @db.Decimal(15,2)
  price_high      Decimal? @db.Decimal(15,2)
  description     String   @db.Text
  is_active       Boolean  @default(true)
}

model PremiumServiceInquiry {
  id              String   @id @default(cuid())
  client_tenant_id String
  agent_id        String?  // 归属智能管家
  item_id         String
  status          String
  consulting_order_id String?
  created_at      DateTime @default(now())
}

enum AgentSubtype { AGENT_QUAL AGENT_TENDER AGENT_FIN AGENT_GENERAL }
enum DispatchStatus { created classified routing bidding selected in_service rated completed canceled escalated_to_tongqian }
```

## 3. 关键流程

详见 [`design-flows.md` §7 + §8](../00-project-overview/design-flows.md)。

## 4. 关键 API（截选，完整在 OpenAPI yaml）

```yaml
# 工作台
GET  /api/v1/agent/dashboard
GET  /api/v1/agent/me/profile
PUT  /api/v1/agent/me/profile

# 裂变
GET  /api/v1/agent/me/promo-code
GET  /api/v1/agent/me/fission-tree
POST /api/v1/agent/invitations            # 邀请新智能管家

# 分润 / 收益
GET  /api/v1/agent/commissions/me
GET  /api/v1/agent/referral-fees/me
GET  /api/v1/agent/withdrawals/me

# 派单
POST /api/v1/dispatches/classify
POST /api/v1/dispatches/:id/route
POST /api/v1/dispatches/:id/quotes
POST /api/v1/dispatches/:id/select        # 客户选定
POST /api/v1/dispatches/:id/takeover
POST /api/v1/dispatches/:id/rate-agent
POST /api/v1/dispatches/:id/rate-client

# 信誉
GET  /api/v1/agent/reputation/me
GET  /api/v1/agent/reputation/logs
POST /api/v1/reputation-logs/:id/appeal

# 客户
GET  /api/v1/agent/customers
GET  /api/v1/clients/:tenantId/reputation  # 仅接单智能管家

# 高端货架
GET  /api/v1/premium-services
POST /api/v1/premium-services/:id/inquire

# 联合品牌
POST /api/v1/co-brand/reports/:id/issue

# 排行
GET  /api/v1/agent/ranking?period=month&dim=commission|reputation
```

## 5. 错误码命名空间

`AGENT.*` / `DISPATCH.*` / `RATING.*` / `REPUTATION.*` / `APPEAL.*` / `REFP.*`

关键码：
- `AGENT.LEVEL_EXCEEDED` (422，三级裂变)
- `DISPATCH.NO_AGENT_MATCHED` (422)
- `DISPATCH.QUOTE_OVERPRICED` (warning，自动展示切到同乾方略)
- `RATING.WINDOW_EXPIRED` (422)
- `RATING.REQUIRED_BEFORE_SETTLE` (422)
- `REPUTATION.APPEAL.WINDOW_EXPIRED` (422)
- `REFP.AMOUNT_TIER3_REQUIRED_CONSULT` (200, with tier=3 card)

## 6. PBT 强制（[`design-protocols.md` §13.7](../00-project-overview/design-protocols.md)）

| 属性 | 函数 |
|---|---|
| 派单 A/B/C 分类 | classifier |
| 信誉分 ∈ [0, 1000] | score.service |
| 等级 ∈ {LV1..LV5} 单调 | level-resolver |
| 4 维加权 Top 3 顺序稳定 | scorer |
| 反向回滚还原性 | appeal + reversal |
| 报价标色 4 档（[`21`]）| ref-price |
| 跨域 5% 守恒 | cross-pool / [`09`] |
| 二级裂变封顶 | relation-builder |
| 联合品牌选择确定 | co-brand |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `dispatch.thresholds` | A/B/C 金额阈值 |
| `dispatch.weights` | 4 维权重（DOQ-001）|
| `referral_fee.rates.{type}` | 推荐费比例 |
| `referral_fee.freeze_days.{type}` | 冻结期 |
| `reputation.rules` | 加减分规则 |
| `reputation.levels` | 5 级阈值 |
| `agent.activity_thresholds` | 月活红线 |
| `premium.services` | 10 类高端服务 |

## 8. 关键设计权衡

| 决策 | 选择 | 理由 |
|---|---|---|
| 信誉变动 | 事件溯源 + 24h 缓冲 | [`design.md` §14.8](../00-project-overview/design.md) |
| 派单匹配 | 规则引擎 + 4 维加权 | [`design.md` §14.4](../00-project-overview/design.md) |
| 推荐费 vs 分润 | 共表（agent_commissions）+ type 区分 | DOQ-002 顶层倾向 |
| 客户信誉 | 挂 tenant 维度 | BR-105 / BR-333 |


---

## V4 升级·新增数据模型与服务（P3 / P7 补丁）

### V4.1 AI 客户预警卡（R10 实现）

#### 数据模型

```prisma
model AgentClientSignal {
  id           String   @id @default(cuid())
  agent_id     String   // 智能管家归属
  client_id    String   // 归属客户 tenant_id
  signal_type  AgentClientSignalType  // 6 类信号
  urgency      String   // red / yellow / green
  source_ref   String?  // 触发来源 ID（如 contract_id / qualification_id）
  message      String   // AI 生成简述
  expires_at   DateTime // 信号有效期
  pushed_at    DateTime @default(now())
  acted_at     DateTime?  // 智能管家是否已操作
  acted_action String?  // contact_initiated / dismissed / scheduled
  cooldown_until DateTime?  // 7 天不重复推送
  created_at   DateTime @default(now())

  @@index([agent_id, expires_at])
  @@index([client_id, signal_type])
}

enum AgentClientSignalType {
  TENDER_UPLOADED       // 客户上传招标文件
  QUAL_EXPIRING         // 资质快到期 < 60 天
  AR_OVERDUE            // 应收异常 ≥ 90 天
  TENDER_FAILED         // 投标失败
  PERFORMANCE_ADDED     // 业绩录入
  INACTIVE_RISK         // 长期不活跃 30 天
}
```

#### 服务结构

```
apps/api/src/modules/agent/client-alert/
├── client-alert.service.ts            # 6 类信号生成 + 推送
├── signal-detector.worker.ts          # cron 每天 6:00 扫描 6 类信号
├── alert-pusher.service.ts            # 推送至工作台首页 + 短信
└── alert-cooldown.service.ts          # 7 天不重复 + 3 月拒绝周期
```

#### 关键约束（V4 BR-325 红线 2）

- 智能管家"一键发起服务" → 调用 `actOnSignal(signal_id, action='contact_initiated')` → 标记 acted + 7 天 cooldown
- 客户拒绝接单 → 标记 acted + 3 月 cooldown
- 主动联系成功率纳入信誉分计算（reputation_logs 加分项 +5 / 单成单）

### V4.2 案例市场 UGC（R11 实现）

#### 数据模型

```prisma
model AgentCaseStudy {
  id              String   @id @default(cuid())
  agent_id        String
  title           String
  category        String   // qual_upgrade / tender_won / debt_collected / etc
  content         Json     // 脱敏后的案例内容
  status          AgentCaseStatus
  ai_review_score Decimal? // AI 自动审核打分
  ai_review_log   Json?    // 检测到的隐私残留 / 违规等
  expert_score    Decimal? // 专家审核打分（0-100）
  expert_review_at DateTime?
  expert_id       String?
  expert_comment  String?
  download_count  Int      @default(0)
  is_featured     Boolean  @default(false)  // 优质案例
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  @@index([agent_id, status])
  @@index([category, is_featured])
}

enum AgentCaseStatus {
  pending_ai_review   // AI 审核中
  pending_expert      // 专家审核中
  published           // 已上架
  rejected            // 被拒
}

model AgentCaseDownload {
  id          String   @id @default(cuid())
  case_id     String
  buyer_agent_id String   // 下载方
  paid_credits Int     // 扣点（默认 5 点）
  created_at  DateTime @default(now())
}
```

#### 服务结构

```
apps/api/src/modules/agent/case-market/
├── case-upload.service.ts             # 智能管家上传 + 自审承诺
├── case-ai-reviewer.service.ts        # AI 自动审核（脱敏 / 重复 / 违规）
├── case-expert-review.service.ts      # 专家审核工作台
├── case-marketplace.service.ts        # 浏览 / 搜索 / 下载
└── case-revenue.service.ts            # 上传方分润 5 点 / 次
```

### V4.3 智能管家服务协议合规（关联 28 spec R5）

```prisma
model AgentConsent {
  id            String   @id @default(cuid())
  agent_id      String   @unique
  protocol_version String  // v1 / v2 ...
  commitments   Json     // 5 项合规承诺勾选状态
  signed_at     DateTime
  ip            String
  user_agent    String
  
  @@index([agent_id, protocol_version])
}
```

5 项承诺：合规用工 / 真实业绩 / 平台内交易 / 客户隐私 / 接受裁决。
违反 → 立即清退 + 信誉一票否决 + 全网黑名单。

### V4.4 服务结构整体（22 spec V4 视图）

```
apps/api/src/modules/agent/
├── profile/                # AgentProfile / AgentRelation
├── workbench/              # 工作台首页（信誉 + 收益 + 客户预警 + 派单）
├── client-alert/           # V4 R10 客户预警卡
├── case-market/            # V4 R11 案例市场
├── consent/                # V4 5 项合规承诺
├── reputation/             # 信誉分（已有，BR-331-336）
├── commission/             # 分润 / 推荐费（已有，BR-301-305 + 313）
├── dispatch/               # 派单（已有，BR-307-311）
├── premium-shelf/          # 同乾方略服务货架（已有，BR-316）
├── academy/                # 智能管家学院 6 节培训
├── earnings-calendar/      # V4 S1 收益日历（每天 0:00 短信）
├── client-health-dashboard/ # V4 S2 客户健康度仪表
└── appeal/                 # 申诉（已有，BR-314 / 335）
```


---

## V4 IMPROVEMENTS · 智能管家代理人 PARTNER 实现

### V4-IMP.1 数据模型

```prisma
enum AgentSubtype {
  AGENT_QUAL
  AGENT_TENDER
  AGENT_FIN
  AGENT_GENERAL
  AGENT_PARTNER  // V4 IMPROVEMENTS 新增（二期 M4 启用）
}

model AgentReferral {
  id              String   @id @default(cuid())
  partner_id      String   // PARTNER 推荐者
  referred_user_id String  // 被推荐用户
  referred_type   String   // building_company / agent / tongqian_consult
  status          String   // pending / active / expired / refunded
  activated_at    DateTime?
  total_commission Decimal  @default(0)  // 累计分润
  expires_at      DateTime  // 30 天必须激活否则失效
  created_at      DateTime @default(now())
  
  @@index([partner_id, status])
  @@unique([referred_user_id, referred_type])  // 防多推荐者抢同客户
}

model AgentReferralCommission {
  id           String   @id @default(cuid())
  referral_id  String
  commission_type String  // subscription_y1_5pct / topup_3pct / agent_5pct / tongqian_5pct
  base_amount  Decimal  // 客户付的钱
  commission   Decimal  // 5% 或 3%
  status       String   // frozen / settlable / paid
  created_at   DateTime @default(now())
}

model PartnerReputation {
  id           String   @id @default(cuid())
  partner_id   String   @unique
  referral_count Int    @default(0)
  active_rate  Decimal  @default(0)  // 推荐成功率
  monthly_active_rate Decimal @default(0)
  paid_rate    Decimal  @default(0)
  complaint_count Int   @default(0)
  is_blacklisted Boolean @default(false)
  updated_at   DateTime @updatedAt
}
```

### V4-IMP.2 服务结构

```
apps/api/src/modules/agent/partner/
├── partner-registration.service.ts    # PARTNER 注册（无 training 阶段）
├── referral-tracking.service.ts        # 3 类推荐链追踪
├── commission-calculator.service.ts    # 5%/3%/5%/5% 分润计算
├── activation-checker.worker.ts        # 30 天激活检测 + 失效
├── anti-fraud.service.ts               # 5 维去重 + 限额（年 50 老板 + 20 智能管家）
├── partner-reputation.service.ts        # 独立信誉计算
└── partner-workbench.controller.ts      # 工作台 UI
```

### V4-IMP.3 PARTNER vs 接单类对比表

| 维度 | 接单类（QUAL/TENDER/FIN/GENERAL）| PARTNER |
|---|---|---|
| 培训 | 强制 6 节 | 不强制 |
| 接派单 | ✅ | ❌ |
| 客户预警卡 | ✅ R10 | ❌ |
| 案例市场 | ✅ R11 | ❌ |
| 收益日历 S1 | ✅ | ✅（仅推荐分润）|
| 客户健康度仪表 S2 | ✅ | ❌ |
| 信誉分基数 | 500 / LV2 | 0 / 独立计算 |
| 报价上限 | 派单参考价 ±200% | 不接单不报价 |
| 提现速度 | LV1 T+30 ~ LV5 T+0 | T+30（统一） |
| 工作台 UI | apps/agent 全部模块 | 仅推荐 + 分润页 |

### V4-IMP.4 分润流向示例

```
场景：PARTNER 老王推荐建筑老板张总
   ↓
   张总注册 → 30 天内调用 ≥ 100 点 → referral 状态 active
   ↓
   张总付月费 ¥199（首年）
   ↓
   分润流向：
     - 老王（PARTNER）拿 5% × ¥199 = ¥9.95
     - 张总没归属智能管家 → 归属那 30% 进入"待派单库"
     - 张总产生资质需求 → 派给智能管家小李 → 小李成为归属
     - 后续小李拿 30% × ¥199 = ¥59.7（覆盖未来订阅）
   - 平台净拿 = 100% - 5% - 30% = 65%
   
   总和不超 100%，与 BR-302 自洽。
```
