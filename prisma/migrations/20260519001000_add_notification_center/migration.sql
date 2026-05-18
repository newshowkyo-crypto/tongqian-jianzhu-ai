CREATE TABLE "notification_templates" (
  "id" UUID NOT NULL,
  "scenario" TEXT NOT NULL,
  "inbox_template" JSONB NOT NULL,
  "wechat_mp_template" JSONB,
  "work_wechat_template" JSONB,
  "sms_template" JSONB,
  "email_template" JSONB,
  "desktop_template" JSONB,
  "level" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_templates_scenario_key" ON "notification_templates"("scenario");

CREATE TABLE "notifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "scenario" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "external_id" TEXT,
  "event_hash" TEXT NOT NULL,
  "scheduled_at" TIMESTAMP(3),
  "sent_at" TIMESTAMP(3),
  "read_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "trace_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_user_id_scenario_event_hash_idx" ON "notifications"("user_id", "scenario", "event_hash");
CREATE INDEX "notifications_user_id_channel_sent_at_idx" ON "notifications"("user_id", "channel", "sent_at");

CREATE TABLE "notification_preferences" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "inbox_enabled" BOOLEAN NOT NULL DEFAULT true,
  "wechat_mp_enabled" BOOLEAN NOT NULL DEFAULT true,
  "work_wechat_enabled" BOOLEAN NOT NULL DEFAULT true,
  "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
  "email_enabled" BOOLEAN NOT NULL DEFAULT false,
  "desktop_enabled" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");
