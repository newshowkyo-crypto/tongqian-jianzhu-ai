CREATE TABLE "change_orders" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "contract_id" TEXT NOT NULL,
  "order_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "estimated_cost_impact_cny" DECIMAL(20,2),
  "estimated_time_impact_days" INTEGER,
  "status" TEXT NOT NULL,
  "evidence_files" TEXT[],
  "submitted_at" TIMESTAMP(3),
  "approved_at" TIMESTAMP(3),
  "final_cost_cny" DECIMAL(20,2),
  "final_time_days" INTEGER,
  "ai_risk_analysis" TEXT,
  CONSTRAINT "change_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "claim_records" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "contract_id" TEXT NOT NULL,
  "claim_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "claimed_amount_cny" DECIMAL(20,2),
  "claimed_time_days" INTEGER,
  "submit_deadline" TIMESTAMP(3),
  "submitted_at" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "evidence_files" TEXT[],
  "final_amount_cny" DECIMAL(20,2),
  "final_time_days" INTEGER,
  "ai_success_score" DOUBLE PRECISION,
  "ai_analysis" TEXT,
  CONSTRAINT "claim_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "change_orders_tenant_id_project_id_status_idx" ON "change_orders"("tenant_id", "project_id", "status");
CREATE INDEX "claim_records_tenant_id_project_id_submit_deadline_idx" ON "claim_records"("tenant_id", "project_id", "submit_deadline");
