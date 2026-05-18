CREATE TABLE "assistant_queries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" TEXT NOT NULL, "question" TEXT NOT NULL, "ai_task_id" TEXT NOT NULL,
  "result_data" JSONB NOT NULL, "query_template" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_queries_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "generated_documents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "doc_type" TEXT NOT NULL,
  "content" TEXT NOT NULL, "pdf_url" TEXT, "ai_task_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "policy_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "topics" JSONB NOT NULL, "level" JSONB NOT NULL,
  "push_enabled" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "policy_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "policy_impact_analyses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "tenant_id" TEXT NOT NULL, "policy_id" TEXT NOT NULL, "ai_task_id" TEXT NOT NULL,
  "impact_summary" TEXT NOT NULL, "actions" JSONB NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "policy_impact_analyses_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "assistant_conversation_streaks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" TEXT NOT NULL, "current_streak" INTEGER NOT NULL DEFAULT 0,
  "longest_streak" INTEGER NOT NULL DEFAULT 0, "last_chat_at" TIMESTAMP(3), "unlocked_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "reward_claims" JSONB NOT NULL, CONSTRAINT "assistant_conversation_streaks_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "user_assistant_personalities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" TEXT NOT NULL, "current_personality" TEXT NOT NULL,
  "switch_history" JSONB NOT NULL, "last_switched_at" TIMESTAMP(3), CONSTRAINT "user_assistant_personalities_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "inspiration_cards" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" TEXT NOT NULL, "card_content" JSONB NOT NULL, "trigger_reason" TEXT NOT NULL,
  "pushed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "user_action" TEXT, CONSTRAINT "inspiration_cards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "assistant_queries_ai_task_id_key" ON "assistant_queries"("ai_task_id");
CREATE INDEX "assistant_queries_user_id_created_at_idx" ON "assistant_queries"("user_id", "created_at");
CREATE UNIQUE INDEX "generated_documents_ai_task_id_key" ON "generated_documents"("ai_task_id");
CREATE INDEX "generated_documents_tenant_id_user_id_created_at_idx" ON "generated_documents"("tenant_id", "user_id", "created_at");
CREATE UNIQUE INDEX "policy_subscriptions_tenant_id_key" ON "policy_subscriptions"("tenant_id");
CREATE UNIQUE INDEX "policy_impact_analyses_ai_task_id_key" ON "policy_impact_analyses"("ai_task_id");
CREATE INDEX "policy_impact_analyses_tenant_id_created_at_idx" ON "policy_impact_analyses"("tenant_id", "created_at");
CREATE UNIQUE INDEX "assistant_conversation_streaks_user_id_key" ON "assistant_conversation_streaks"("user_id");
CREATE INDEX "assistant_conversation_streaks_user_id_idx" ON "assistant_conversation_streaks"("user_id");
CREATE UNIQUE INDEX "user_assistant_personalities_user_id_key" ON "user_assistant_personalities"("user_id");
CREATE INDEX "inspiration_cards_user_id_pushed_at_idx" ON "inspiration_cards"("user_id", "pushed_at");
