import { Controller, Get, Headers, Inject, Param } from '@nestjs/common';

import { DecisionAdvisorService } from './decision-advisor.service.js';

@Controller('api/v1/decision')
export class DecisionController {
  constructor(@Inject(DecisionAdvisorService) private readonly advisor: DecisionAdvisorService) {}

  @Get('tenders/:id/go-no-go')
  goNoGo(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.advisor.advise(id, tenantId), message: 'Decision advice created', traceId: crypto.randomUUID() };
  }
}
