CREATE TABLE "site_photos" (
  "id" UUID NOT NULL,
  "project_id" TEXT NOT NULL,
  "oss_url" TEXT NOT NULL,
  "uploaded_by" TEXT NOT NULL,
  "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "category" TEXT,
  "ai_tags" TEXT[],
  "ai_summary" TEXT,
  "defect_found" BOOLEAN NOT NULL DEFAULT false,
  "defect_level" TEXT,
  "geo_lat" DOUBLE PRECISION,
  "geo_lng" DOUBLE PRECISION,
  CONSTRAINT "site_photos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "site_photos_project_id_category_idx" ON "site_photos"("project_id", "category");
