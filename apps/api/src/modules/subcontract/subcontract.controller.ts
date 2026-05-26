import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { SubcontractService } from './subcontract.service.js';

@Controller('api/v1/projects/:projectId/subcontracts')
export class SubcontractController {
  constructor(@Inject(SubcontractService) private readonly subcontracts: SubcontractService) {}

  @Get()
  list(@Param('projectId') projectId: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subcontracts.list(projectId, tenantId), message: 'Subcontracts', traceId: crypto.randomUUID() };
  }

  @Post()
  create(@Param('projectId') projectId: string, @Body() body: { contractAmount: number; contractFileId?: string; subcontractorName: string; workScope: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subcontracts.create({ ...body, projectId, tenantId }), message: 'Subcontract created', traceId: crypto.randomUUID() };
  }

  @Post(':id/evaluations')
  evaluate(@Param('id') id: string, @Body() body: { cooperation: number; quality: number; safety: number; schedule: number; settlement: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subcontracts.evaluate(id, body, tenantId), message: 'Subcontract evaluated', traceId: crypto.randomUUID() };
  }

  @Post('blacklist')
  blacklist(@Body() body: { reason: string; subcontractorName: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subcontracts.addToBlacklist(tenantId, body.subcontractorName, body.reason), message: 'Subcontractor blacklisted', traceId: crypto.randomUUID() };
  }
}
