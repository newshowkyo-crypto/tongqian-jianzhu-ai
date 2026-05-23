import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { ProjectSiteService } from './project-site.service.js';

@Controller('api/v1/projects')
export class ProjectSiteController {
  constructor(@Inject(ProjectSiteService) private readonly sites: ProjectSiteService) {}

  @Post()
  create(@Body() body: { name: string; planCode?: string; region?: string; type?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.sites.createProject({ ...body, tenantId, userId }), message: 'Project created', traceId: crypto.randomUUID() };
  }

  @Get()
  list(): unknown {
    return { code: 'OK', data: [{ id: 'proj-wuhan-metro', name: '武汉地铁站点配套工程' }], message: 'Projects', traceId: crypto.randomUUID() };
  }

  @Get(':id')
  detail(@Param('id') id: string): unknown {
    return { code: 'OK', data: { id, name: '武汉地铁站点配套工程' }, message: 'Project detail', traceId: crypto.randomUUID() };
  }

  @Get(':id/site-logs')
  siteLogs(@Param('id') id: string): unknown {
    return { code: 'OK', data: [{ projectId: id, content: '施工日志' }], message: 'Site logs', traceId: crypto.randomUUID() };
  }

  @Get(':id/cost-analysis')
  costAnalysis(@Param('id') id: string): unknown {
    return { code: 'OK', data: { projectId: id, items: [{ label: '材料', value: 46 }, { label: '人工', value: 24 }, { label: '机械', value: 12 }, { label: '分包', value: 18 }] }, message: 'Cost analysis', traceId: crypto.randomUUID() };
  }

  @Get(':id/drawings')
  drawings(@Param('id') id: string): unknown {
    return { code: 'OK', data: [{ projectId: id, name: '总平面图', version: 'V3' }], message: 'Drawings', traceId: crypto.randomUUID() };
  }

  @Post(':id/ai-summary')
  aiSummary(@Param('id') id: string): unknown {
    return { code: 'OK', data: { projectId: id, summary: '本周完成主体节点。', risks: ['工期', '成本', '安全'] }, message: 'AI summary created', traceId: crypto.randomUUID() };
  }

  @Get('me')
  dashboard(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.dashboard(tenantId), message: 'Project dashboard', traceId: crypto.randomUUID() };
  }

  @Post(':id/logs')
  log(@Param('id') id: string, @Body() body: { photosUrls: string[]; userInput: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.sites.addConstructionLog({ ...body, createdBy: userId, projectId: id, tenantId }), message: 'Construction log created', traceId: crypto.randomUUID() };
  }

  @Post(':id/contact-letters')
  letter(@Param('id') id: string, @Body() body: { type: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.createContactLetter({ projectId: id, tenantId, type: body.type }), message: 'Contact letter created', traceId: crypto.randomUUID() };
  }

  @Post(':id/progress-payments')
  progress(@Param('id') id: string, @Body() body: { completedValueCny: number; period: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.progressPayment({ ...body, projectId: id, tenantId }), message: 'Progress payment application created', traceId: crypto.randomUUID() };
  }

  @Post(':id/major-hazards')
  hazard(@Param('id') id: string, @Body() body: { hazardType: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.majorHazard({ ...body, projectId: id, tenantId }), message: 'Major hazard outline created', traceId: crypto.randomUUID() };
  }

  @Post(':id/archive-checklist')
  archive(@Param('id') id: string, @Body() body: { projectType: string; region: string; uploadedItems?: string[] }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.archiveChecklist({ ...body, projectId: id, tenantId }), message: 'Archive checklist created', traceId: crypto.randomUUID() };
  }

  @Post(':id/safety-monthly-reminder')
  safety(@Param('id') id: string, @Body() body: { season?: 'rain' | 'spring' }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.safetyMonthlyReminder({ ...body, projectId: id, tenantId }), message: 'Safety reminder created', traceId: crypto.randomUUID() };
  }
}
