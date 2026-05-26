import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { PolicyFundService } from './policy-fund.service.js';

@Controller('api/v1/policy-funds')
export class PolicyFundController {
  constructor(@Inject(PolicyFundService) private readonly funds: PolicyFundService) {}

  @Get()
  list(@Query('category') category?: string): unknown {
    return { code: 'OK', data: this.funds.listFunds(category), message: 'Policy funds', traceId: crypto.randomUUID() };
  }

  @Post('match')
  match(@Body() body: { projectFeature: Record<string, unknown>; tenantId?: string; userId?: string }): unknown {
    return { code: 'OK', data: this.funds.computeMatch({ projectFeature: body.projectFeature, tenantId: body.tenantId ?? 'mock-tenant', userId: body.userId ?? 'mock-user' }), message: 'Policy fund matches', traceId: crypto.randomUUID() };
  }
}
