CREATE TABLE "receivables" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "debtor_name" TEXT NOT NULL,
  "amount" DECIMAL(15, 2) NOT NULL,
  "invoice_date" TIMESTAMP(3) NOT NULL,
  "due_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "age_bucket" TEXT NOT NULL,
  "meta" JSONB
);

CREATE INDEX "receivables_tenant_id_due_date_idx" ON "receivables" ("tenant_id", "due_date");

CREATE TABLE "aging_analyses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "total_amount" DECIMAL(15, 2) NOT NULL,
  "by_bucket" JSONB NOT NULL,
  "high_risk_total" DECIMAL(15, 2) NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE,
  "report_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "aging_analyses_tenant_id_created_at_idx" ON "aging_analyses" ("tenant_id", "created_at");

CREATE TABLE "cashflow_forecasts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "forecast_period" TEXT NOT NULL,
  "monthly_data" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "cashflow_forecasts_tenant_id_created_at_idx" ON "cashflow_forecasts" ("tenant_id", "created_at");

CREATE TABLE "financing_diagnoses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "available_types" JSONB NOT NULL,
  "estimated_amounts" JSONB NOT NULL,
  "preparation_steps" JSONB NOT NULL,
  "recommended_path" TEXT NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE,
  "report_id" TEXT
);

CREATE INDEX "financing_diagnoses_tenant_id_idx" ON "financing_diagnoses" ("tenant_id");
