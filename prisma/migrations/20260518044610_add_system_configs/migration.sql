CREATE TABLE "system_configs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "is_overridable" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "system_config_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "system_config_id" UUID NOT NULL,
  "old_value" JSONB,
  "new_value" JSONB NOT NULL,
  "changed_by" TEXT,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "system_config_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");
CREATE INDEX "system_config_history_system_config_id_idx" ON "system_config_history"("system_config_id");

ALTER TABLE "system_config_history"
  ADD CONSTRAINT "system_config_history_system_config_id_fkey"
  FOREIGN KEY ("system_config_id") REFERENCES "system_configs"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
