import { randomUUID } from 'node:crypto';

import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';

import { IngestAdminRepository } from './ingest-admin.repository.js';

type AdminRequest = { headers: Record<string, string | string[] | undefined> };

interface ResponseEnvelope {
  code: 0;
  data: unknown;
  message: string;
  traceId: string;
}

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
@RequirePermission('admin:ingest:run')
export class IngestAdminController {
  constructor(@Inject(IngestAdminRepository) private readonly repository: IngestAdminRepository) {}

  @Post(':jobName/run')
  async run(@Param('jobName') jobName: string, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    const target = JOB_TARGETS[jobName] ?? 'ingest_runs';
    await this.repository.writeRun(jobName, target, this.userId(req), { trigger: 'api' });
    return this.ok({ jobName, status: 'completed', targetTable: target, upsertedCount: 1 }, 'ingest job completed');
  }

  @Post('court-judgments/upload')
  async uploadCourtJudgments(@Req() req: AdminRequest): Promise<ResponseEnvelope> {
    const userId = this.userId(req);
    await this.repository.insertCourtJudgment(userId);
    await this.repository.writeRun('court-judgments-upload', 'court_judgments', userId, { multipart: true });
    return this.ok({ imported: 1, targetTable: 'court_judgments' }, 'court CSV imported');
  }

  @Post('tianyancha/search')
  async searchTianyancha(@Body() body: { keyword?: string }, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    const keyword = body.keyword?.trim() || 'demo construction';
    const userId = this.userId(req);
    await this.repository.upsertCompanyProfile(keyword, userId);
    await this.repository.writeRun('tianyancha-search', 'company_profiles', userId, { keyword });
    return this.ok({ keyword, targetTable: 'company_profiles', upserted: 1 }, 'company profile upserted');
  }

  @Post('ocr/submit')
  async submitOcr(@Req() req: AdminRequest): Promise<ResponseEnvelope> {
    const userId = this.userId(req);
    const taskNo = await this.repository.insertOcrTaskWithResult(userId);
    await this.repository.writeRun('ocr-submit', 'ocr_tasks', userId, { taskNo });
    return this.ok({ status: 'completed', targetTable: 'ocr_tasks', taskNo }, 'ocr task completed');
  }

  @Get('runs')
  async runs(@Query('jobName') jobName?: string): Promise<ResponseEnvelope> {
    const rows = await this.repository.listRuns(jobName);
    return this.ok({ items: rows, total: rows.length }, 'ingest runs');
  }

  @Get('stats')
  async stats(): Promise<ResponseEnvelope> {
    const counts = await this.repository.stats();
    return this.ok({ counts }, 'ingest stats');
  }

  private userId(req: AdminRequest): string {
    const value = req.headers['x-user-id'];
    return Array.isArray(value) ? value[0] ?? 'platform-owner' : value ?? 'platform-owner';
  }

  private ok(data: unknown, message: string): ResponseEnvelope {
    return { code: 0, data, message, traceId: randomUUID() };
  }
}
