CREATE TABLE "conversations" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "title" TEXT,
  "channel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "last_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversations_tenant_id_user_id_last_at_idx" ON "conversations"("tenant_id", "user_id", "last_at");

CREATE TABLE "conversation_messages" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "intent" TEXT,
  "triggered_task_id" TEXT,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversation_messages_conversation_id_created_at_idx" ON "conversation_messages"("conversation_id", "created_at");

CREATE TABLE "conversation_summaries" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "range_from" TIMESTAMP(3) NOT NULL,
  "range_to" TIMESTAMP(3) NOT NULL,
  "summary" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversation_summaries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversation_summaries_conversation_id_range_to_idx" ON "conversation_summaries"("conversation_id", "range_to");

CREATE TABLE "chat_channel_bindings" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "channel" TEXT NOT NULL,
  "external_id" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "bound_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_channel_bindings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chat_channel_bindings_channel_external_id_key" ON "chat_channel_bindings"("channel", "external_id");
CREATE INDEX "chat_channel_bindings_user_id_is_active_idx" ON "chat_channel_bindings"("user_id", "is_active");
