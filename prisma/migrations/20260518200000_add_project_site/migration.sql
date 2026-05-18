CREATE TABLE "projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "name" TEXT NOT NULL, "contract_id" TEXT,
  "status" TEXT NOT NULL, "start_at" TIMESTAMP(3), "expected_end_at" TIMESTAMP(3), "region" TEXT, "type" TEXT,
  "pm_user_id" TEXT, "meta" JSONB, CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "construction_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "project_id" UUID NOT NULL, "log_date" TIMESTAMP(3) NOT NULL, "photos_urls" JSONB NOT NULL,
  "user_input" TEXT NOT NULL, "ai_summary" TEXT NOT NULL, "tags" JSONB NOT NULL, "ai_task_id" TEXT NOT NULL, "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "construction_logs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "contact_letters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "project_id" UUID NOT NULL, "type" TEXT NOT NULL, "content" TEXT NOT NULL,
  "pdf_url" TEXT, "status" TEXT NOT NULL, "approval_flow_id" TEXT, "ai_task_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "contact_letters_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "progress_payment_apps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "project_id" UUID NOT NULL, "period" TEXT NOT NULL, "completed_value" DECIMAL(15,2) NOT NULL,
  "application_doc_url" TEXT NOT NULL, "ai_task_id" TEXT NOT NULL, "status" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "progress_payment_apps_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "major_hazard_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "project_id" UUID NOT NULL, "hazard_type" TEXT NOT NULL, "outline_doc_url" TEXT NOT NULL,
  "needs_expert_review" BOOLEAN NOT NULL DEFAULT true, "ai_task_id" TEXT NOT NULL, CONSTRAINT "major_hazard_plans_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "archive_checklists" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "project_id" UUID NOT NULL, "region" TEXT NOT NULL, "project_type" TEXT NOT NULL,
  "required_items" JSONB NOT NULL, "uploaded_items" JSONB NOT NULL, "missing_items" JSONB NOT NULL, "ai_task_id" TEXT NOT NULL,
  CONSTRAINT "archive_checklists_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "projects_tenant_id_status_idx" ON "projects"("tenant_id", "status");
CREATE INDEX "construction_logs_project_id_log_date_idx" ON "construction_logs"("project_id", "log_date");
CREATE UNIQUE INDEX "construction_logs_ai_task_id_key" ON "construction_logs"("ai_task_id");
CREATE INDEX "contact_letters_project_id_type_idx" ON "contact_letters"("project_id", "type");
CREATE UNIQUE INDEX "contact_letters_ai_task_id_key" ON "contact_letters"("ai_task_id");
CREATE INDEX "progress_payment_apps_project_id_period_idx" ON "progress_payment_apps"("project_id", "period");
CREATE UNIQUE INDEX "progress_payment_apps_ai_task_id_key" ON "progress_payment_apps"("ai_task_id");
CREATE INDEX "major_hazard_plans_project_id_idx" ON "major_hazard_plans"("project_id");
CREATE UNIQUE INDEX "major_hazard_plans_ai_task_id_key" ON "major_hazard_plans"("ai_task_id");
CREATE INDEX "archive_checklists_project_id_idx" ON "archive_checklists"("project_id");
CREATE UNIQUE INDEX "archive_checklists_ai_task_id_key" ON "archive_checklists"("ai_task_id");
