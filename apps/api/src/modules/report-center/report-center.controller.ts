import { Body, Controller, Get, Headers, Inject, Param, Post, Put } from '@nestjs/common';
import type { AiAudienceRole } from '@tongqian/types';

import { ReportCenterService } from './report-center.service.js';
import { ReportExportService, type ExportFormat } from './report-export.service.js';
import { QualityCheckService } from './quality-check.service.js';

@Controller('api/v1')
export class ReportCenterController {
  constructor(@Inject(ReportCenterService) private readonly reports: ReportCenterService, private readonly exports: ReportExportService, private readonly quality: QualityCheckService) {}

  @Post('reports')
  create(
    @Body()
    body: {
      agentId?: string;
      aiTaskType: string;
      companyName?: string;
      dataSnapshot: Record<string, unknown>;
      ownerName?: string;
      role?: AiAudienceRole;
      sourceModule: string;
      sourceTaskId: string;
      subscriptionPlan?: 'ent' | 'flag' | 'lite' | 'std';
    },
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return { code: 'OK', data: this.reports.createReport({ ...body, tenantId, userId }), message: 'Report created', traceId: crypto.randomUUID() };
  }

  @Get('reports/me')
  list(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.reports.listReports(tenantId, userId), message: 'Reports', traceId: crypto.randomUUID() };
  }

  @Get('reports')
  listAll(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.reports.listReports(tenantId, userId), message: 'Reports', traceId: crypto.randomUUID() };
  }

  @Get('reports/:id')
  get(@Param('id') id: string, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-device-id') deviceId?: string): unknown {
    return { code: 'OK', data: this.reports.getReport(id, tenantId, userId, deviceId), message: 'Report', traceId: crypto.randomUUID() };
  }

  @Get('reports/:id/download/:format')
  download(@Param('id') id: string, @Param('format') format: 'h5' | 'pdf'): unknown {
    return { code: 'OK', data: { url: `mock://oss/reports/${id}.${format}?ttl=3600` }, message: 'Report download url', traceId: crypto.randomUUID() };
  }

  @Post('reports/:id/export')
  export(@Param('id') id: string, @Body() body: { format?: ExportFormat }): unknown {
    const result = this.exports.export(id, body.format ?? 'pdf');
    return { code: 'OK', data: { bytes: result.buffer.byteLength, format: result.format, note: result.note }, message: 'Report exported', traceId: crypto.randomUUID() };
  }

  @Get('reports/:id/quality-check')
  qualityCheck(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.quality.check(this.reports.getReport(id, tenantId, userId) as unknown as Record<string, unknown>), message: 'Report quality check', traceId: crypto.randomUUID() };
  }

  @Post('reports/:id/share')
  share(@Param('id') id: string, @Body() body: { channel: 'email' | 'link' | 'wechat' }): unknown {
    return { code: 'OK', data: { shareUrl: `https://mock.tongqian.local/reports/${id}?channel=${body.channel}` }, message: 'Report shared', traceId: crypto.randomUUID() };
  }

  @Post('reports/:id/rate')
  rate(@Param('id') id: string, @Body() body: { feedback?: string; stars: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.reports.rateReport(id, tenantId, body), message: 'Report rated', traceId: crypto.randomUUID() };
  }

  @Post('reports/:id/escalate')
  escalate(@Param('id') id: string, @Body() body: { type: 'human_review' | 'tongqian_consult' }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.reports.escalate(id, tenantId, body.type), message: 'Report escalation created', traceId: crypto.randomUUID() };
  }

  @Post('reports/:id/verify-access')
  verifyAccess(@Param('id') id: string, @Body() body: { deviceId: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.reports.verifyReportAccess(id, tenantId, body.deviceId), message: 'Report access verified', traceId: crypto.randomUUID() };
  }

  @Get('admin/reports/trace/:traceId')
  trace(@Param('traceId') traceId: string): unknown {
    return { code: 'OK', data: this.reports.traceForwarding(traceId), message: 'Report trace', traceId: crypto.randomUUID() };
  }

  @Get('admin/templates')
  templates(): unknown {
    return { code: 'OK', data: this.reports.listTemplates(), message: 'Report templates', traceId: crypto.randomUUID() };
  }

  @Put('admin/templates/:id')
  upsertTemplate(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; layoutSchema?: Record<string, unknown>; sourceModule?: string; version?: number },
  ): unknown {
    return { code: 'OK', data: this.reports.upsertTemplate(id, body), message: 'Report template saved', traceId: crypto.randomUUID() };
  }
}
