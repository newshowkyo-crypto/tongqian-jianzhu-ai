CREATE TABLE "payment_ledgers" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "contract_id" TEXT,
  "event_type" TEXT NOT NULL,
  "amount_cny" DECIMAL(20,2) NOT NULL,
  "event_date" TIMESTAMP(3) NOT NULL,
  "period" TEXT NOT NULL,
  "invoice_no" TEXT,
  "invoice_date" TIMESTAMP(3),
  "payment_date" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_ledgers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_ledgers_tenant_id_project_id_event_date_idx" ON "payment_ledgers"("tenant_id", "project_id", "event_date");
