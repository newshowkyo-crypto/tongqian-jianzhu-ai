CREATE TYPE "UserDeviceStatus" AS ENUM ('active', 'revoked');

CREATE TABLE "user_devices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "device_type" TEXT NOT NULL,
  "device_name" TEXT NOT NULL,
  "device_finger" TEXT NOT NULL,
  "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_ip" TEXT,
  "status" "UserDeviceStatus" NOT NULL DEFAULT 'active',
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_devices_user_id_device_finger_key" ON "user_devices" ("user_id", "device_finger");
CREATE INDEX "user_devices_tenant_id_user_id_status_idx" ON "user_devices" ("tenant_id", "user_id", "status");
CREATE INDEX "user_devices_user_id_status_idx" ON "user_devices" ("user_id", "status");
