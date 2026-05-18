CREATE TABLE "opportunities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "amount_estimate" DECIMAL(15,2) NOT NULL,
  "owner_name" TEXT NOT NULL,
  "owner_credit_code" TEXT,
  "publish_date" TIMESTAMP(3) NOT NULL,
  "deadline" TIMESTAMP(3),
  "raw_url" TEXT,
  "raw_text" TEXT,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opportunity_preferences" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "regions" JSONB NOT NULL,
  "industries" JSONB NOT NULL,
  "amount_min" DECIMAL(15,2),
  "amount_max" DECIMAL(15,2),
  "push_enabled" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "opportunity_preferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opportunity_matches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "opportunity_id" UUID NOT NULL,
  "match_score" INTEGER NOT NULL,
  "pushed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMP(3),
  "bookmarked" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "opportunity_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "investability_reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "opportunity_id" UUID NOT NULL,
  "score" INTEGER NOT NULL,
  "funding_score" INTEGER NOT NULL,
  "qualification_score" INTEGER NOT NULL,
  "relationship_score" INTEGER NOT NULL,
  "performance_score" INTEGER NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "report_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investability_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owner_verify_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "owner_credit_code" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "score" INTEGER NOT NULL,
  "cached_until" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "owner_verify_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "opportunities_region_industry_amount_estimate_idx" ON "opportunities"("region", "industry", "amount_estimate");
CREATE UNIQUE INDEX "opportunity_preferences_tenant_id_key" ON "opportunity_preferences"("tenant_id");
CREATE UNIQUE INDEX "opportunity_matches_tenant_id_opportunity_id_key" ON "opportunity_matches"("tenant_id", "opportunity_id");
CREATE INDEX "opportunity_matches_tenant_id_pushed_at_idx" ON "opportunity_matches"("tenant_id", "pushed_at");
CREATE UNIQUE INDEX "investability_reports_ai_task_id_key" ON "investability_reports"("ai_task_id");
CREATE INDEX "investability_reports_tenant_id_opportunity_id_idx" ON "investability_reports"("tenant_id", "opportunity_id");
CREATE UNIQUE INDEX "owner_verify_results_owner_credit_code_key" ON "owner_verify_results"("owner_credit_code");
