CREATE TABLE "contract_reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "contract_url" TEXT NOT NULL,
  "contract_type" TEXT NOT NULL,
  "project_amount" DECIMAL(15,2),
  "ai_task_id" TEXT NOT NULL,
  "report_id" TEXT,
  "overall_risk" TEXT NOT NULL,
  "finding_count" INTEGER NOT NULL,
  "red_count" INTEGER NOT NULL,
  "yellow_count" INTEGER NOT NULL,
  "green_count" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contract_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contract_risk_findings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "review_id" UUID NOT NULL,
  "level" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "clause_no" TEXT,
  "clause_text" TEXT NOT NULL,
  "impact" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  "standard_wording" TEXT,
  "rule_id" TEXT,
  CONSTRAINT "contract_risk_findings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "modification_letters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "review_id" UUID NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "pdf_url" TEXT,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "modification_letters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "claim_strategies" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "contract_review_id" UUID,
  "facts" JSONB NOT NULL,
  "evidence_list" JSONB NOT NULL,
  "steps" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "claim_strategies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contract_reviews_ai_task_id_key" ON "contract_reviews"("ai_task_id");
CREATE INDEX "contract_reviews_tenant_id_user_id_created_at_idx" ON "contract_reviews"("tenant_id", "user_id", "created_at");
CREATE INDEX "contract_risk_findings_review_id_level_idx" ON "contract_risk_findings"("review_id", "level");
CREATE UNIQUE INDEX "modification_letters_review_id_key" ON "modification_letters"("review_id");
CREATE UNIQUE INDEX "modification_letters_ai_task_id_key" ON "modification_letters"("ai_task_id");
CREATE UNIQUE INDEX "claim_strategies_ai_task_id_key" ON "claim_strategies"("ai_task_id");
