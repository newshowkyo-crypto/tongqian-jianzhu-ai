import { Body, Controller, Get, Inject, Post, Put, Query } from '@nestjs/common';
import type { KnowledgeType } from '@tongqian/types';

import { KnowledgeService } from './knowledge.service.js';

@Controller('api/v1')
export class KnowledgeController {
  constructor(@Inject(KnowledgeService) private readonly knowledge: KnowledgeService) {}

  @Get('policies')
  policies(@Query('level') level?: string, @Query('topic') topic?: string): unknown {
    return { code: 'OK', data: this.knowledge.listPolicies({ level, topics: topic ? [topic] : undefined }), message: 'Policies', traceId: crypto.randomUUID() };
  }

  @Put('policies/preferences')
  preferences(@Body() body: { topics: string[] }): unknown {
    return { code: 'OK', data: { channel: 'notification_center', topics: body.topics }, message: 'Policy preferences saved', traceId: crypto.randomUUID() };
  }

  @Get('performances')
  performances(@Query('region') region?: string, @Query('industry') industry?: string): unknown {
    return { code: 'OK', data: this.knowledge.searchPerformances({ industry, region }), message: 'Performances', traceId: crypto.randomUUID() };
  }

  @Get('contract-clauses')
  clauses(@Query('type') type?: string, @Query('risk_level') riskLevel?: 'green' | 'red' | 'yellow'): unknown {
    return { code: 'OK', data: this.knowledge.searchClauses({ riskLevel, type }), message: 'Contract clauses', traceId: crypto.randomUUID() };
  }

  @Get('tender-structures')
  structures(@Query('industry') industry?: string, @Query('project_type') projectType?: string): unknown {
    return { code: 'OK', data: this.knowledge.tenderTemplates({ industry, projectType }), message: 'Tender structures', traceId: crypto.randomUUID() };
  }

  @Post('knowledge/retrieve')
  retrieve(@Body() body: { query: string; topK?: number; type?: KnowledgeType }): unknown {
    return { code: 'OK', data: this.knowledge.retrieve(body), message: 'Knowledge retrieved', traceId: crypto.randomUUID() };
  }

  @Post('admin/knowledge/review')
  review(@Body() body: { decision: 'approve' | 'reject'; id: string; reason?: string; reviewerId: string; type: KnowledgeType }): unknown {
    return { code: 'OK', data: this.knowledge.review(body), message: 'Knowledge reviewed', traceId: crypto.randomUUID() };
  }

  @Post('admin/knowledge/crawler/trigger')
  crawler(@Body() body: { source: string; type: 'performance' | 'policy' | 'tender' }): unknown {
    return { code: 'OK', data: this.knowledge.triggerCrawler(body), message: 'Crawler triggered', traceId: crypto.randomUUID() };
  }
}
