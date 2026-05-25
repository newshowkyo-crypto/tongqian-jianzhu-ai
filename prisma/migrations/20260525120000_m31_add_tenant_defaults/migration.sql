ALTER TABLE "legal_corpus" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
CREATE INDEX IF NOT EXISTS "legal_corpus_tenant_id_idx" ON "legal_corpus"("tenant_id");

ALTER TABLE "cost_catalogs" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE "cost_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE "rfp_chunks" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';
CREATE INDEX IF NOT EXISTS "cost_catalogs_tenant_id_idx" ON "cost_catalogs"("tenant_id");
CREATE INDEX IF NOT EXISTS "cost_items_tenant_id_idx" ON "cost_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "rfp_chunks_tenant_id_idx" ON "rfp_chunks"("tenant_id");

ALTER TABLE "historical_project_costs" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "budget_estimates" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "rough_quantity_estimates" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "payment_ledgers" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "change_orders" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "claim_records" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "carbon_estimates" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';
ALTER TABLE "project_schedules" ALTER COLUMN "tenant_id" SET DEFAULT 'platform';

ALTER TABLE "site_photos" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE "task_comments" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT NOT NULL DEFAULT 'platform';

CREATE INDEX IF NOT EXISTS "rough_quantity_estimates_tenant_id_idx" ON "rough_quantity_estimates"("tenant_id");
CREATE INDEX IF NOT EXISTS "carbon_estimates_tenant_id_idx" ON "carbon_estimates"("tenant_id");
CREATE INDEX IF NOT EXISTS "project_tasks_tenant_id_idx" ON "project_tasks"("tenant_id");
CREATE INDEX IF NOT EXISTS "task_comments_tenant_id_idx" ON "task_comments"("tenant_id");
CREATE INDEX IF NOT EXISTS "project_schedules_tenant_id_idx" ON "project_schedules"("tenant_id");
CREATE INDEX IF NOT EXISTS "site_photos_tenant_id_idx" ON "site_photos"("tenant_id");
