import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import type { EmergencyType } from '@tongqian/types';

import { SecurityComplianceService } from './security-compliance.service.js';

@Controller('api/v1/admin')
export class SecurityComplianceController {
  constructor(@Inject(SecurityComplianceService) private readonly security: SecurityComplianceService) {}

  @Get('audit-logs')
  audits(@Query('trace_id') traceId?: string): unknown {
    return { code: 'OK', data: this.security.listAudits({ traceId }), message: 'Audit logs', traceId: crypto.randomUUID() };
  }

  @Post('audit-logs/export')
  exportAudits(): unknown {
    return { code: 'OK', data: this.security.exportAudits(), message: 'Audit export', traceId: crypto.randomUUID() };
  }

  @Post('fraud/detect')
  detect(@Body() body: { deviceFingerprint?: string; eventId?: string; ip?: string; kind: string; subjectId: string; value?: number }): unknown {
    return { code: 'OK', data: this.security.detectFraud(body), message: 'Fraud signal evaluated', traceId: crypto.randomUUID() };
  }

  @Get('fraud/signals')
  signals(): unknown {
    return { code: 'OK', data: this.security.fraudDashboard(), message: 'Fraud dashboard', traceId: crypto.randomUUID() };
  }

  @Post('blacklist')
  blacklist(@Body() body: { addedBy: string; reason: string; type: string; value: string }): unknown {
    return { code: 'OK', data: this.security.addBlacklist(body), message: 'Blacklist entry saved', traceId: crypto.randomUUID() };
  }

  @Get('backup/runs')
  backup(): unknown {
    return { code: 'OK', data: this.security.backupStatus(), message: 'Backup status', traceId: crypto.randomUUID() };
  }

  @Get('compliance/self-check/:quarter')
  selfCheck(@Param('quarter') quarter: string): unknown {
    return { code: 'OK', data: this.security.selfCheck(quarter), message: 'Compliance self check', traceId: crypto.randomUUID() };
  }

  @Post('emergency/trigger')
  emergency(@Body() body: { notes?: string; type: EmergencyType }): unknown {
    return { code: 'OK', data: this.security.triggerEmergency(body.type, body.notes), message: 'Emergency triggered', traceId: crypto.randomUUID() };
  }

  @Post('emergency/resolve')
  resolve(@Body() body: { id: string }): unknown {
    return { code: 'OK', data: this.security.resolveEmergency(body.id), message: 'Emergency resolved', traceId: crypto.randomUUID() };
  }

  @Get('security/data-sources')
  sources(): unknown {
    return { code: 'OK', data: this.security.dataSources(), message: 'AI data sources', traceId: crypto.randomUUID() };
  }

  @Post('security/data-sources/check')
  sourceCheck(@Body() body: { url: string }): unknown {
    return { code: 'OK', data: this.security.blockUnauthorizedSource(body.url), message: 'AI data source checked', traceId: crypto.randomUUID() };
  }

  @Post('security/ai-output/validate')
  aiOutput(@Body() body: { buttons?: string[]; confidence?: string; disclaimer?: string; sources?: string[]; tierBadge?: string }): unknown {
    return { code: 'OK', data: this.security.validateAiOutput(body), message: 'AI output validated', traceId: crypto.randomUUID() };
  }

  @Post('security/sourcing-guard')
  sourcing(@Body() body: { amount?: string; contact?: string; modelProvider?: string; organization?: string; summary: string }): unknown {
    return { code: 'OK', data: this.security.sourcingGuard(body), message: 'Sourcing guard applied', traceId: crypto.randomUUID() };
  }
}
