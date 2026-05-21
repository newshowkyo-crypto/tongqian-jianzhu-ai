-- AlterTable
ALTER TABLE "policy_funds" ADD COLUMN     "raw_text" TEXT,
ADD COLUMN     "source_key" TEXT,
ADD COLUMN     "source_url" TEXT;

-- CreateTable
CREATE TABLE "regulations" (
    "id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "publish_date" TIMESTAMP(3) NOT NULL,
    "source_url" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "ai_summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_notices" (
    "id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project_type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "amount_estimate" DECIMAL(15,2),
    "deadline" TIMESTAMP(3),
    "source_url" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "ai_summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_templates" (
    "id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name_zh" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ai_summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_judgments" (
    "id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "case_no" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "judgment_date" TIMESTAMP(3) NOT NULL,
    "source_url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "risk_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw_text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "court_judgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" UUID NOT NULL,
    "source_key" TEXT NOT NULL,
    "credit_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "legal_person" TEXT,
    "risk_score" INTEGER NOT NULL,
    "profile" JSONB NOT NULL,
    "source_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_tasks" (
    "id" UUID NOT NULL,
    "task_no" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "tenant_id" TEXT NOT NULL DEFAULT 'platform-tenant',
    "scope_type" TEXT NOT NULL DEFAULT 'platform',
    "project_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocr_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_results" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "extracted" JSONB NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ocr_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest_runs" (
    "id" UUID NOT NULL,
    "job_name" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fetched_count" INTEGER NOT NULL DEFAULT 0,
    "upserted_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL DEFAULT 'platform-owner',
    "trace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingest_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regulations_source_key_key" ON "regulations"("source_key");

-- CreateIndex
CREATE INDEX "regulations_tenant_id_scope_type_status_idx" ON "regulations"("tenant_id", "scope_type", "status");

-- CreateIndex
CREATE INDEX "regulations_publish_date_idx" ON "regulations"("publish_date");

-- CreateIndex
CREATE UNIQUE INDEX "tender_notices_source_key_key" ON "tender_notices"("source_key");

-- CreateIndex
CREATE INDEX "tender_notices_tenant_id_scope_type_status_idx" ON "tender_notices"("tenant_id", "scope_type", "status");

-- CreateIndex
CREATE INDEX "tender_notices_region_deadline_idx" ON "tender_notices"("region", "deadline");

-- CreateIndex
CREATE UNIQUE INDEX "standard_templates_source_key_key" ON "standard_templates"("source_key");

-- CreateIndex
CREATE INDEX "standard_templates_tenant_id_scope_type_category_idx" ON "standard_templates"("tenant_id", "scope_type", "category");

-- CreateIndex
CREATE UNIQUE INDEX "court_judgments_source_key_key" ON "court_judgments"("source_key");

-- CreateIndex
CREATE INDEX "court_judgments_tenant_id_scope_type_cause_idx" ON "court_judgments"("tenant_id", "scope_type", "cause");

-- CreateIndex
CREATE INDEX "court_judgments_judgment_date_idx" ON "court_judgments"("judgment_date");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_source_key_key" ON "company_profiles"("source_key");

-- CreateIndex
CREATE INDEX "company_profiles_tenant_id_scope_type_status_idx" ON "company_profiles"("tenant_id", "scope_type", "status");

-- CreateIndex
CREATE INDEX "company_profiles_credit_code_idx" ON "company_profiles"("credit_code");

-- CreateIndex
CREATE UNIQUE INDEX "ocr_tasks_task_no_key" ON "ocr_tasks"("task_no");

-- CreateIndex
CREATE INDEX "ocr_tasks_tenant_id_scope_type_status_idx" ON "ocr_tasks"("tenant_id", "scope_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ocr_results_task_id_key" ON "ocr_results"("task_id");

-- CreateIndex
CREATE INDEX "ingest_runs_job_name_started_at_idx" ON "ingest_runs"("job_name", "started_at");

-- CreateIndex
CREATE INDEX "ingest_runs_status_started_at_idx" ON "ingest_runs"("status", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "policy_funds_source_key_key" ON "policy_funds"("source_key");

-- CreateIndex
CREATE INDEX "policy_funds_province_status_idx" ON "policy_funds"("province", "status");

-- AddForeignKey
ALTER TABLE "ocr_results" ADD CONSTRAINT "ocr_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "ocr_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
