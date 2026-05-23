ALTER TABLE "rule_versions"
  ADD COLUMN IF NOT EXISTS "gray_percent" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "prompt_quality_reports" (
  "id" UUID NOT NULL,
  "report_month" TEXT NOT NULL,
  "task_type" TEXT NOT NULL,
  "pass_rate" DECIMAL(5,2) NOT NULL,
  "case_count" INTEGER NOT NULL,
  "failed_signals" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "prompt_quality_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "prompt_quality_reports_report_month_task_type_idx"
  ON "prompt_quality_reports"("report_month", "task_type");

CREATE TABLE IF NOT EXISTS "rule_candidates" (
  "id" UUID NOT NULL,
  "source_name" TEXT NOT NULL,
  "source_table" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "rule_struct" JSONB NOT NULL,
  "confidence" DECIMAL(5,4) NOT NULL,
  "source_text" TEXT NOT NULL,
  "reasoning" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rule_candidates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "rule_candidates_source_name_key"
  ON "rule_candidates"("source_name");

CREATE INDEX IF NOT EXISTS "rule_candidates_type_status_idx"
  ON "rule_candidates"("type", "status");
