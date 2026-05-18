CREATE TABLE "prompt_golden_test_runs" (
  "id" UUID NOT NULL,
  "prompt_name" TEXT NOT NULL,
  "prompt_version" TEXT NOT NULL,
  "test_run_id" TEXT NOT NULL,
  "total_cases" INTEGER NOT NULL,
  "passed_cases" INTEGER NOT NULL,
  "failed_cases" INTEGER NOT NULL,
  "pass_rate" DECIMAL(5,4) NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "details" JSONB NOT NULL,
  "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "prompt_golden_test_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "prompt_golden_test_runs_prompt_name_prompt_version_idx" ON "prompt_golden_test_runs"("prompt_name", "prompt_version");

CREATE TABLE "embedding_cache" (
  "id" UUID NOT NULL,
  "text_hash" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "embedding" DOUBLE PRECISION[],
  "model" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "embedding_cache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "embedding_cache_text_hash_key" ON "embedding_cache"("text_hash");
CREATE INDEX "embedding_cache_text_hash_idx" ON "embedding_cache"("text_hash");
