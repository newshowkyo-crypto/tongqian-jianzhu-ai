CREATE TABLE "agent_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL UNIQUE,
  "tenant_id" TEXT NOT NULL UNIQUE,
  "subtype" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "deposit_amount" DECIMAL(10, 2),
  "promo_code" TEXT NOT NULL UNIQUE,
  "activity_status" TEXT NOT NULL DEFAULT 'active',
  "last_active_at" TIMESTAMP(3),
  "trained_at" TIMESTAMP(3),
  "is_blacklisted" BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX "agent_profiles_subtype_region_idx" ON "agent_profiles" ("subtype", "region");

CREATE TABLE "agent_relations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "child_id" TEXT NOT NULL UNIQUE,
  "parent_id" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "bound_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "agent_relations_parent_id_idx" ON "agent_relations" ("parent_id");

CREATE TABLE "reputation_scores" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 500,
  "level" TEXT NOT NULL,
  "level_locked_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("entity_id", "entity_type")
);

CREATE TABLE "reputation_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "resource_id" TEXT,
  "reversible" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "reputation_logs_entity_id_entity_type_created_at_idx" ON "reputation_logs" ("entity_id", "entity_type", "created_at");

CREATE TABLE "dispatches" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_tenant_id" TEXT NOT NULL,
  "source_module" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(15, 2) NOT NULL,
  "class" TEXT NOT NULL,
  "pool" TEXT,
  "status" TEXT NOT NULL,
  "assigned_agent_id" TEXT,
  "selected_agent_id" TEXT,
  "takeover_reason" TEXT,
  "cross_domain_fee" DECIMAL(15, 2),
  "actual_amount" DECIMAL(15, 2),
  "bid_window_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3)
);
CREATE INDEX "dispatches_status_created_at_idx" ON "dispatches" ("status", "created_at");

CREATE TABLE "dispatch_quotes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "dispatch_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "price" DECIMAL(15, 2) NOT NULL,
  "description" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "ref_price_id" TEXT,
  "is_selected" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("dispatch_id", "agent_id")
);

CREATE TABLE "agent_ratings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "dispatch_id" TEXT NOT NULL UNIQUE,
  "client_user_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "stars" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "is_auto_rating" BOOLEAN NOT NULL DEFAULT false,
  "rated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "client_ratings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "dispatch_id" TEXT NOT NULL UNIQUE,
  "agent_id" TEXT NOT NULL,
  "client_tenant_id" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "rated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "agent_client_signals" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "signal_type" TEXT NOT NULL,
  "urgency" TEXT NOT NULL,
  "source_ref" TEXT,
  "message" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "pushed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acted_at" TIMESTAMP(3),
  "acted_action" TEXT,
  "cooldown_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "agent_client_signals_agent_id_expires_at_idx" ON "agent_client_signals" ("agent_id", "expires_at");
CREATE INDEX "agent_client_signals_client_id_signal_type_idx" ON "agent_client_signals" ("client_id", "signal_type");

CREATE TABLE "premium_service_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price_low" DECIMAL(15, 2),
  "price_high" DECIMAL(15, 2),
  "description" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "premium_service_items_category_is_active_idx" ON "premium_service_items" ("category", "is_active");

CREATE TABLE "agent_case_studies" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "ai_review_score" DECIMAL(5, 2),
  "ai_review_log" JSONB,
  "expert_score" DECIMAL(5, 2),
  "expert_review_at" TIMESTAMP(3),
  "expert_id" TEXT,
  "expert_comment" TEXT,
  "download_count" INTEGER NOT NULL DEFAULT 0,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "agent_case_studies_agent_id_status_idx" ON "agent_case_studies" ("agent_id", "status");
CREATE INDEX "agent_case_studies_category_is_featured_idx" ON "agent_case_studies" ("category", "is_featured");

CREATE TABLE "agent_consents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" TEXT NOT NULL UNIQUE,
  "protocol_version" TEXT NOT NULL,
  "commitments" JSONB NOT NULL,
  "signed_at" TIMESTAMP(3) NOT NULL,
  "ip" TEXT NOT NULL,
  "user_agent" TEXT NOT NULL
);
CREATE INDEX "agent_consents_agent_id_protocol_version_idx" ON "agent_consents" ("agent_id", "protocol_version");
