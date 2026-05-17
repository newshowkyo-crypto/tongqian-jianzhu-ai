# 11 经营机会雷达 - Design

## 1. 模块结构

```
apps/api/src/modules/opportunity/
├── opportunity.module.ts
├── opportunity.service.ts
├── opportunity.controller.ts
├── radar/
│   ├── matcher.service.ts            # 客户偏好 ↔ 机会匹配
│   └── push.worker.ts                # 每日 08:00 cron 推送
├── investability/                    # AI 可投性评分
│   ├── investability.service.ts
│   └── prompts/investability.ts      # PromptTemplate（含 tier 函数）
├── owner-verify/                     # 业主真假性
│   ├── verify.service.ts
│   └── data-fetcher.service.ts       # 调用 [`20`] 知识库
├── owner-profile/                    # 业主画像
│   └── profile.service.ts
├── peer-radar/                       # 同行雷达
│   └── peer-radar.service.ts
└── pricing/
    └── recommended-price.service.ts  # 推荐报价区间
```

## 2. 数据模型

```prisma
model Opportunity {
  id              String   @id @default(cuid())
  source          String   // 招标公示 / 政府投资 / 央企新增 等
  region          String   // 省市区
  industry        String   // 房建 / 市政 / 公路 / ...
  amount_estimate Decimal  @db.Decimal(15,2)
  owner_name      String
  owner_credit_code String?
  publish_date    DateTime
  deadline        DateTime?
  raw_url         String?
  raw_text        String?  @db.Text
  meta            Json?
  created_at      DateTime @default(now())
  @@index([region, industry, amount_estimate])
}

model OpportunityPreference {
  id              String   @id @default(cuid())
  tenant_id       String   @unique
  regions         Json     // ["湖北", "湖南"]
  industries      Json
  amount_min      Decimal? @db.Decimal(15,2)
  amount_max      Decimal? @db.Decimal(15,2)
  push_enabled    Boolean  @default(true)
}

model OpportunityMatch {
  id              String   @id @default(cuid())
  tenant_id       String
  opportunity_id  String
  pushed_at       DateTime @default(now())
  read_at         DateTime?
  bookmarked      Boolean  @default(false)
  @@unique([tenant_id, opportunity_id])
}

model InvestabilityReport {
  id              String   @id @default(cuid())
  tenant_id       String
  opportunity_id  String
  score           Int
  funding_score   Int
  qualification_score Int
  relationship_score  Int
  performance_score   Int
  ai_task_id      String   @unique
  report_id       String?  // 关联 [`10`] Report
  created_at      DateTime @default(now())
}

model OwnerVerifyResult {
  id              String   @id @default(cuid())
  owner_credit_code String
  status          String   // pass / warning / high_risk
  evidence        Json
  cached_until    DateTime
  @@unique([owner_credit_code])
}
```

## 3. PromptTemplate 示例

```ts
export const InvestabilityPrompt: PromptTemplate = {
  taskType: AiTaskType.OPP_INVESTABILITY,
  version: 'v1',
  primaryModel: 'qwen-max',
  fallbackModel: 'deepseek-v3',
  needsSanitize: false,  // 国产模型
  cost: 800,
  tier: (ctx) => {
    if (ctx.projectAmount < 10_000_000) return 1;
    if (ctx.projectAmount < 50_000_000) return 2;
    return 3;
  },
  inputSchema: InvestabilityInputSchema,
  outputSchema: InvestabilityOutputSchema.merge(RequiredElementsSchema),
  systemPrompt: `你是建筑业资深商务顾问...`,
  userTemplate: `<opportunity>{{opportunity}}</opportunity><company>{{company}}</company>`,
  fewShotExamples: [...],
  fallbackText: 'AI 暂时无法处理本次请求...',
  safetyChecks: ['no_political'],
};
```

## 4. 关键 API

```yaml
GET  /api/v1/opportunities                # 列表（按偏好过滤）
GET  /api/v1/opportunities/:id
POST /api/v1/opportunities/:id/investability   # 触发 AI 评分（异步）
GET  /api/v1/opportunities/:id/owner-verify    # 业主核验
GET  /api/v1/opportunities/:id/owner-profile
GET  /api/v1/opportunities/:id/peer-radar
GET  /api/v1/opportunities/:id/recommended-price
GET  /api/v1/preferences                  # 我的偏好
PUT  /api/v1/preferences
POST /api/v1/opportunities/:id/bookmark
```

## 5. 错误码

`OPP.*`：
- `OPP.NOT_FOUND` (404)
- `OPP.PREFERENCE.INVALID` (400)
- `OPP.OWNER_VERIFY.UNAVAILABLE` (502)

## 6. PBT

| 属性 | 函数 |
|---|---|
| 推送上限 5 条/日 | `radar/push.worker` |
| 4 维评分 ∈ [0, 100] | `investability` |
| Tier 解析单调 | PromptTemplate.tier |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `opportunity.daily_push_limit` | 默认 5 |
| `opportunity.investability.tier_thresholds` | 1000w / 5000w |
| `opportunity.owner_verify_cache_days` | 默认 30 |


---

## V4 升级·机会雷达精细化（R9-R13 设计）

### V4.1 老板视角实现

```
apps/api/src/modules/opportunity-radar/
├── daily-push/
│   ├── opportunity-pusher.worker.ts   # 每天 8:00 推送 5 个匹配机会
│   ├── matcher.service.ts              # 关注地区 + 业务线 + 金额匹配
│   └── card-renderer.service.ts        # 机会卡 UI 渲染（含雷达图）
├── investability/
│   ├── score-calculator.service.ts     # 0-100 分 + 4 维（资金/资质/关系/业绩）
│   ├── tier-router.service.ts          # < 1000w T1 / 1000-5000w T2 / ≥ 5000w T3
│   └── radar-data.service.ts           # 雷达图数据
├── owner-verification/
│   ├── reality-check.service.ts        # 真假性核验（信用中国 + gsxt + 裁判文书网）
│   └── credit-score.service.ts          # 业主资信打分
├── peer-radar/
│   └── peer-radar.service.ts           # 同行雷达 + 推荐报价
├── blind-box/
│   └── tender-blind-box.service.ts     # 招标盲盒（5 个机会 + 评分）
└── follow/
    └── follow-tracker.service.ts        # 收藏 + 招标变更提醒
```

### V4.2 智能管家视角

复用 22-spec AgentClientSignal `TENDER_UPLOADED` 信号：客户上传招标文件 → 智能管家收到预警卡。

### V4.3 政企视角

复用 23-spec 项目寻源（双向脱敏）。

### V4.4 5 档订阅功能墙

实施位置：`subscription-feature-wall.service.ts`（07 spec 集成），按档位限制每日推送数 / 关注地区数 / 业主核验次数等。
