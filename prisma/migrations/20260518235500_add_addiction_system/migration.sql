CREATE TABLE "user_checkins" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "reward_credits" INTEGER NOT NULL,
  "streak_days" INTEGER NOT NULL,
  CONSTRAINT "user_checkins_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_checkins_user_id_date_key" ON "user_checkins"("user_id", "date");
CREATE INDEX "user_checkins_user_id_date_idx" ON "user_checkins"("user_id", "date");

CREATE TABLE "lottery_events" (
  "id" UUID NOT NULL,
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "lottery_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lottery_events_scheduled_at_is_active_idx" ON "lottery_events"("scheduled_at", "is_active");

CREATE TABLE "lottery_draws" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "event_id" UUID NOT NULL,
  "prize_type" TEXT NOT NULL,
  "prize_value" TEXT NOT NULL,
  "drawn_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lottery_draws_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "lottery_draws_user_id_event_id_key" ON "lottery_draws"("user_id", "event_id");

CREATE TABLE "building_levels" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "exp" INTEGER NOT NULL DEFAULT 0,
  "unlocked_features" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "building_levels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "building_levels_tenant_id_key" ON "building_levels"("tenant_id");

CREATE TABLE "monthly_growth_reports" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "year_month" TEXT NOT NULL,
  "h5_url" TEXT,
  "ai_task_id" TEXT NOT NULL,
  "metrics" JSONB NOT NULL,
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "monthly_growth_reports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "monthly_growth_reports_ai_task_id_key" ON "monthly_growth_reports"("ai_task_id");
CREATE UNIQUE INDEX "monthly_growth_reports_tenant_id_year_month_key" ON "monthly_growth_reports"("tenant_id", "year_month");

CREATE TABLE "urgency_push_logs" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "pushed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "urgency_push_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "urgency_push_logs_user_id_pushed_at_idx" ON "urgency_push_logs"("user_id", "pushed_at");

CREATE TABLE "addiction_hooks" (
  "id" UUID NOT NULL,
  "hook_code" TEXT NOT NULL,
  "name_zh" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "phase" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "config" JSONB NOT NULL,
  "output_red_lines" JSONB NOT NULL,
  CONSTRAINT "addiction_hooks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "addiction_hooks_hook_code_key" ON "addiction_hooks"("hook_code");

CREATE TABLE "hook_trigger_logs" (
  "id" UUID NOT NULL,
  "hook_code" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "context" JSONB,
  "outcome" TEXT,
  CONSTRAINT "hook_trigger_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hook_trigger_logs_user_id_hook_code_triggered_at_idx" ON "hook_trigger_logs"("user_id", "hook_code", "triggered_at");

CREATE TABLE "onboarding_progress" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "steps_done" TEXT[],
  "step_1_done_at" TIMESTAMP(3),
  "step_2_done_at" TIMESTAMP(3),
  "step_3_done_at" TIMESTAMP(3),
  "step_4_done_at" TIMESTAMP(3),
  "step_5_done_at" TIMESTAMP(3),
  "fully_activated_at" TIMESTAMP(3),
  "reward_claimed_at" TIMESTAMP(3),
  CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "onboarding_progress_user_id_key" ON "onboarding_progress"("user_id");
CREATE INDEX "onboarding_progress_user_id_idx" ON "onboarding_progress"("user_id");
