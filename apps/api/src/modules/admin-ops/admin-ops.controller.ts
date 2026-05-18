import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';

import { AdminOpsService } from './admin-ops.service.js';

@Controller('api/v1/admin')
export class AdminOpsController {
  constructor(@Inject(AdminOpsService) private readonly admin: AdminOpsService) {}

  @Get('dashboard/kpis')
  kpis(): unknown {
    return { code: 'OK', data: this.admin.kpis(), message: 'Admin KPIs', traceId: crypto.randomUUID() };
  }

  @Get('system-configs')
  configs(): unknown {
    return { code: 'OK', data: this.admin.configs(), message: 'System configs', traceId: crypto.randomUUID() };
  }

  @Put('system-configs/:key')
  setConfig(@Param('key') key: string, @Body() body: { approvalFlowId?: string; reason: string; updatedBy: string; value: unknown }): unknown {
    return { code: 'OK', data: this.admin.setConfig({ ...body, key }), message: 'System config saved', traceId: crypto.randomUUID() };
  }

  @Get('system-configs/:key/history')
  history(@Param('key') key: string): unknown {
    return { code: 'OK', data: this.admin.configHistory(key), message: 'System config history', traceId: crypto.randomUUID() };
  }

  @Get('credentials')
  credentials(): unknown {
    return { code: 'OK', data: this.admin.credentialList(), message: 'Credential configs', traceId: crypto.randomUUID() };
  }

  @Put('credentials/:key')
  credential(@Param('key') key: string, @Body() body: { mode: 'mock' | 'real'; operatorId: string; provider: string; reason: string }): unknown {
    return { code: 'OK', data: this.admin.upsertCredential({ ...body, key }), message: 'Credential config saved', traceId: crypto.randomUUID() };
  }

  @Get('red-lines/status')
  redLines(): unknown {
    return { code: 'OK', data: this.admin.redLineStatus(), message: 'Red lines', traceId: crypto.randomUUID() };
  }

  @Post('red-lines/scan')
  scan(): unknown {
    return { code: 'OK', data: this.admin.runRedLineScan(), message: 'Red lines scanned', traceId: crypto.randomUUID() };
  }

  @Get('feature-flags')
  flags(): unknown {
    return { code: 'OK', data: this.admin.featureFlags(), message: 'Feature flags', traceId: crypto.randomUUID() };
  }

  @Put('feature-flags/:key')
  flag(@Param('key') key: string, @Body() body: { enabled: boolean; nameZh: string; rolloutPct: number; rolloutStrategy?: Record<string, unknown> }): unknown {
    return { code: 'OK', data: this.admin.setFlag({ ...body, flagKey: key }), message: 'Feature flag saved', traceId: crypto.randomUUID() };
  }

  @Get('review-queues')
  queues(): unknown {
    return { code: 'OK', data: this.admin.reviewQueues(), message: 'Review queues', traceId: crypto.randomUUID() };
  }
}
