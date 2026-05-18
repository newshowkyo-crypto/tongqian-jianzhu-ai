ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "resource" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "before" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "after" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent" TEXT;
CREATE INDEX IF NOT EXISTS "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");
CREATE INDEX IF NOT EXISTS "audit_logs_trace_id_idx" ON "audit_logs"("trace_id");

CREATE TABLE IF NOT EXISTS "gov_audit_logs" (
  "id" UUID NOT NULL,
  "trace_id" TEXT NOT NULL,
  "user_id" UUID,
  "tenant_id" UUID,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resource_id" TEXT,
  "before" JSONB,
  "after" JSONB,
  "ip" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gov_audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "gov_audit_logs_trace_id_created_at_idx" ON "gov_audit_logs"("trace_id", "created_at");

CREATE TABLE IF NOT EXISTS "device_fingerprints" (
  "id" UUID NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "device_type" TEXT NOT NULL,
  "ip" TEXT,
  "user_agent" TEXT,
  "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMP(3) NOT NULL,
  "associated_users" JSONB NOT NULL,
  "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "device_fingerprints_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "device_fingerprints_fingerprint_key" ON "device_fingerprints"("fingerprint");

CREATE TABLE IF NOT EXISTS "fraud_signals" (
  "id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "subject_id" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "fraud_signals_type_level_status_idx" ON "fraud_signals"("type", "level", "status");

CREATE TABLE IF NOT EXISTS "blacklist_entries" (
  "id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "added_by" TEXT NOT NULL,
  "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blacklist_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blacklist_entries_type_value_key" ON "blacklist_entries"("type", "value");

CREATE TABLE IF NOT EXISTS "backup_runs" (
  "id" UUID NOT NULL,
  "run_type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "size_bytes" BIGINT,
  "oss_path" TEXT,
  "started_at" TIMESTAMP(3) NOT NULL,
  "ended_at" TIMESTAMP(3),
  "error" TEXT,
  CONSTRAINT "backup_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "backup_runs_run_type_status_started_at_idx" ON "backup_runs"("run_type", "status", "started_at");

CREATE TABLE IF NOT EXISTS "emergency_incidents" (
  "id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "service_paused" BOOLEAN NOT NULL,
  "resolved_at" TIMESTAMP(3),
  "notes" TEXT,
  CONSTRAINT "emergency_incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "compliance_self_checks" (
  "id" UUID NOT NULL,
  "quarter" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "compliance_self_checks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "compliance_self_checks_quarter_key" ON "compliance_self_checks"("quarter");

CREATE TABLE IF NOT EXISTS "ai_data_sources" (
  "id" UUID NOT NULL,
  "source_name" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "authorized" BOOLEAN NOT NULL DEFAULT false,
  "qps_limit" INTEGER NOT NULL DEFAULT 1,
  "user_agent" TEXT NOT NULL,
  "robots_compliant" BOOLEAN NOT NULL DEFAULT true,
  "last_audit_at" TIMESTAMP(3),
  CONSTRAINT "ai_data_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ai_data_sources_source_name_key" ON "ai_data_sources"("source_name");
