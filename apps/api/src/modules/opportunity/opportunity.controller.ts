import { Body, Controller, Get, Headers, Inject, Param, Post, Put } from '@nestjs/common';

import { OpportunityService } from './opportunity.service.js';

@Controller('api/v1')
export class OpportunityController {
  constructor(@Inject(OpportunityService) private readonly opportunities: OpportunityService) {}

  @Get('opportunities')
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.opportunities.listOpportunities(tenantId), message: 'Opportunities', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/blind-box')
  blindBox(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.opportunities.blindBox(tenantId), message: 'Opportunity blind box', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/:id')
  get(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.opportunities.getOpportunity(id), message: 'Opportunity', traceId: crypto.randomUUID() };
  }

  @Post('opportunities/:id/investability')
  assess(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.opportunities.assessInvestability(tenantId, userId, id), message: 'Investability assessed', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/:id/owner-verify')
  ownerVerify(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.opportunities.ownerVerify(id), message: 'Owner verified', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/:id/owner-profile')
  ownerProfile(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.opportunities.ownerProfile(id), message: 'Owner profile', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/:id/peer-radar')
  peerRadar(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.opportunities.peerRadar(id), message: 'Peer radar', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/:id/recommended-price')
  recommendedPrice(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.opportunities.recommendedPrice(id), message: 'Recommended price', traceId: crypto.randomUUID() };
  }

  @Post('opportunities/:id/bookmark')
  bookmark(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.opportunities.bookmark(tenantId, id), message: 'Opportunity bookmarked', traceId: crypto.randomUUID() };
  }

  @Get('opportunities/follows/reminders')
  reminders(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.opportunities.followReminders(tenantId), message: 'Opportunity follow reminders', traceId: crypto.randomUUID() };
  }

  @Get('preferences')
  preference(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.opportunities.getPreference(tenantId), message: 'Opportunity preference', traceId: crypto.randomUUID() };
  }

  @Put('preferences')
  updatePreference(
    @Body() body: { amountMaxCny?: number; amountMinCny?: number; industries?: string[]; pushEnabled?: boolean; regions?: string[] },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return { code: 'OK', data: this.opportunities.updatePreference(tenantId, body), message: 'Opportunity preference saved', traceId: crypto.randomUUID() };
  }

  @Post('opportunities/preferences')
  saveOpportunityPreference(
    @Body() body: { amountMaxCny?: number; amountMinCny?: number; industries?: string[]; pushEnabled?: boolean; regions?: string[] },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return { code: 'OK', data: { ok: true, preference: this.opportunities.updatePreference(tenantId, body) }, message: 'Opportunity preference saved', traceId: crypto.randomUUID() };
  }

  @Get('opportunity-feature-wall/:plan')
  featureWall(@Param('plan') plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): unknown {
    return { code: 'OK', data: this.opportunities.featureWall(plan), message: 'Opportunity feature wall', traceId: crypto.randomUUID() };
  }
}
