import { Body, Controller, Get, Headers, Inject, Param, Post, Query } from '@nestjs/common';

import { ActualCostService } from './actual-cost.service.js';

@Controller('api/v1/projects/:projectId/actual-cost')
export class ActualCostController {
  constructor(@Inject(ActualCostService) private readonly costs: ActualCostService) {}

  @Post('monthly')
  recordMonthly(@Param('projectId') projectId: string, @Body() body: { laborCost: number; machineCost: number; materialCost: number; mgmtCost: number; period: string; profit: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.recordMonthly({ ...body, projectId, tenantId }), message: 'Actual cost recorded', traceId: crypto.randomUUID() };
  }

  @Post('variance')
  computeVariance(@Param('projectId') projectId: string, @Body() body: { budget: Record<'laborCost' | 'machineCost' | 'materialCost' | 'mgmtCost' | 'profit', number>; period: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.computeVariance(projectId, body.period, body.budget, tenantId), message: 'Cost variance computed', traceId: crypto.randomUUID() };
  }

  @Get('variance')
  trend(@Param('projectId') projectId: string, @Query('period') _period?: string): unknown {
    return { code: 'OK', data: this.costs.getVarianceTrend(projectId), message: 'Cost variance trend', traceId: crypto.randomUUID() };
  }
}
