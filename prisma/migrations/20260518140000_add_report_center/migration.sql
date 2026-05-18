CREATE TABLE "reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "source_module" TEXT NOT NULL,
  "source_task_id" TEXT NOT NULL,
  "ai_task_type" TEXT NOT NULL,
  "tier" INTEGER NOT NULL,
  "confidence" TEXT NOT NULL,
  "next_step" TEXT NOT NULL,
  "h5_url" TEXT,
  "pdf_url" TEXT,
  "template_version" INTEGER NOT NULL,
  "brand_mode" TEXT NOT NULL,
  "agent_id" TEXT,
  "data_snapshot" JSONB NOT NULL,
  "trace_id" TEXT NOT NULL,
  "watermark" TEXT NOT NULL,
  "device_limit" INTEGER NOT NULL DEFAULT 5,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_ratings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "report_id" UUID NOT NULL,
  "stars" INTEGER NOT NULL,
  "feedback" TEXT,
  "rated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "report_ratings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_module" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "layout_schema" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_escalations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "report_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "ticket_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "report_escalations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_difficulty_radars" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "report_id" UUID NOT NULL,
  "professional" INTEGER NOT NULL,
  "time_hours" INTEGER NOT NULL,
  "risk_score" INTEGER NOT NULL,
  "cost_score" INTEGER NOT NULL,
  "agent_alternative" JSONB NOT NULL,
  "rendered_svg" TEXT,
  CONSTRAINT "report_difficulty_radars_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_tenant_id_user_id_created_at_idx" ON "reports"("tenant_id", "user_id", "created_at");
CREATE INDEX "reports_trace_id_idx" ON "reports"("trace_id");
CREATE UNIQUE INDEX "report_ratings_report_id_key" ON "report_ratings"("report_id");
CREATE UNIQUE INDEX "report_templates_source_module_version_key" ON "report_templates"("source_module", "version");
CREATE INDEX "report_templates_source_module_is_active_idx" ON "report_templates"("source_module", "is_active");
CREATE INDEX "report_escalations_report_id_type_idx" ON "report_escalations"("report_id", "type");
CREATE UNIQUE INDEX "report_difficulty_radars_report_id_key" ON "report_difficulty_radars"("report_id");

ALTER TABLE "report_ratings" ADD CONSTRAINT "report_ratings_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "report_difficulty_radars" ADD CONSTRAINT "report_difficulty_radars_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
