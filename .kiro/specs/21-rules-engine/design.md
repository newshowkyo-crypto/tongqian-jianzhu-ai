# 21 规则引擎 + 参考价库 - Design

## 1. 模块结构

```
apps/api/src/modules/rules-engine/
├── qualification-rules/
│   ├── qual-rule.service.ts
│   └── qual-rule.repo.ts
├── contract-rules/
│   └── contract-rule.service.ts
├── tender-rules/
│   └── tender-rule.service.ts
├── reference-prices/
│   ├── ref-price.service.ts
│   └── ref-price.controller.ts
├── extractor/
│   └── rule-extractor.service.ts     # AI 从 [`20`] 政策原文抽规则
└── review/
    └── rule-review.service.ts
```

## 2. 数据模型

```prisma
model QualificationRule {
  id              String   @id @default(cuid())
  category        String
  from_level      String?
  to_level        String
  requirements    Json     // {performances: [...], personnel: [...], equipment: [...]}
  source_policy_id String?
  version         Int
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
}

model ContractRule {
  id              String   @id @default(cuid())
  type            String   // 6 大类型
  trigger         Json     // {keywords:[...], amount_threshold:..., clause_structure:...}
  risk_level      String
  suggestion      String
  standard_wording String   @db.Text
  source_clause_id String?
  version         Int
  is_active       Boolean  @default(true)
}

model TenderRule {
  id              String   @id @default(cuid())
  industry        String
  scoring_item    String
  weight_pct      Decimal
  trap_warnings   Json
  bid_strategy    Json
  version         Int
  is_active       Boolean  @default(true)
}

model ReferencePrice {
  id              String   @id @default(cuid())
  service_type    String   // 'qualification.upgrade.2to1' / 'tender_writing.0to1000w' / ...
  region          String?
  amount_low      Decimal  @db.Decimal(15,2)
  amount_high     Decimal  @db.Decimal(15,2)
  data_source     String   // expert / historical
  sample_count    Int?
  updated_at      DateTime @default(now())
  is_active       Boolean  @default(true)
  @@index([service_type, region])
}

model RuleVersion {
  id              String   @id @default(cuid())
  rule_table      String
  rule_id         String
  version         Int
  snapshot        Json
  changed_by      String
  change_reason   String
  created_at      DateTime @default(now())
}
```

## 3. 报价标色（PBT 强制）

```ts
class RefPriceService {
  /**
   * PBT 属性：
   * - quote ≤ ref_high*1.0 → green
   * - 1.0 < ratio ≤ 1.5 → yellow
   * - 1.5 < ratio ≤ 2.0 → red
   * - ratio > 2.0 → over (超价)
   */
  classify(quote: Decimal, refHigh: Decimal): 'green' | 'yellow' | 'red' | 'over' {
    const ratio = quote.div(refHigh);
    if (ratio.lte(1.0)) return 'green';
    if (ratio.lte(1.5)) return 'yellow';
    if (ratio.lte(2.0)) return 'red';
    return 'over';
  }
}
```

## 4. 关键 API

```yaml
GET  /api/v1/qualification-rules       # 内部，被 [`14`] 用
GET  /api/v1/contract-rules            # 内部，被 [`13`] 用
GET  /api/v1/tender-rules              # 内部，被 [`12`] 用
GET  /api/v1/reference-prices?service_type=...&region=...
POST /api/v1/admin/rules/extract       # 从 [`20`] 抽取
POST /api/v1/admin/rules/:id/review    # 专家审核
GET  /api/v1/admin/rules/:id/versions  # 版本历史
```

## 5. 错误码 `RULE.*` / `REFP.*`

- `RULE.NOT_FOUND` (404)
- `RULE.VERSION_CONFLICT` (409)
- `REFP.NOT_FOUND` (404, fallback 用 expert default)

## 6. PBT 强制

| 属性 | 函数 |
|---|---|
| 报价标色 4 档 | RefPrice.classify |
| 仅 is_active 进入业务查询 | services |
| 版本回滚还原性 | RuleVersion |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `rules.refprice.color_thresholds` | [1.0, 1.5, 2.0] |
| `rules.qualification.active_version` | 当前活跃版本号 |
