CREATE TABLE "qualification_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category" TEXT NOT NULL,
  "from_level" TEXT,
  "to_level" TEXT NOT NULL,
  "requirements" JSONB NOT NULL,
  "source_policy_id" TEXT,
  "version" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "qualification_rules_category_to_level_is_active_idx" ON "qualification_rules" ("category", "to_level", "is_active");

CREATE TABLE "contract_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "trigger" JSONB NOT NULL,
  "risk_level" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  "standard_wording" TEXT NOT NULL,
  "source_clause_id" TEXT,
  "version" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "contract_rules_type_risk_level_is_active_idx" ON "contract_rules" ("type", "risk_level", "is_active");

CREATE TABLE "tender_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "industry" TEXT NOT NULL,
  "scoring_item" TEXT NOT NULL,
  "weight_pct" DECIMAL(5, 2) NOT NULL,
  "trap_warnings" JSONB NOT NULL,
  "bid_strategy" JSONB NOT NULL,
  "version" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "tender_rules_industry_is_active_idx" ON "tender_rules" ("industry", "is_active");

CREATE TABLE "reference_prices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "service_type" TEXT NOT NULL,
  "region" TEXT,
  "amount_low" DECIMAL(15, 2) NOT NULL,
  "amount_high" DECIMAL(15, 2) NOT NULL,
  "data_source" TEXT NOT NULL,
  "sample_count" INTEGER,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "reference_prices_service_type_region_idx" ON "reference_prices" ("service_type", "region");

CREATE TABLE "rule_versions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rule_table" TEXT NOT NULL,
  "rule_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "changed_by" TEXT NOT NULL,
  "change_reason" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "rule_versions_rule_table_rule_id_version_idx" ON "rule_versions" ("rule_table", "rule_id", "version");
