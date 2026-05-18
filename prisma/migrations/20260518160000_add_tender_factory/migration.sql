CREATE TABLE "tender_projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "region" TEXT,
  "industry" TEXT,
  "amount_estimate" DECIMAL(15,2),
  "source_file_url" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_summaries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "report_id" TEXT,
  "key_points" JSONB NOT NULL,
  "schedule" JSONB NOT NULL,
  "eligibility_req" JSONB NOT NULL,
  "scoring_summary" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_summaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_eligibilities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "missing_items" JSONB NOT NULL,
  "remediation" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_eligibilities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_frameworks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "business_outline" JSONB NOT NULL,
  "technical_outline" JSONB NOT NULL,
  "template_code" TEXT NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_frameworks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_section_drafts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "section_key" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "approved_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_section_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_packages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "pdf_url" TEXT NOT NULL,
  "included_docs" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tender_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tender_score_predictions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "predicted_score" DECIMAL(5,2) NOT NULL,
  "breakdown" JSONB NOT NULL,
  "improvements" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  CONSTRAINT "tender_score_predictions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tender_projects_tenant_id_user_id_created_at_idx" ON "tender_projects"("tenant_id", "user_id", "created_at");
CREATE UNIQUE INDEX "tender_summaries_project_id_key" ON "tender_summaries"("project_id");
CREATE UNIQUE INDEX "tender_summaries_ai_task_id_key" ON "tender_summaries"("ai_task_id");
CREATE INDEX "tender_eligibilities_project_id_idx" ON "tender_eligibilities"("project_id");
CREATE UNIQUE INDEX "tender_eligibilities_ai_task_id_key" ON "tender_eligibilities"("ai_task_id");
CREATE UNIQUE INDEX "tender_frameworks_project_id_key" ON "tender_frameworks"("project_id");
CREATE UNIQUE INDEX "tender_frameworks_ai_task_id_key" ON "tender_frameworks"("ai_task_id");
CREATE INDEX "tender_section_drafts_project_id_section_key_idx" ON "tender_section_drafts"("project_id", "section_key");
CREATE UNIQUE INDEX "tender_section_drafts_ai_task_id_key" ON "tender_section_drafts"("ai_task_id");
CREATE UNIQUE INDEX "tender_packages_project_id_key" ON "tender_packages"("project_id");
CREATE INDEX "tender_score_predictions_project_id_idx" ON "tender_score_predictions"("project_id");
CREATE UNIQUE INDEX "tender_score_predictions_ai_task_id_key" ON "tender_score_predictions"("ai_task_id");
