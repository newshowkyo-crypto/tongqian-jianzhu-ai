CREATE TABLE "historical_project_costs" (
  "id" UUID NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "project_type" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "area_sqm" DOUBLE PRECISION NOT NULL,
  "total_cost_cny" DECIMAL(20,2) NOT NULL,
  "unit_cost_cny_per_sqm" DECIMAL(20,2) NOT NULL,
  "breakdown" JSONB NOT NULL,
  "completed_at" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  CONSTRAINT "historical_project_costs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "historical_project_costs_tenant_id_project_type_region_idx" ON "historical_project_costs"("tenant_id", "project_type", "region");
