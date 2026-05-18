CREATE TYPE "CreditLogType" AS ENUM ('pre_charge', 'pre_charge_release', 'commit', 'refund', 'topup', 'gift', 'expire');

CREATE TABLE "credit_accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "total_balance" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credit_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "credit_accounts_user_id_key" ON "credit_accounts" ("user_id");
CREATE INDEX "credit_accounts_tenant_id_idx" ON "credit_accounts" ("tenant_id");

CREATE TABLE "credit_lots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "source" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "initial_amount" INTEGER NOT NULL,
  "remaining_amount" INTEGER NOT NULL,
  "expires_at" TIMESTAMP(3),
  "frozen_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credit_lots_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "credit_lots_account_id_expires_at_remaining_amount_idx" ON "credit_lots" ("account_id", "expires_at", "remaining_amount");

CREATE TABLE "credit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "type" "CreditLogType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "source_module" TEXT NOT NULL,
  "source_resource" TEXT,
  "idempotency_key" TEXT,
  "trace_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credit_logs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "credit_logs_idempotency_key_key" ON "credit_logs" ("idempotency_key");
CREATE INDEX "credit_logs_account_id_created_at_idx" ON "credit_logs" ("account_id", "created_at");
