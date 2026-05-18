CREATE TABLE "drawings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT,
  "file_url" TEXT NOT NULL,
  "file_format" TEXT NOT NULL,
  "size_bytes" BIGINT NOT NULL,
  "pages" INTEGER,
  "preview_urls" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "drawings_tenant_id_project_id_idx" ON "drawings" ("tenant_id", "project_id");

CREATE TABLE "drawing_understandings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "drawing_id" UUID NOT NULL UNIQUE,
  "drawing_type" TEXT NOT NULL,
  "key_dimensions" JSONB NOT NULL,
  "main_components" JSONB NOT NULL,
  "design_params" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE
);

CREATE TABLE "drawing_errors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "drawing_id" UUID NOT NULL,
  "level" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "page_no" INTEGER,
  "ai_task_id" TEXT NOT NULL UNIQUE
);

CREATE INDEX "drawing_errors_drawing_id_level_idx" ON "drawing_errors" ("drawing_id", "level");

CREATE TABLE "drawing_version_diffs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "old_drawing_id" UUID NOT NULL,
  "new_drawing_id" UUID NOT NULL,
  "changes" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE
);

CREATE INDEX "drawing_version_diffs_old_drawing_id_new_drawing_id_idx" ON "drawing_version_diffs" ("old_drawing_id", "new_drawing_id");

CREATE TABLE "quantity_estimates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "drawing_id" UUID NOT NULL,
  "components" JSONB NOT NULL,
  "ai_task_id" TEXT NOT NULL UNIQUE
);

CREATE INDEX "quantity_estimates_drawing_id_idx" ON "quantity_estimates" ("drawing_id");
