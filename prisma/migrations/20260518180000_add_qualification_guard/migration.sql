CREATE TABLE "qualification_certs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "category" TEXT NOT NULL, "sub_type" TEXT, "level" TEXT NOT NULL,
  "cert_no" TEXT NOT NULL, "issued_at" TIMESTAMP(3) NOT NULL, "valid_until" TIMESTAMP(3) NOT NULL, "issuer" TEXT NOT NULL,
  "raw_image_url" TEXT NOT NULL, "status" TEXT NOT NULL, "meta" JSONB, CONSTRAINT "qualification_certs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "safety_licenses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "license_no" TEXT NOT NULL, "issued_at" TIMESTAMP(3) NOT NULL,
  "valid_until" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL, CONSTRAINT "safety_licenses_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "key_personnel" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "name" TEXT NOT NULL, "id_card_masked" TEXT NOT NULL,
  "role" TEXT NOT NULL, "cert_type" TEXT NOT NULL, "cert_no" TEXT NOT NULL, "cert_valid_until" TIMESTAMP(3) NOT NULL,
  "is_attached" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "key_personnel_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "performance_records" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "project_name" TEXT NOT NULL, "contract_amount" DECIMAL(15,2) NOT NULL,
  "contract_url" TEXT, "acceptance_url" TEXT, "industry" TEXT NOT NULL, "start_at" TIMESTAMP(3) NOT NULL, "end_at" TIMESTAMP(3),
  "matched_qualifications" JSONB NOT NULL, "meta" JSONB, CONSTRAINT "performance_records_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "qualification_checkups" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "health_score" INTEGER NOT NULL, "completeness" INTEGER NOT NULL,
  "validity" INTEGER NOT NULL, "upgrade_potential" INTEGER NOT NULL, "risk_points" JSONB NOT NULL, "ai_task_id" TEXT NOT NULL,
  "report_id" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "qualification_checkups_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "upgrade_path_reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "from_level" TEXT NOT NULL, "to_level" TEXT NOT NULL,
  "category" TEXT NOT NULL, "path_steps" JSONB NOT NULL, "gap_analysis" JSONB NOT NULL, "ai_task_id" TEXT NOT NULL,
  "report_id" TEXT, CONSTRAINT "upgrade_path_reports_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "personnel_compliance_checks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "qualification_id" TEXT NOT NULL, "personnel_id" TEXT NOT NULL, "check_type" TEXT NOT NULL,
  "result" TEXT NOT NULL, "evidence" JSONB NOT NULL, "audit_log_id" TEXT, "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "personnel_compliance_checks_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "qualification_service_orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "client_id" TEXT NOT NULL, "agent_id" TEXT NOT NULL, "qualification_target" TEXT NOT NULL,
  "quoted_amount" DECIMAL(12,2) NOT NULL, "service_terms" TEXT NOT NULL, "service_period_days" INTEGER NOT NULL, "failure_compensation" INTEGER NOT NULL,
  "milestones" JSONB NOT NULL, "payment_status" TEXT NOT NULL, "client_acceptance_at" TIMESTAMP(3), "acceptance_window_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "qualification_service_orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "qualification_certs_tenant_id_valid_until_idx" ON "qualification_certs"("tenant_id", "valid_until");
CREATE UNIQUE INDEX "safety_licenses_tenant_id_key" ON "safety_licenses"("tenant_id");
CREATE INDEX "key_personnel_tenant_id_role_idx" ON "key_personnel"("tenant_id", "role");
CREATE INDEX "performance_records_tenant_id_industry_idx" ON "performance_records"("tenant_id", "industry");
CREATE UNIQUE INDEX "qualification_checkups_ai_task_id_key" ON "qualification_checkups"("ai_task_id");
CREATE INDEX "qualification_checkups_tenant_id_created_at_idx" ON "qualification_checkups"("tenant_id", "created_at");
CREATE UNIQUE INDEX "upgrade_path_reports_ai_task_id_key" ON "upgrade_path_reports"("ai_task_id");
CREATE INDEX "upgrade_path_reports_tenant_id_idx" ON "upgrade_path_reports"("tenant_id");
CREATE INDEX "personnel_compliance_checks_qualification_id_idx" ON "personnel_compliance_checks"("qualification_id");
CREATE INDEX "qualification_service_orders_client_id_agent_id_idx" ON "qualification_service_orders"("client_id", "agent_id");
