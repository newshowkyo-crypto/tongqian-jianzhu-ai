CREATE TABLE "rough_estimates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "project_type" TEXT NOT NULL,
  "area_sqm" DECIMAL(12, 2) NOT NULL,
  "region" TEXT NOT NULL,
  "structure_type" TEXT NOT NULL,
  "decoration" TEXT NOT NULL,
  "per_sqm_low" DECIMAL(12, 2) NOT NULL,
  "per_sqm_high" DECIMAL(12, 2) NOT NULL,
  "total_low" DECIMAL(15, 2) NOT NULL,
  "total_high" DECIMAL(15, 2) NOT NULL,
  "comparable_projects" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "rough_estimates_tenant_id_region_project_type_idx" ON "rough_estimates" ("tenant_id", "region", "project_type");

CREATE TABLE "checklist_reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "source_file_url" TEXT NOT NULL,
  "findings" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE
);

CREATE INDEX "checklist_reviews_tenant_id_idx" ON "checklist_reviews" ("tenant_id");

CREATE TABLE "material_prices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "region" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "spec" TEXT,
  "unit" TEXT NOT NULL,
  "price" DECIMAL(12, 2) NOT NULL,
  "source" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "material_prices_material_code_region_date_idx" ON "material_prices" ("material_code", "region", "date");

CREATE TABLE "material_price_alerts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "threshold_pct" DECIMAL(5, 2) NOT NULL
);

CREATE UNIQUE INDEX "material_price_alerts_tenant_id_material_code_region_key" ON "material_price_alerts" ("tenant_id", "material_code", "region");
