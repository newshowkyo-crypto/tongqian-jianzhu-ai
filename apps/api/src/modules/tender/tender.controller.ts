import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import type { RfpRagService } from './rfp-rag.service.js';
import { TenderService } from './tender.service.js';

@Controller('api/v1')
export class TenderController {
  constructor(@Inject(TenderService) private readonly tender: TenderService, private readonly rfpRag: RfpRagService) {}

  @Get('tenders')
  list(): unknown {
    return { code: 'OK', data: { items: [], total: 0 }, message: 'Tender list', traceId: crypto.randomUUID() };
  }

  @Post('tenders')
  createTender(
    @Body() body: { amountEstimateCny?: number; fileSizeMb?: number; fileType?: 'docx' | 'pdf'; industry?: string; name?: string; region?: string },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    const project = this.tender.createProject({ amountEstimateCny: body.amountEstimateCny, fileSizeMb: body.fileSizeMb ?? 1, fileType: body.fileType ?? 'pdf', industry: body.industry, name: body.name ?? 'M15 demo tender', region: body.region, tenantId, userId });
    const summary = this.tender.summarize(project.id, tenantId);
    return { code: 'OK', data: { ...project, keyPointsCount: summary.keyPoints.length, providerUsed: 'mock', tenderId: project.id, traceId: summary.aiTaskId }, message: 'Tender created', traceId: summary.aiTaskId };
  }

  @Get('tenders/:id')
  getTender(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.getProject(id, tenantId), message: 'Tender detail', traceId: crypto.randomUUID() };
  }

  @Post('tenders/:id/framework')
  generateTenderFramework(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const framework = this.tender.generateFramework(id, tenantId);
    return { code: 'OK', data: { frameworkId: framework.id }, message: 'Tender framework generated', traceId: framework.aiTaskId };
  }

  @Post('tender/projects')
  create(
    @Body() body: { amountEstimateCny?: number; fileSizeMb: number; fileType: 'docx' | 'pdf'; industry?: string; name: string; region?: string },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    return { code: 'OK', data: this.tender.createProject({ ...body, tenantId, userId }), message: 'Tender project created', traceId: crypto.randomUUID() };
  }

  @Get('tender/projects/:id')
  get(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.getProject(id, tenantId), message: 'Tender project', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/summary')
  summary(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.summarize(id, tenantId), message: 'Tender summary', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/eligibility')
  eligibility(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.checkEligibility(id, tenantId), message: 'Tender eligibility', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/framework')
  framework(@Param('id') id: string, @Body() body: { templateCode?: 'building' | 'highway' | 'municipal' }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.generateFramework(id, tenantId, body.templateCode), message: 'Tender framework', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/sections/:key/generate')
  section(@Param('id') id: string, @Param('key') key: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.writeSection(id, tenantId, key), message: 'Tender section draft', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/package')
  pack(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.packageDocuments(id, tenantId), message: 'Tender package', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/score-predict')
  score(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.predictScore(id, tenantId), message: 'Tender score prediction', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/dispatch-tender-writer')
  dispatch(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.dispatchTenderWriter(id, tenantId), message: 'Tender dispatch decision', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/rfp-ingest')
  async rfpIngest(@Param('id') id: string, @Body() body: { docs: Array<{ name: string; ossUrl: string }> }): Promise<unknown> {
    return { code: 'OK', data: await this.rfpRag.ingestRfpDocs(id, body.docs), message: 'RFP docs ingested', traceId: crypto.randomUUID() };
  }

  @Post('tender/projects/:id/rfp-search')
  rfpSearch(@Param('id') id: string, @Body() body: { query: string }): unknown {
    return { code: 'OK', data: { items: this.rfpRag.searchAcrossRfp(id, body.query) }, message: 'RFP search', traceId: crypto.randomUUID() };
  }

  @Get('tender/projects/:id/key-clauses')
  keyClauses(@Param('id') id: string): unknown {
    return { code: 'OK', data: { clauses: this.rfpRag.keyClauses(id), changes: this.rfpRag.compareDocs(id) }, message: 'RFP key clauses', traceId: crypto.randomUUID() };
  }

  @Get('tender/staff/daily-quiz')
  quiz(): unknown {
    return { code: 'OK', data: this.tender.dailyQuiz(), message: 'Tender daily quiz', traceId: crypto.randomUUID() };
  }

  @Post('tender/agent/quote')
  quote(@Body() body: { referencePriceCny: number; serviceDays: number }): unknown {
    return { code: 'OK', data: this.tender.agentQuoteTool(body), message: 'Tender agent quote', traceId: crypto.randomUUID() };
  }

  @Get('tender/feature-wall/:plan')
  featureWall(@Param('plan') plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): unknown {
    return { code: 'OK', data: this.tender.featureWall(plan), message: 'Tender feature wall', traceId: crypto.randomUUID() };
  }
}
