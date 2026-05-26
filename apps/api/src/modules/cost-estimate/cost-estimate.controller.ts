import { Body, Controller, Get, Headers, Inject, Post, Query } from '@nestjs/common';

import type { BudgetEstimatorService } from './budget-estimator.service.js';
import { CostEstimateService } from './cost-estimate.service.js';
import type { RoughQuantityService } from './rough-quantity.service.js';

@Controller('api/v1/cost')
export class CostEstimateController {
  constructor(@Inject(CostEstimateService) private readonly costs: CostEstimateService, private readonly budgets: BudgetEstimatorService, private readonly roughQuantities: RoughQuantityService) {}

  @Post('budget')
  budget(@Body() body: { areaSqm: number; plannedStart?: string; projectName: string; projectType: string; qualityLevel: string; region: string; structureType: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') createdBy = 'mock-user'): unknown {
    return { code: 'OK', data: this.budgets.estimate({ ...body, createdBy, tenantId }), message: 'Budget estimate created', traceId: crypto.randomUUID() };
  }

  @Post('rough-quantity')
  roughQuantity(@Body() body: { areaSqm: number; projectName: string; projectType: string; structureType: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.roughQuantities.estimate({ ...body, tenantId }), message: 'Rough quantity estimate created', traceId: crypto.randomUUID() };
  }

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

  @Post('estimate/from-text')
  async estimateFromText(@Body() body: { area?: number; description: string; projectType: string; region: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): Promise<unknown> {
    return { code: 'OK', data: await this.costs.estimateFromText({ ...body, tenantId, userId }), message: 'Cost estimate from text', traceId: crypto.randomUUID() };
  }

  @Post('estimate/from-photo')
  async estimateFromPhoto(@Body() body: { photoUrls: string[]; projectStage: 'finishing' | 'mep' | 'rough_in'; region: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): Promise<unknown> {
    return { code: 'OK', data: await this.costs.estimateFromPhoto({ ...body, tenantId, userId }), message: 'Cost estimate from photo', traceId: crypto.randomUUID() };
  }

  @Post('estimate/from-cad-boq')
  async estimateFromCad(@Body() body: { extractedBoq: Array<{ description: string; qty: number; unit: string; workCode?: string }>; region: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): Promise<unknown> {
    return { code: 'OK', data: await this.costs.estimateFromCadBoq({ ...body, tenantId, userId }), message: 'Cost estimate from CAD BOQ', traceId: crypto.randomUUID() };
  }
}
