# 19 现金流 / 融资 - Design

## 1. 模块结构

```
apps/api/src/modules/cashflow-finance/
├── receivables/
│   ├── receivables.service.ts
│   ├── aging-analyzer.service.ts
│   └── prompts/aging-analysis.ts
├── cashflow-forecast/
│   ├── forecast.service.ts
│   └── prompts/forecast.ts
├── financing-diagnosis/
│   ├── diagnosis.service.ts
│   └── prompts/financing.ts
├── alert/
│   └── cashflow-alert.worker.ts
└── dispatch-trigger/
    └── finance-dispatch.service.ts
```

## 2. 数据模型

```prisma
model Receivable {
  id              String   @id @default(cuid())
  tenant_id       String
  debtor_name     String
  amount          Decimal  @db.Decimal(15,2)
  invoice_date    DateTime
  due_date        DateTime
  status          String
  age_bucket      String   // <30 / 30-60 / 60-90 / 90-180 / 180+
  meta            Json?
  @@index([tenant_id, due_date])
}

model AgingAnalysis {
  id              String   @id @default(cuid())
  tenant_id       String
  total_amount    Decimal
  by_bucket       Json
  high_risk_total Decimal
  ai_task_id      String   @unique
  report_id       String?
  created_at      DateTime @default(now())
}

model CashflowForecast {
  id              String   @id @default(cuid())
  tenant_id       String
  forecast_period String   // 'next_12_months'
  monthly_data    Json
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model FinancingDiagnosis {
  id              String   @id @default(cuid())
  tenant_id       String
  available_types Json
  estimated_amounts Json
  preparation_steps Json
  recommended_path String   // self_apply / agent_help / tongqian_consult
  ai_task_id      String   @unique
  report_id       String?
}
```

## 3. PromptTemplate

- `cash.aging_analysis`：tier(ctx) by `total_amount`：< 500w T1 / 500-2000w T2 / ≥ 2000w T3
- `cash.cashflow_forecast`：T1
- `cash.financing_diagnosis`：tier(ctx) by `credit_amount`：< 5000w T2 / ≥ 5000w T3；ABS/REITs/化债 → 强制 T3 + 自动 B 类
- 强制 4 要素

## 4. 关键 API

```yaml
POST /api/v1/receivables/import          # Excel 上传
GET  /api/v1/receivables
POST /api/v1/aging-analysis              # 触发分析
POST /api/v1/cashflow-forecast
POST /api/v1/financing-diagnosis
GET  /api/v1/financing-recommendations   # 推荐智能管家 / 同乾方略
```

## 5. 错误码 `CASH.*`

- `CASH.RECEIVABLES.IMPORT_FAILED` (502)
- `CASH.FINANCING.AMOUNT_TIER3_REQUIRED_CONSULT` (200, with tier=3 card)

## 6. PBT

| 属性 | 函数 |
|---|---|
| Tier 解析单调 | aging-analysis / financing-diagnosis |
| 账龄分桶完整 | aging-analyzer |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `cash.aging.tier_thresholds` | 500w / 2000w |
| `cash.financing.tier_thresholds` | 5000w |
| `cash.alert.consecutive_months_negative` | 默认 3 |
