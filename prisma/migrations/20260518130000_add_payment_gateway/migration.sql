CREATE TYPE "PayStatus" AS ENUM ('pending', 'paid', 'failed', 'canceled', 'refunded', 'partial_refunded');
CREATE TYPE "RefundTier" AS ENUM ('full', 'half', 'system_failure', 'none');
CREATE TYPE "CommissionStatus" AS ENUM ('frozen', 'settlable', 'withdrawable', 'paid');

CREATE TABLE "payment_orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CNY',
  "status" "PayStatus" NOT NULL DEFAULT 'pending',
  "channel" TEXT NOT NULL,
  "external_order_no" TEXT,
  "paid_at" TIMESTAMP(3),
  "metadata" JSONB,
  "idempotency_key" TEXT NOT NULL,
  "trace_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_refunds" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "tier" "RefundTier" NOT NULL,
  "reason" TEXT NOT NULL,
  "approval_flow_id" TEXT,
  "status" TEXT NOT NULL,
  "external_refund_no" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auto_charge_contracts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "external_contract_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "bound_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMP(3),
  CONSTRAINT "auto_charge_contracts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_commissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" TEXT NOT NULL,
  "client_tenant_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "CommissionStatus" NOT NULL,
  "source_order_id" TEXT NOT NULL,
  "freeze_until" TIMESTAMP(3),
  "settled_at" TIMESTAMP(3),
  "paid_at" TIMESTAMP(3),
  CONSTRAINT "agent_commissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_withdrawals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "bank_card_id" TEXT NOT NULL,
  "approval_flow_id" TEXT,
  "status" TEXT NOT NULL,
  "external_payout_no" TEXT,
  "fee" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMP(3),
  CONSTRAINT "agent_withdrawals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_orders_external_order_no_key" ON "payment_orders"("external_order_no");
CREATE UNIQUE INDEX "payment_orders_idempotency_key_key" ON "payment_orders"("idempotency_key");
CREATE INDEX "payment_orders_tenant_id_user_id_status_idx" ON "payment_orders"("tenant_id", "user_id", "status");
CREATE INDEX "payment_orders_trace_id_idx" ON "payment_orders"("trace_id");
CREATE INDEX "payment_refunds_order_id_status_idx" ON "payment_refunds"("order_id", "status");
CREATE UNIQUE INDEX "auto_charge_contracts_external_contract_id_key" ON "auto_charge_contracts"("external_contract_id");
CREATE INDEX "auto_charge_contracts_user_id_status_idx" ON "auto_charge_contracts"("user_id", "status");
CREATE INDEX "agent_commissions_agent_id_status_idx" ON "agent_commissions"("agent_id", "status");
CREATE INDEX "agent_commissions_source_order_id_idx" ON "agent_commissions"("source_order_id");
CREATE INDEX "agent_withdrawals_agent_id_status_idx" ON "agent_withdrawals"("agent_id", "status");
