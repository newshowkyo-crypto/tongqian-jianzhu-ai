CREATE TABLE "baseline_unit_costs" (
  "id" TEXT NOT NULL,
  "project_type" TEXT NOT NULL,
  "structure_type" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "base_cny_per_sqm" DECIMAL(20,2) NOT NULL,
  "base_year" INTEGER NOT NULL DEFAULT 2026,
  "source_notes" TEXT,
  CONSTRAINT "baseline_unit_costs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budget_estimates" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "area_sqm" DOUBLE PRECISION NOT NULL,
  "project_type" TEXT NOT NULL,
  "structure_type" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "quality_level" TEXT NOT NULL,
  "planned_start" TIMESTAMP(3),
  "baseline_cny" DECIMAL(20,2) NOT NULL,
  "coefficients" JSONB NOT NULL,
  "estimate_low_cny" DECIMAL(20,2) NOT NULL,
  "estimate_mid_cny" DECIMAL(20,2) NOT NULL,
  "estimate_high_cny" DECIMAL(20,2) NOT NULL,
  "ai_analysis" TEXT,
  "confidence" DOUBLE PRECISION NOT NULL,
  "disclaimer" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budget_estimates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "baseline_unit_costs_project_type_structure_type_region_base_year_key" ON "baseline_unit_costs"("project_type", "structure_type", "region", "base_year");
CREATE INDEX "budget_estimates_tenant_id_created_at_idx" ON "budget_estimates"("tenant_id", "created_at");
