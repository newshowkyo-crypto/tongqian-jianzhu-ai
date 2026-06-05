import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Data access for admin ingest/demo-seeding jobs. All SQL lives here in the
 * repository layer (parameterized Prisma tagged templates — no string
 * concatenation, no injection) so the controller stays free of Prisma
 * (database-conventions.md §20, security-rules.md §6).
 */
@Injectable()
export class IngestAdminRepository {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  async writeRun(jobName: string, targetTable: string, userId: string, summary: Record<string, unknown>): Promise<void> {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO ingest_runs (id, job_name, target_table, status, fetched_count, upserted_count, failed_count, summary, started_at, ended_at, created_by, trace_id, created_at)
      VALUES (gen_random_uuid(), ${jobName}, ${targetTable}, 'completed', 1, 1, 0, ${JSON.stringify(summary)}::jsonb, ${now}, ${now}, ${userId}, ${randomUUID()}, ${now})
    `;
  }

  async insertCourtJudgment(userId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO court_judgments (id, source_key, case_no, court, cause, judgment_date, source_url, summary, risk_tags, raw_text, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${`api-court-upload-${now.getTime()}`}, '(2026) CSV 001', 'CSV Import Demo Court', 'Construction contract dispute', ${now}, 'multipart://court-judgments/upload', 'CSV upload imported one court judgment sample.', ARRAY['csv','payment'], 'Structured CSV text sample.', 'published', 'platform-tenant', 'platform', 'm5-final', ${userId}, ${now}, ${now})
    `;
  }

  async upsertCompanyProfile(keyword: string, userId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO company_profiles (id, source_key, credit_code, name, region, industry, legal_person, risk_score, profile, source_url, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${`api-tyc-${keyword}`}, '91420100API001', ${`${keyword} Co Ltd`}, 'Wuhan', 'Construction', 'Demo Owner', 20, ${JSON.stringify({ keyword, source: 'tianyancha-search' })}::jsonb, 'https://collector.local/tianyancha/search', 'active', 'platform-tenant', 'platform', 'm5-final', ${userId}, ${now}, ${now})
      ON CONFLICT (source_key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = EXCLUDED.updated_at
    `;
  }

  async insertOcrTaskWithResult(userId: string): Promise<string> {
    const now = new Date();
    const taskNo = `OCR-API-${now.getTime()}`;
    await this.prisma.$executeRaw`
      INSERT INTO ocr_tasks (id, task_no, file_name, file_hash, source, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${taskNo}, 'api-upload.pdf', ${`hash-${taskNo}`}, 'admin-ocr-submit', 'completed', 'platform-tenant', 'platform', 'm5-final', ${userId}, ${now}, ${now})
    `;
    const task = await this.prisma.$queryRaw<Array<{ id: string }>>`SELECT id::text FROM ocr_tasks WHERE task_no = ${taskNo} LIMIT 1`;
    await this.prisma.$executeRaw`
      INSERT INTO ocr_results (id, task_id, text, extracted, confidence, created_at)
      VALUES (gen_random_uuid(), ${task[0]?.id ?? randomUUID()}::uuid, 'Admin OCR parsed text sample.', ${JSON.stringify({ source: 'admin-ocr-submit' })}::jsonb, 0.9700, ${now})
    `;
    return taskNo;
  }

  async listRuns(jobName?: string): Promise<Array<Record<string, unknown>>> {
    return jobName
      ? this.prisma.$queryRaw<Array<Record<string, unknown>>>`SELECT id::text, job_name, target_table, status, fetched_count, upserted_count, failed_count, started_at, ended_at, trace_id FROM ingest_runs WHERE job_name = ${jobName} ORDER BY started_at DESC LIMIT 50`
      : this.prisma.$queryRaw<Array<Record<string, unknown>>>`SELECT id::text, job_name, target_table, status, fetched_count, upserted_count, failed_count, started_at, ended_at, trace_id FROM ingest_runs ORDER BY started_at DESC LIMIT 50`;
  }

  async stats(): Promise<Array<{ count: number; table_name: string }>> {
    return this.prisma.$queryRaw<Array<{ count: number; table_name: string }>>`
      SELECT 'regulations' AS table_name, COUNT(*)::int AS count FROM regulations
      UNION ALL SELECT 'tender_notices', COUNT(*)::int FROM tender_notices
      UNION ALL SELECT 'policy_funds', COUNT(*)::int FROM policy_funds
      UNION ALL SELECT 'standard_templates', COUNT(*)::int FROM standard_templates
      UNION ALL SELECT 'court_judgments', COUNT(*)::int FROM court_judgments
      UNION ALL SELECT 'company_profiles', COUNT(*)::int FROM company_profiles
      UNION ALL SELECT 'ocr_tasks', COUNT(*)::int FROM ocr_tasks
      UNION ALL SELECT 'ocr_results', COUNT(*)::int FROM ocr_results
      UNION ALL SELECT 'ingest_runs', COUNT(*)::int FROM ingest_runs
    `;
  }
}
