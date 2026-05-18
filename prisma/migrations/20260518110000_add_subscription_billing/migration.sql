CREATE TYPE "SubscriptionStatus" AS ENUM ('trial', 'active', 'past_due', 'canceled', 'expired');

CREATE TABLE "subscription_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "monthly_price" DECIMAL(10,2) NOT NULL,
  "yearly_price" DECIMAL(10,2),
  "credits_per_month" INTEGER NOT NULL,
  "features" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans" ("code");

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "plan_code" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
  "consecutive_months" INTEGER NOT NULL DEFAULT 0,
  "auto_renew" BOOLEAN NOT NULL DEFAULT true,
  "current_period_start" TIMESTAMP(3) NOT NULL,
  "current_period_end" TIMESTAMP(3) NOT NULL,
  "canceled_at" TIMESTAMP(3),
  "expired_at" TIMESTAMP(3),
  "past_due_since" TIMESTAMP(3),
  "total_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_paid_months" INTEGER NOT NULL DEFAULT 0,
  "concierge_user_id" TEXT,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_tenant_id_key" ON "subscriptions" ("tenant_id");
CREATE INDEX "subscriptions_status_current_period_end_idx" ON "subscriptions" ("status", "current_period_end");
CREATE INDEX "subscriptions_past_due_since_idx" ON "subscriptions" ("past_due_since");

CREATE TABLE "subscription_changes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id" UUID NOT NULL,
  "from_plan" TEXT NOT NULL,
  "to_plan" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "effective_at" TIMESTAMP(3) NOT NULL,
  "prorate_amount" DECIMAL(10,2),
  "initiated_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_changes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "subscription_changes_subscription_id_idx" ON "subscription_changes" ("subscription_id");

CREATE TABLE "renewal_attempts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id" UUID NOT NULL,
  "attempt_no" INTEGER NOT NULL,
  "result" TEXT NOT NULL,
  "payment_id" TEXT,
  "error_code" TEXT,
  "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "renewal_attempts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "renewal_attempts_subscription_id_attempt_no_idx" ON "renewal_attempts" ("subscription_id", "attempt_no");

CREATE TABLE "invoices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "subscription_id" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "invoice_no" TEXT NOT NULL,
  "invoice_url" TEXT,
  "email_sent_at" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoice_no_key" ON "invoices" ("invoice_no");
CREATE INDEX "invoices_tenant_id_created_at_idx" ON "invoices" ("tenant_id", "created_at");
