CREATE TABLE "system_configs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "updated_by" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "system_configs_category_is_active_idx" ON "system_configs" ("category", "is_active");

CREATE TABLE "system_config_histories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "config_key" TEXT NOT NULL,
  "prev_value" JSONB,
  "new_value" JSONB NOT NULL,
  "change_reason" TEXT,
  "changed_by" TEXT NOT NULL,
  "approval_flow_id" TEXT,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "system_config_histories_config_key_changed_at_idx" ON "system_config_histories" ("config_key", "changed_at");

CREATE TABLE "red_line_alerts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "red_line_key" TEXT NOT NULL,
  "threshold" DECIMAL(15, 4) NOT NULL,
  "actual_value" DECIMAL(15, 4) NOT NULL,
  "status" TEXT NOT NULL,
  "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  "notes" TEXT
);
CREATE INDEX "red_line_alerts_red_line_key_status_idx" ON "red_line_alerts" ("red_line_key", "status");

CREATE TABLE "feature_flags" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "flag_key" TEXT NOT NULL UNIQUE,
  "name_zh" TEXT NOT NULL,
  "description" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "rollout_pct" INTEGER NOT NULL DEFAULT 0,
  "rollout_strategy" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
