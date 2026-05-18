import { Body, Controller, Get, Headers, Inject, Post, Query } from '@nestjs/common';

import { CostEstimateService } from './cost-estimate.service.js';

@Controller('api/v1/cost')
export class CostEstimateController {
  constructor(@Inject(CostEstimateService) private readonly costs: CostEstimateService) {}

  @Post('rough-estimate')
  roughEstimate(@Body() body: { areaSqm: number; decoration: string; projectType: string; region: string; structureType: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.roughEstimate({ ...body, tenantId }), message: 'Cost rough estimate created', traceId: crypto.randomUUID() };
  }

  @Post('checklist-review')
  checklistReview(@Body() body: { sourceFileUrl: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.reviewChecklist({ ...body, tenantId }), message: 'Checklist review created', traceId: crypto.randomUUID() };
  }

  @Post('pricing-recommend')
  pricingRecommend(@Body() body: { baseCostCny: number; competitorPressure?: 'high' | 'low' | 'medium'; marginTargetPct?: number; projectFeatures: string[] }): unknown {
    return { code: 'OK', data: this.costs.recommendPricing(body), message: 'Pricing recommendation created', traceId: crypto.randomUUID() };
  }

  @Get('material-prices')
  materialPrices(@Query('region') region = 'default', @Query('material_code') materialCode = 'steel', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.materialPrices({ materialCode, region, tenantId }), message: 'Material prices', traceId: crypto.randomUUID() };
  }

  @Post('material-alerts')
  materialAlert(@Body() body: { materialCode: string; region: string; thresholdPct?: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.costs.upsertMaterialAlert({ ...body, tenantId }), message: 'Material alert saved', traceId: crypto.randomUUID() };
  }
}
