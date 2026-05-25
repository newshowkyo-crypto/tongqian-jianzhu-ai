CREATE TABLE "quantity_indicators" (
  "id" TEXT NOT NULL,
  "project_type" TEXT NOT NULL,
  "structure_type" TEXT NOT NULL,
  "work_item" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "coefficient" DECIMAL(20,6) NOT NULL,
  "source_notes" TEXT,
  CONSTRAINT "quantity_indicators_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rough_quantity_estimates" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "area_sqm" DOUBLE PRECISION NOT NULL,
  "project_type" TEXT NOT NULL,
  "structure_type" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "total_cny" DECIMAL(20,2) NOT NULL,
  "ai_analysis" TEXT,
  CONSTRAINT "rough_quantity_estimates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "quantity_indicators_project_type_structure_type_work_item_key" ON "quantity_indicators"("project_type", "structure_type", "work_item");
