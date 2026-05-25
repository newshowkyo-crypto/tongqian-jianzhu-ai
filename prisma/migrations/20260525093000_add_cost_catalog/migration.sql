CREATE TABLE "cost_catalogs" (
  "id" UUID NOT NULL,
  "catalog_code" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'zh-CN',
  "source_license" TEXT NOT NULL,
  "source_url" TEXT,
  "imported_at" TIMESTAMP(3),
  "item_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cost_catalogs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cost_items" (
  "id" UUID NOT NULL,
  "catalog_id" UUID NOT NULL,
  "class_code" TEXT NOT NULL,
  "work_code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "description_en" TEXT,
  "unit" TEXT NOT NULL,
  "labor_cost" DECIMAL(20,4),
  "material_cost" DECIMAL(20,4),
  "machinery_cost" DECIMAL(20,4),
  "overhead_cost" DECIMAL(20,4),
  "total_unit_price" DECIMAL(20,4),
  "labor_hours" DECIMAL(20,4),
  "keywords" TEXT[],
  "embedding" BYTEA,
  CONSTRAINT "cost_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cost_catalogs_catalog_code_key" ON "cost_catalogs"("catalog_code");
CREATE INDEX "cost_items_catalog_id_class_code_idx" ON "cost_items"("catalog_id", "class_code");
CREATE INDEX "cost_items_work_code_idx" ON "cost_items"("work_code");
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "cost_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
