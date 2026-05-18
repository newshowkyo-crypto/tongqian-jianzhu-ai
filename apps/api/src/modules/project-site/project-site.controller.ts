import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { ProjectSiteService } from './project-site.service.js';

@Controller('api/v1/projects')
export class ProjectSiteController {
  constructor(@Inject(ProjectSiteService) private readonly sites: ProjectSiteService) {}

  @Post()
  create(@Body() body: { name: string; planCode?: string; region?: string; type?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.sites.createProject({ ...body, tenantId, userId }), message: 'Project created', traceId: crypto.randomUUID() };
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
