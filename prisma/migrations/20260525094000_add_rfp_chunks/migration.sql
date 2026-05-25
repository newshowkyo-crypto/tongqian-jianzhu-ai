CREATE TABLE "rfp_chunks" (
  "id" UUID NOT NULL,
  "tender_id" TEXT NOT NULL,
  "doc_name" TEXT NOT NULL,
  "page_number" INTEGER,
  "content" TEXT NOT NULL,
  "keywords" TEXT[],
  "embedding" BYTEA,
  CONSTRAINT "rfp_chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rfp_chunks_tender_id_idx" ON "rfp_chunks"("tender_id");
