# 13 风险审查 - Design

## 1. 模块结构

```
apps/api/src/modules/risk-review/
├── risk-review.module.ts
├── contract-review/
│   ├── basic.service.ts
│   ├── pro.service.ts
│   └── prompts/
│       ├── contract-review-basic.ts
│       └── contract-review-pro.ts        # tier(ctx) by amount
├── tender-review/
│   └── tender-risk.service.ts
├── modification-letter/
│   ├── letter.service.ts
│   └── prompts/modification-letter.ts
├── claim-strategy/
│   ├── claim.service.ts
│   └── prompts/claim-strategy.ts
└── rules-bridge/
    └── rule-fetcher.service.ts            # 调 [`21-rules-engine`]
```

## 2. 数据模型

```prisma
model ContractReview {
  id              String   @id @default(cuid())
  tenant_id       String
  user_id         String
  type            String   // basic / pro
  contract_url    String
  contract_type   String   // 总承包 / 分包 / 采购 / 监理 / ...
  project_amount  Decimal? @db.Decimal(15,2)
  ai_task_id      String   @unique
  report_id       String?
  overall_risk    String   // red / yellow / green
  finding_count   Int
  red_count       Int
  yellow_count    Int
  green_count     Int
  status          String
  created_at      DateTime @default(now())
}

model ContractRiskFinding {
  id              String   @id @default(cuid())
  review_id       String
  level           String   // red / yellow / green
  type            String   // 6 大类型 enum
  clause_no       String?
  clause_text     String   @db.Text
  impact          String
  suggestion      String
  standard_wording String?
  rule_id         String?  // 关联 [`21`] 规则
}

model ModificationLetter {
  id              String   @id @default(cuid())
  review_id       String   @unique
  ai_task_id      String   @unique
  pdf_url         String?
  content         String   @db.Text
  created_at      DateTime @default(now())
}

model ClaimStrategy {
  id              String   @id @default(cuid())
  contract_review_id String?
  facts           Json
  evidence_list   Json
  steps           Json
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}
```

## 3. PromptTemplate 关键约束

- `contract.review.basic`：固定 T1（≤ 30s 返回，扣 300 点）
- `contract.review.pro`：tier(ctx) by `projectAmount`（< 1000w T1 / 1000-5000w T2 / ≥ 5000w T3，扣 1500 点）
- `tender.risk`：固定 T1（项目阶段未签，先做风险提示）
- `modification.letter`：tier(ctx) 同 contract.review.pro
- `claim.strategy`：tier(ctx) by `projectAmount + isLitigation`（涉诉 → T4）
- 所有输出强制 4 要素

## 4. 关键 API

```yaml
POST /api/v1/contract-reviews              # type=basic / pro
GET  /api/v1/contract-reviews/:id
POST /api/v1/contract-reviews/:id/modification-letter
POST /api/v1/tender-reviews
POST /api/v1/claim-strategies              # 索赔策略
```

## 5. 错误码

`CONTRACT.*`：
- `CONTRACT.FILE.TOO_LARGE` (413)
- `CONTRACT.PARSE.FAILED` (502)
- `CONTRACT.LITIGATION.HUMAN_TAKEOVER` (200 with tier=4 card)

## 6. PBT

| 属性 | 函数 |
|---|---|
| Tier 解析单调 | PromptTemplate.tier |
| 涉诉强制 T4 | claim.strategy |
| 6 大风险类型枚举完整 | finding.level + type |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `risk-review.contract.basic.cost` | 默认 300 |
| `risk-review.contract.pro.cost` | 默认 1500 |
| `risk-review.tier_thresholds` | 1000w / 5000w |


---

## V4 升级·合同审查精细化（R8-R13 设计）

### V4.1 服务结构

```
apps/api/src/modules/risk-review/
├── owner-quick-review/
│   ├── thirty-second-review.service.ts # 30 秒老板版（< 1000w 300 点 / 1000-5000w 500 点）
│   ├── h5-card-renderer.service.ts     # H5 风险卡（≤ 3 屏）
│   └── color-coded-finding.service.ts   # 红黄绿色码 5 关键发现
├── pro-detail-review/
│   ├── five-min-pdf.service.ts          # 5 分钟详细版 PDF（1500 点）
│   ├── modification-letter.service.ts   # 修改意见函（可直接发对方）
│   └── standard-clause-ref.service.ts   # 标准条款参考
├── tender-doc-risk/
│   └── tender-risk-review.service.ts    # 招标文件风险审查 800 点
├── claim-strategy/
│   └── claim-strategy.service.ts        # 索赔策略（T2 起 1000 点）
├── legal-staff-tools/
│   ├── legal-workbench.controller.ts    # 法务工作台
│   ├── batch-review.service.ts          # 批量审查
│   ├── monthly-review.service.ts        # 月度风险体检 500 点
│   └── consult-chat.service.ts           # 法律咨询对话 100 点 / 轮
└── 6-risk-types/
    └── risk-type-detector.service.ts    # 6 大风险类型识别
```

6 大风险：无限连带 / 工期违约金过高 / 付款节点 / 业主单方解除 / 不合理变更 / 知识产权过分约束。

### V4.2 政企版强制约束

```typescript
// gov-enforcement.service.ts
function enforceGovRules(req: ContractReviewRequest, ctx: TenantContext) {
  if (ctx.tenantType === 'GOV') {
    req.modelOverride = 'qwen-max'; // 强制国产
    req.watermarkRequired = true;   // 强制水印
    if (req.amount >= 10_000_000 || req.litigationFlag) {
      throw new BusinessError('CONTRACT.REVIEW.MUST_HUMAN_TAKEOVER');
    }
  }
}
```
