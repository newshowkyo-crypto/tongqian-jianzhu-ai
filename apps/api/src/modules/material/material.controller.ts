import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { MaterialService } from './material.service.js';

@Controller('api/v1/projects/:projectId/materials')
export class MaterialController {
  constructor(@Inject(MaterialService) private readonly material: MaterialService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() body: { name: string; plannedQty: number; unit: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.material.create({ ...body, projectId, tenantId }), message: 'Material created', traceId: crypto.randomUUID() };
  }

  @Post(':materialId/inbound')
  inbound(@Param('projectId') projectId: string, @Param('materialId') materialId: string, @Body() body: { qty: number; unitPrice?: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.material.inbound(projectId, materialId, body.qty, body.unitPrice, tenantId), message: 'Material inbound saved', traceId: crypto.randomUUID() };
  }

  @Post(':materialId/outbound')
  outbound(@Param('projectId') projectId: string, @Param('materialId') materialId: string, @Body() body: { qty: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.material.outbound(projectId, materialId, body.qty, tenantId), message: 'Material outbound saved', traceId: crypto.randomUUID() };
  }

  @Post('monthly-check')
  monthlyCheck(@Param('projectId') projectId: string, @Body() body: { results: Array<{ actualQty: number; materialId: string; theoreticalQty: number }> }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.material.monthlyCheck(projectId, body.results, tenantId), message: 'Monthly material check completed', traceId: crypto.randomUUID() };
  }

  @Get('high-loss')
  highLoss(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.material.getHighLossList(tenantId), message: 'High loss materials', traceId: crypto.randomUUID() };
  }
}
