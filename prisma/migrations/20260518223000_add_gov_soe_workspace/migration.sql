CREATE TABLE "gov_project_sourcings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "publisher_tenant_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "amount_estimate" DECIMAL(15, 2),
  "masked_summary" TEXT NOT NULL,
  "contact_revealed" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL,
  "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "gov_project_sourcings_region_industry_status_idx" ON "gov_project_sourcings" ("region", "industry", "status");

CREATE TABLE "gov_document_drafts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "doc_type" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "gov_document_drafts_tenant_id_created_at_idx" ON "gov_document_drafts" ("tenant_id", "created_at");

CREATE TABLE "gov_consult_intents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "amount_estimate" DECIMAL(15, 2),
  "status" TEXT NOT NULL,
  "consulting_order_id" TEXT,
  "assigned_consult_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "gov_consult_intents_tenant_id_status_idx" ON "gov_consult_intents" ("tenant_id", "status");

CREATE TABLE "policy_funds" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "category" TEXT NOT NULL,
  "name_zh" TEXT NOT NULL,
  "name_short" TEXT NOT NULL,
  "authority" TEXT NOT NULL,
  "scope" TEXT[] NOT NULL,
  "amount_pool" TEXT,
  "apply_window" JSONB,
  "evaluation_points" JSONB NOT NULL,
  "doc_links" TEXT[] NOT NULL,
  "ai_summary" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "province" TEXT,
  "rollout_pct" INTEGER NOT NULL DEFAULT 0,
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "policy_funds_category_status_idx" ON "policy_funds" ("category", "status");
