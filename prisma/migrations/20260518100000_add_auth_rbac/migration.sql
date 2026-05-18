CREATE TYPE "TenantType" AS ENUM ('BUILDING_COMPANY', 'GOV', 'AGENT', 'PLATFORM');
CREATE TYPE "TenantStatus" AS ENUM ('pending_review', 'training', 'active', 'rejected', 'suspended');
CREATE TYPE "UserRole" AS ENUM ('BUILDING_COMPANY_USER', 'GOV_USER', 'AGENT', 'PLATFORM');
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'expired');
CREATE TYPE "ApprovalDecision" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "tenants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "TenantType" NOT NULL,
  "sub_type" TEXT,
  "name" TEXT NOT NULL,
  "social_credit_code" TEXT,
  "status" "TenantStatus" NOT NULL DEFAULT 'active',
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tenants_social_credit_code_key" ON "tenants" ("social_credit_code");
CREATE INDEX "tenants_type_status_idx" ON "tenants" ("type", "status");

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "password_hash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "primary_role" "UserRole" NOT NULL,
  "platform_role" TEXT,
  "position_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
  "totp_secret" TEXT,
  "status" "UserStatus" NOT NULL DEFAULT 'active',
  "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_phone_key" ON "users" ("phone");
CREATE INDEX "users_tenant_id_status_idx" ON "users" ("tenant_id", "status");

CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "device_id" UUID,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "ip" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens" ("token_hash");
CREATE INDEX "refresh_tokens_user_id_revoked_at_idx" ON "refresh_tokens" ("user_id", "revoked_at");

CREATE TABLE "client_attributions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "client_id" UUID NOT NULL,
  "agent_id" UUID NOT NULL,
  "ref_code" TEXT NOT NULL,
  "reassigned_from" UUID,
  "bound_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "client_attributions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "client_attributions_client_id_key" ON "client_attributions" ("client_id");
CREATE INDEX "client_attributions_agent_id_idx" ON "client_attributions" ("agent_id");

CREATE TABLE "user_consents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "ip" TEXT,
  "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMP(3),
  CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_consents_user_id_type_version_key" ON "user_consents" ("user_id", "type", "version");

CREATE TABLE "approval_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "steps_schema" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "approval_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "approval_templates_type_version_key" ON "approval_templates" ("type", "version");
CREATE INDEX "approval_templates_type_is_active_idx" ON "approval_templates" ("type", "is_active");

CREATE TABLE "approval_flows" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
  "resource_type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "initiator_id" TEXT NOT NULL,
  "tenant_id" UUID,
  "template_id" UUID NOT NULL,
  "meta" JSONB,
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  CONSTRAINT "approval_flows_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "approval_flows_tenant_id_status_idx" ON "approval_flows" ("tenant_id", "status");
CREATE INDEX "approval_flows_type_status_idx" ON "approval_flows" ("type", "status");

CREATE TABLE "approval_steps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "flow_id" UUID NOT NULL,
  "step_no" INTEGER NOT NULL,
  "approver_role" TEXT NOT NULL,
  "approver_id" TEXT,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "requires_2fa" BOOLEAN NOT NULL DEFAULT false,
  "decision" "ApprovalDecision" NOT NULL DEFAULT 'pending',
  "reason" TEXT,
  "signed_at" TIMESTAMP(3),
  CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "approval_steps_flow_id_step_no_key" ON "approval_steps" ("flow_id", "step_no");

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT,
  "user_id" TEXT,
  "action" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" TEXT,
  "trace_id" TEXT NOT NULL,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs" ("tenant_id", "created_at");
CREATE INDEX "audit_logs_trace_id_idx" ON "audit_logs" ("trace_id");

CREATE TABLE "idempotency_records" (
  "key" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "status_code" INTEGER NOT NULL,
  "response" JSONB NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records" ("expires_at");
