import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { TenderService } from './tender.service.js';

@Controller('api/v1/tender')
export class TenderController {
  constructor(@Inject(TenderService) private readonly tender: TenderService) {}

  @Post('projects')
  create(
    @Body() body: { amountEstimateCny?: number; fileSizeMb: number; fileType: 'docx' | 'pdf'; industry?: string; name: string; region?: string },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    return { code: 'OK', data: this.tender.createProject({ ...body, tenantId, userId }), message: 'Tender project created', traceId: crypto.randomUUID() };
  }

  @Get('projects/:id')
  get(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.getProject(id, tenantId), message: 'Tender project', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/summary')
  summary(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.summarize(id, tenantId), message: 'Tender summary', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/eligibility')
  eligibility(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.checkEligibility(id, tenantId), message: 'Tender eligibility', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/framework')
  framework(@Param('id') id: string, @Body() body: { templateCode?: 'building' | 'highway' | 'municipal' }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.generateFramework(id, tenantId, body.templateCode), message: 'Tender framework', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/sections/:key/generate')
  section(@Param('id') id: string, @Param('key') key: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.writeSection(id, tenantId, key), message: 'Tender section draft', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/package')
  pack(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.packageDocuments(id, tenantId), message: 'Tender package', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/score-predict')
  score(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.predictScore(id, tenantId), message: 'Tender score prediction', traceId: crypto.randomUUID() };
  }

  @Post('projects/:id/dispatch-tender-writer')
  dispatch(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.tender.dispatchTenderWriter(id, tenantId), message: 'Tender dispatch decision', traceId: crypto.randomUUID() };
  }

  @Get('staff/daily-quiz')
  quiz(): unknown {
    return { code: 'OK', data: this.tender.dailyQuiz(), message: 'Tender daily quiz', traceId: crypto.randomUUID() };
  }

  @Post('agent/quote')
  quote(@Body() body: { referencePriceCny: number; serviceDays: number }): unknown {
    return { code: 'OK', data: this.tender.agentQuoteTool(body), message: 'Tender agent quote', traceId: crypto.randomUUID() };
  }

  @Get('feature-wall/:plan')
  featureWall(@Param('plan') plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): unknown {
    return { code: 'OK', data: this.tender.featureWall(plan), message: 'Tender feature wall', traceId: crypto.randomUUID() };
  }
}
