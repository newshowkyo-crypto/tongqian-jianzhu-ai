CREATE TYPE "AiTaskStatus" AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TABLE "ai_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "task_type" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "status" "AiTaskStatus" NOT NULL DEFAULT 'queued',
  "tier" INTEGER NOT NULL,
  "confidence" TEXT,
  "next_step" TEXT,
  "input_hash" TEXT NOT NULL,
  "model_used" TEXT,
  "provider_used" TEXT,
  "cache_hit" BOOLEAN NOT NULL DEFAULT false,
  "cost_credits" INTEGER,
  "cost_rmb" DECIMAL(10,4),
  "duration_ms" INTEGER,
  "trace_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "error_code" TEXT,
  CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_tasks_tenant_id_created_at_idx" ON "ai_tasks"("tenant_id", "created_at");
CREATE INDEX "ai_tasks_task_type_created_at_idx" ON "ai_tasks"("task_type", "created_at");
CREATE INDEX "ai_tasks_trace_id_idx" ON "ai_tasks"("trace_id");

CREATE TABLE "ai_cost_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ai_task_id" UUID NOT NULL,
  "input_tokens" INTEGER NOT NULL,
  "output_tokens" INTEGER NOT NULL,
  "input_cost_rmb" DECIMAL(10,6) NOT NULL,
  "output_cost_rmb" DECIMAL(10,6) NOT NULL,
  "total_cost_rmb" DECIMAL(10,4) NOT NULL,
  "credits_charged" INTEGER NOT NULL,
  "profit_rmb" DECIMAL(10,4) NOT NULL,
  "cache_hit" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_cost_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_cost_logs_ai_task_id_key" ON "ai_cost_logs"("ai_task_id");
CREATE INDEX "ai_cost_logs_created_at_idx" ON "ai_cost_logs"("created_at");

CREATE TABLE "ai_provider_health" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider_name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error_rate_5min" DECIMAL(5,4) NOT NULL,
  "p95_latency_ms" INTEGER,
  "last_check_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_provider_health_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_provider_health_provider_name_key" ON "ai_provider_health"("provider_name");

CREATE TABLE "ai_export_audit" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ai_task_id" UUID NOT NULL,
  "input_hash" TEXT NOT NULL,
  "masked_hash" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "field_count" INTEGER NOT NULL,
  "trace_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_export_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_export_audit_created_at_idx" ON "ai_export_audit"("created_at");

CREATE TABLE "user_daily_costs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "cost_rmb" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_daily_costs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_daily_costs_user_id_day_key" ON "user_daily_costs"("user_id", "day");

CREATE TABLE "tenant_monthly_costs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "month" DATE NOT NULL,
  "cost_rmb" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenant_monthly_costs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_monthly_costs_tenant_id_month_key" ON "tenant_monthly_costs"("tenant_id", "month");
