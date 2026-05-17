# 17 造价 / 预算粗判 - Design

## 1. 模块结构

```
apps/api/src/modules/cost-estimate/
├── rough-estimate/
│   ├── estimate.service.ts
│   └── prompts/rough-estimate.ts
├── checklist-review/
│   ├── checklist.service.ts
│   └── prompts/checklist-review.ts
├── pricing-helper/
│   └── pricing.service.ts
└── material-price/
    ├── price.service.ts
    └── alert.worker.ts            # 价格预警
```

## 2. 数据模型

```prisma
model RoughEstimate {
  id              String   @id @default(cuid())
  tenant_id       String
  project_type    String
  area_sqm        Decimal
  region          String
  structure_type  String
  decoration      String
  per_sqm_low     Decimal
  per_sqm_high    Decimal
  total_low       Decimal
  total_high      Decimal
  comparable_projects Json
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model ChecklistReview {
  id              String   @id @default(cuid())
  tenant_id       String
  source_file_url String
  findings        Json
  ai_task_id      String   @unique
}

model MaterialPrice {
  id              String   @id @default(cuid())
  region          String
  material_code   String   // 钢筋 / 水泥 / ...
  spec            String?
  unit            String
  price           Decimal
  source          String   // 信息价 / 市场价
  date            DateTime
  @@index([material_code, region, date])
}

model MaterialPriceAlert {
  id              String   @id @default(cuid())
  tenant_id       String
  material_code   String
  region          String
  threshold_pct   Decimal  // 默认 5%
}
```

## 3. PromptTemplate

- `cost.rough_estimate`：T1，强制免责（±20%-30%）
- `cost.checklist_review`：T1
- `cost.pricing.recommend`：T1

## 4. 关键 API

```yaml
POST /api/v1/cost/rough-estimate
POST /api/v1/cost/checklist-review
POST /api/v1/cost/pricing-recommend
GET  /api/v1/cost/material-prices?region=...&material_code=...
PUT  /api/v1/cost/material-alerts
```

## 5. 错误码 `COST.*` / `KB.*`

## 6. 后台覆盖

| key | 内容 |
|---|---|
| `cost.rough_estimate.precision_band` | 默认 [-0.2, 0.3] |
| `cost.material_alert_default_threshold` | 默认 5% |
