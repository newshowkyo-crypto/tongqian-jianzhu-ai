CREATE TABLE "carbon_factors" (
  "id" TEXT NOT NULL,
  "material" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "factor_value" DECIMAL(20,4) NOT NULL,
  "source_notes" TEXT,
  CONSTRAINT "carbon_factors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "carbon_estimates" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "area_sqm" DOUBLE PRECISION NOT NULL,
  "material_items" JSONB NOT NULL,
  "total_kg_co2e" DECIMAL(20,2) NOT NULL,
  "per_sqm_kg_co2e" DECIMAL(20,2) NOT NULL,
  "benchmark_per_sqm_kg_co2e" DECIMAL(20,2),
  "deviation_pct" DOUBLE PRECISION,
  "ai_suggestions" JSONB NOT NULL,
  "disclaimer" TEXT NOT NULL,
  CONSTRAINT "carbon_estimates_pkey" PRIMARY KEY ("id")
);
