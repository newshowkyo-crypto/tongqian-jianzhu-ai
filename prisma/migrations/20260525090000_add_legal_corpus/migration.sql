CREATE TABLE "legal_corpus" (
  "id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "doc_type" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "full_text" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "parsed_at" TIMESTAMP(3),
  "clause_count" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "tenant_id" TEXT NOT NULL DEFAULT 'platform',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "legal_corpus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "legal_clauses" (
  "id" UUID NOT NULL,
  "corpus_id" UUID NOT NULL,
  "clause_number" TEXT NOT NULL,
  "clause_title" TEXT,
  "clause_text" TEXT NOT NULL,
  "parent_clause_id" UUID,
  "depth" INTEGER NOT NULL DEFAULT 0,
  "order_index" INTEGER NOT NULL,
  CONSTRAINT "legal_clauses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_corpus_code_key" ON "legal_corpus"("code");
CREATE INDEX "legal_corpus_doc_type_status_idx" ON "legal_corpus"("doc_type", "status");
CREATE INDEX "legal_corpus_code_idx" ON "legal_corpus"("code");
CREATE INDEX "legal_clauses_corpus_id_order_index_idx" ON "legal_clauses"("corpus_id", "order_index");
ALTER TABLE "legal_clauses" ADD CONSTRAINT "legal_clauses_corpus_id_fkey" FOREIGN KEY ("corpus_id") REFERENCES "legal_corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "legal_clauses" ADD CONSTRAINT "legal_clauses_parent_clause_id_fkey" FOREIGN KEY ("parent_clause_id") REFERENCES "legal_clauses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
