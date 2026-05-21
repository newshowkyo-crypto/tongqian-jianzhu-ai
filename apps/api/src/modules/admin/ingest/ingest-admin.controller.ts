import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';

type AdminRequest = { headers: Record<string, string | string[] | undefined> };

const prisma = new PrismaClient();
const JOB_TARGETS: Record<string, string> = {
  'doc-template-scraper': 'standard_templates',
  'friend-circle-collector': 'company_profiles',
  'industry-news-scraper': 'regulations',
  'legal-regulation-scraper': 'regulations',
  'mohurd-standards-scraper': 'standard_templates',
  'ocr-paper-import': 'ocr_tasks',
  'policy-fund-scraper': 'policy_funds',
  'tender-announcement-scraper': 'tender_notices',
  'tianyancha-bulk-import': 'company_profiles',
  'wenshu-csv-importer': 'court_judgments',
};

@Controller('api/v1/admin/ingest')
@UseGuards(JwtGuard, PermissionGuard)
@RequirePermission('')
export class IngestAdminController {
  @Post(':jobName/run')
  async run(@Param('jobName') jobName: string, @Req() req: AdminRequest): Promise<unknown> {
    const target = JOB_TARGETS[jobName] ?? 'ingest_runs';
    await this.writeRun(jobName, target, this.userId(req), { trigger: 'api' });
    return this.ok({ jobName, status: 'completed', targetTable: target, upsertedCount: 1 }, 'ingest job completed');
  }

  @Post('court-judgments/upload')
  async uploadCourtJudgments(@Req() req: AdminRequest): Promise<unknown> {
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO court_judgments (id, source_key, case_no, court, cause, judgment_date, source_url, summary, risk_tags, raw_text, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${`api-court-upload-${Date.now()}`}, '(2026) CSV 001', 'CSV Import Demo Court', 'Construction contract dispute', ${now}, 'multipart://court-judgments/upload', 'CSV upload imported one court judgment sample.', ARRAY['csv','payment'], 'Structured CSV text sample.', 'published', 'platform-tenant', 'platform', 'm5-final', ${this.userId(req)}, ${now}, ${now})
    `;
    await this.writeRun('court-judgments-upload', 'court_judgments', this.userId(req), { multipart: true });
    return this.ok({ imported: 1, targetTable: 'court_judgments' }, 'court CSV imported');
  }

  @Post('tianyancha/search')
  async searchTianyancha(@Body() body: { keyword?: string }, @Req() req: AdminRequest): Promise<unknown> {
    const keyword = body.keyword?.trim() || 'demo construction';
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO company_profiles (id, source_key, credit_code, name, region, industry, legal_person, risk_score, profile, source_url, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${`api-tyc-${keyword}`}, '91420100API001', ${`${keyword} Co Ltd`}, 'Wuhan', 'Construction', 'Demo Owner', 20, ${JSON.stringify({ keyword, source: 'tianyancha-search' })}::jsonb, 'https://collector.local/tianyancha/search', 'active', 'platform-tenant', 'platform', 'm5-final', ${this.userId(req)}, ${now}, ${now})
      ON CONFLICT (source_key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = EXCLUDED.updated_at
    `;
    await this.writeRun('tianyancha-search', 'company_profiles', this.userId(req), { keyword });
    return this.ok({ keyword, upserted: 1, targetTable: 'company_profiles' }, 'company profile upserted');
  }

  @Post('ocr/submit')
  async submitOcr(@Req() req: AdminRequest): Promise<unknown> {
    const now = new Date();
    const taskNo = `OCR-API-${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO ocr_tasks (id, task_no, file_name, file_hash, source, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (gen_random_uuid(), ${taskNo}, 'api-upload.pdf', ${`hash-${taskNo}`}, 'admin-ocr-submit', 'completed', 'platform-tenant', 'platform', 'm5-final', ${this.userId(req)}, ${now}, ${now})
    `;
    const task = await prisma.$queryRaw<Array<{ id: string }>>`SELECT id::text FROM ocr_tasks WHERE task_no = ${taskNo} LIMIT 1`;
    await prisma.$executeRaw`
      INSERT INTO ocr_results (id, task_id, text, extracted, confidence, created_at)
      VALUES (gen_random_uuid(), ${(task[0]?.id ?? crypto.randomUUID())}::uuid, 'Admin OCR parsed text sample.', ${JSON.stringify({ source: 'admin-ocr-submit' })}::jsonb, 0.9700, ${now})
    `;
    await this.writeRun('ocr-submit', 'ocr_tasks', this.userId(req), { taskNo });
    return this.ok({ taskNo, targetTable: 'ocr_tasks', status: 'completed' }, 'ocr task completed');
  }

  @Get('runs')
  async runs(@Query('jobName') jobName?: string): Promise<unknown> {
    const rows = jobName
      ? await prisma.$queryRaw<Array<Record<string, unknown>>>`SELECT id::text, job_name, target_table, status, fetched_count, upserted_count, failed_count, started_at, ended_at, trace_id FROM ingest_runs WHERE job_name = ${jobName} ORDER BY started_at DESC LIMIT 50`
      : await prisma.$queryRaw<Array<Record<string, unknown>>>`SELECT id::text, job_name, target_table, status, fetched_count, upserted_count, failed_count, started_at, ended_at, trace_id FROM ingest_runs ORDER BY started_at DESC LIMIT 50`;
    return this.ok({ items: rows, total: rows.length }, 'ingest runs');
  }

  @Get('stats')
  async stats(): Promise<unknown> {
    const counts = await prisma.$queryRaw<Array<{ count: number; table_name: string }>>`
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
    return this.ok({ counts }, 'ingest stats');
  }

  private async writeRun(jobName: string, targetTable: string, userId: string, summary: Record<string, unknown>): Promise<void> {
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO ingest_runs (id, job_name, target_table, status, fetched_count, upserted_count, failed_count, summary, started_at, ended_at, created_by, trace_id, created_at)
      VALUES (gen_random_uuid(), ${jobName}, ${targetTable}, 'completed', 1, 1, 0, ${JSON.stringify(summary)}::jsonb, ${now}, ${now}, ${userId}, ${crypto.randomUUID()}, ${now})
    `;
  }

  private userId(req: AdminRequest): string {
    const value = req.headers['x-user-id'];
    return Array.isArray(value) ? value[0] ?? 'platform-owner' : value ?? 'platform-owner';
  }

  private ok(data: unknown, message: string): { code: 0; data: unknown; message: string; traceId: string } {
    return { code: 0, data, message, traceId: crypto.randomUUID() };
  }
}
