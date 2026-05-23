import { Body, Controller, Get, Headers, Inject, Param, Post, Query } from '@nestjs/common';

import { RiskReviewService } from './risk-review.service.js';

@Controller('api/v1')
export class RiskReviewController {
  constructor(@Inject(RiskReviewService) private readonly risks: RiskReviewService) {}

  @Get('risk-review')
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const monthly = this.risks.monthlyReview(tenantId);
    return { code: 'OK', data: { items: [], monthly, total: monthly.green + monthly.red + monthly.yellow }, message: 'Risk review list', traceId: crypto.randomUUID() };
  }

  @Post('risk-review')
  createRiskReview(
    @Body() body: { amountCny?: number; contractType?: string; contractUrl?: string; tenantType?: 'BUILDING_COMPANY' | 'GOV'; type?: 'basic' | 'pro' },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    const review = this.risks.createReview({ amountCny: body.amountCny, contractType: body.contractType ?? 'construction', contractUrl: body.contractUrl ?? 'mock://upload/contract.pdf', tenantId, tenantType: body.tenantType, type: body.type ?? 'pro', userId });
    return { code: 'OK', data: { ...review, providerUsed: 'mock', traceId: review.aiTaskId }, message: 'Risk review created', traceId: review.aiTaskId };
  }

  @Get('risk-review/:id')
  getRiskReview(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.risks.getReview(id, tenantId), message: 'Risk review detail', traceId: crypto.randomUUID() };
  }

  @Get('risk-review/:id/download')
  download(@Param('id') id: string, @Query('format') format: 'docx' | 'pdf' = 'pdf', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    this.risks.getReview(id, tenantId);
    return { code: 'OK', data: { url: `mock://oss/risk-review/${id}.${format}?ttl=3600` }, message: 'Risk review download', traceId: crypto.randomUUID() };
  }

  @Post('contract-reviews')
  create(
    @Body() body: { amountCny?: number; contractType: string; contractUrl: string; tenantType?: 'BUILDING_COMPANY' | 'GOV'; type: 'basic' | 'pro' },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    return { code: 'OK', data: this.risks.createReview({ ...body, tenantId, userId }), message: 'Contract review created', traceId: crypto.randomUUID() };
  }

  @Get('contract-reviews/:id')
  get(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.risks.getReview(id, tenantId), message: 'Contract review', traceId: crypto.randomUUID() };
  }

  @Post('contract-reviews/:id/modification-letter')
  letter(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.risks.createModificationLetter(id, tenantId), message: 'Modification letter created', traceId: crypto.randomUUID() };
  }

  @Post('tender-reviews')
  tenderReview(
    @Body() body: { amountCny?: number; contractType: string; contractUrl: string; tenantType?: 'BUILDING_COMPANY' | 'GOV' },
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): unknown {
    return { code: 'OK', data: this.risks.createReview({ ...body, tenantId, type: 'tender', userId }), message: 'Tender risk review created', traceId: crypto.randomUUID() };
  }

  @Post('claim-strategies')
  claim(@Body() body: { facts: Record<string, unknown>; isLitigation?: boolean; projectAmountCny?: number; reviewId?: string }): unknown {
    return { code: 'OK', data: this.risks.createClaimStrategy(body), message: 'Claim strategy created', traceId: crypto.randomUUID() };
  }

  @Post('legal/batch-reviews')
  batch(@Body() body: { reviews: Array<{ amountCny?: number; contractType: string; contractUrl: string; tenantType?: 'BUILDING_COMPANY' | 'GOV'; type: 'basic' | 'pro' }> }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.risks.batchReview(body.reviews.map((review) => ({ ...review, tenantId, userId }))), message: 'Batch reviews', traceId: crypto.randomUUID() };
  }

  @Get('legal/monthly-risk-review')
  monthly(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.risks.monthlyReview(tenantId), message: 'Monthly risk review', traceId: crypto.randomUUID() };
  }

  @Post('legal/consult-chat')
  consult(@Body() body: { question: string }): unknown {
    return { code: 'OK', data: this.risks.consultChat(body.question), message: 'Legal consult chat', traceId: crypto.randomUUID() };
  }

  @Get('risk-review/feature-wall/:plan')
  featureWall(@Param('plan') plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): unknown {
    return { code: 'OK', data: this.risks.featureWall(plan), message: 'Risk review feature wall', traceId: crypto.randomUUID() };
  }
}
