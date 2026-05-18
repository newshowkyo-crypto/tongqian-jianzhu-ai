CREATE TABLE "policies" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "topics" JSONB NOT NULL,
  "publish_org" TEXT NOT NULL,
  "publish_date" TIMESTAMP(3) NOT NULL,
  "raw_text" TEXT NOT NULL,
  "ai_summary" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "vector_id" TEXT,
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "policies_status_publish_date_idx" ON "policies" ("status", "publish_date");

CREATE TABLE "performances" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_url" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "amount" DECIMAL(15, 2) NOT NULL,
  "winner_company" TEXT NOT NULL,
  "raw_data" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "vector_id" TEXT
);
CREATE INDEX "performances_status_region_industry_idx" ON "performances" ("status", "region", "industry");

CREATE TABLE "contract_clauses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "risk_level" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "clause_text" TEXT NOT NULL,
  "standard_wording" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "vector_id" TEXT
);
CREATE INDEX "contract_clauses_status_type_risk_level_idx" ON "contract_clauses" ("status", "type", "risk_level");

CREATE TABLE "tender_structures" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "industry" TEXT NOT NULL,
  "project_type" TEXT NOT NULL,
  "template_outline" JSONB NOT NULL,
  "scoring_template" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "vector_id" TEXT
);
CREATE INDEX "tender_structures_status_industry_project_type_idx" ON "tender_structures" ("status", "industry", "project_type");

CREATE TABLE "crawl_jobs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "fetched_count" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  "started_at" TIMESTAMP(3) NOT NULL,
  "ended_at" TIMESTAMP(3)
);
CREATE INDEX "crawl_jobs_source_status_idx" ON "crawl_jobs" ("source", "status");
