import { Inject, Injectable } from '@nestjs/common';
import { AiCacheStrategy, AiTaskType } from '@tongqian/types';
import type {
  ChecklistReviewView,
  MaterialPriceAlertView,
  MaterialPricePoint,
  MaterialPriceView,
  PricingRecommendationView,
  RoughEstimateRequest,
  RoughEstimateView,
} from '@tongqian/types';

import { AiGatewayService } from '../../ai-gateway/ai-gateway.service.js';
import { CostCatalogService } from '../cost-catalog/cost-catalog.service.js';

const BASE_PER_SQM: Record<string, number> = {
  civil: 3100,
  decoration: 1800,
  industrial: 2600,
  municipal: 2400,
};

const STRUCTURE_FACTOR: Record<string, number> = {
  frame: 1,
  steel: 1.18,
  masonry: 0.92,
};

@Injectable()
export class CostEstimateService {
  private readonly alerts = new Map<string, MaterialPriceAlertView>();
  private readonly checklistReviews = new Map<string, ChecklistReviewView>();
  private readonly estimates = new Map<string, RoughEstimateView & { tenantId: string }>();

  constructor(@Inject(AiGatewayService) private readonly aiGateway: AiGatewayService, @Inject(CostCatalogService) private readonly costCatalogService: CostCatalogService) {}

  roughEstimate(input: RoughEstimateRequest & { tenantId: string }): RoughEstimateView {
    if (input.areaSqm <= 0) throw new Error('COST.INVALID_AREA');
    const base = BASE_PER_SQM[input.projectType] ?? 2800;
    const factor = STRUCTURE_FACTOR[input.structureType] ?? 1;
    const decorationFactor = input.decoration === 'premium' ? 1.25 : input.decoration === 'basic' ? 0.9 : 1;
    const reference = Math.round(base * factor * decorationFactor);
    const perSqmLowCny = Math.round(reference * 0.8);
    const perSqmHighCny = Math.round(reference * 1.3);
    const estimate: RoughEstimateView & { tenantId: string } = {
      aiTaskId: `cost-rough-${crypto.randomUUID()}`,
      comparableProjects: this.comparableProjects(input.region, input.projectType, reference),
      confidence: 'medium',
      disclaimer: 'cost.disclaimer.roughEstimate.referenceOnly.noSealedReport',
      id: crypto.randomUUID(),
      perSqmHighCny,
      perSqmLowCny,
      precisionBand: { high: 0.3, low: -0.2 },
      tenantId: input.tenantId,
      tierBadge: 1,
      totalHighCny: Math.round(perSqmHighCny * input.areaSqm),
      totalLowCny: Math.round(perSqmLowCny * input.areaSqm),
    };
    this.estimates.set(estimate.id, estimate);
    return this.omitTenant(estimate);
  }

  reviewChecklist(input: { sourceFileUrl: string; tenantId: string }): ChecklistReviewView {
    if (!input.sourceFileUrl) throw new Error('COST.CHECKLIST_FILE_REQUIRED');
    const review: ChecklistReviewView = {
      aiTaskId: `cost-checklist-${crypto.randomUUID()}`,
      findings: [
        { issueType: 'missing_item', recommendation: 'cost.checklist.recommendation.addMissingMeasures', severity: 'medium' },
        { itemCode: 'MAT-STEEL', issueType: 'unit_price_outlier', recommendation: 'cost.checklist.recommendation.compareRegionalSteelPrice', severity: 'high' },
        { itemCode: 'QTY-CONCRETE', issueType: 'quantity_outlier', recommendation: 'cost.checklist.recommendation.recheckQuantityBasis', severity: 'medium' },
      ],
      id: crypto.randomUUID(),
      sourceFileUrl: input.sourceFileUrl,
    };
    this.checklistReviews.set(review.id, review);
    return review;
  }

  recommendPricing(input: { baseCostCny: number; competitorPressure?: 'high' | 'low' | 'medium'; marginTargetPct?: number; projectFeatures: string[] }): PricingRecommendationView {
    if (input.baseCostCny <= 0) throw new Error('COST.INVALID_BASE_COST');
    const pressureDiscount = input.competitorPressure === 'high' ? 0.035 : input.competitorPressure === 'medium' ? 0.02 : 0.01;
    const target = input.marginTargetPct ?? 0.08;
    const tenderCny = Math.round(input.baseCostCny * (1 + target));
    const negotiationCny = Math.round(tenderCny * (1 - pressureDiscount));
    return {
      aiTaskId: `cost-pricing-${crypto.randomUUID()}`,
      id: crypto.randomUUID(),
      negotiationCny,
      rationale: ['cost.pricing.rationale.rulesEnginePlaceholder', 'cost.pricing.rationale.peerRadarPlaceholder', `cost.pricing.featureCount.${input.projectFeatures.length}`],
      tenderCny,
      yieldCny: Math.round(negotiationCny * 0.97),
    };
  }

  materialPrices(input: { materialCode: string; region: string; tenantId: string }): MaterialPriceView {
    const trend30d = this.trend(input.materialCode, input.region);
    const alert = this.alerts.get(this.alertKey(input.tenantId, input.materialCode, input.region));
    const latest = trend30d.at(-1)?.priceCny ?? 0;
    const previous = trend30d.at(-2)?.priceCny ?? latest;
    const pct = previous === 0 ? 0 : Math.abs((latest - previous) / previous) * 100;
    return {
      alertTriggered: pct >= (alert?.thresholdPct ?? 5),
      materialCode: input.materialCode,
      region: input.region,
      source: 'mock.knowledge.materialPrice',
      trend30d,
      unit: input.materialCode === 'cement' ? 'ton' : 'unit',
    };
  }

  upsertMaterialAlert(input: { materialCode: string; region: string; tenantId: string; thresholdPct?: number }): MaterialPriceAlertView {
    const alert: MaterialPriceAlertView = {
      id: this.alerts.get(this.alertKey(input.tenantId, input.materialCode, input.region))?.id ?? crypto.randomUUID(),
      materialCode: input.materialCode,
      region: input.region,
      tenantId: input.tenantId,
      thresholdPct: input.thresholdPct ?? 5,
    };
    this.alerts.set(this.alertKey(input.tenantId, input.materialCode, input.region), alert);
    return alert;
  }

  async estimateFromText(input: { area?: number; description: string; projectType: string; region: string; tenantId: string; userId: string }): Promise<unknown> {
    const catalogCandidates = this.costCatalogService.searchByKeyword(input.description, input.region);
    return this.invokeEstimate('cost-from-text', input, catalogCandidates);
  }

  async estimateFromPhoto(input: { photoUrls: string[]; projectStage: 'finishing' | 'mep' | 'rough_in'; region: string; tenantId: string; userId: string }): Promise<unknown> {
    const catalogCandidates = this.costCatalogService.searchByKeyword(input.projectStage, input.region);
    return this.invokeEstimate('cost-from-photo', input, catalogCandidates);
  }

  async estimateFromCadBoq(input: { extractedBoq: Array<{ description: string; qty: number; unit: string; workCode?: string }>; region: string; tenantId: string; userId: string }): Promise<unknown> {
    const catalogCandidates = input.extractedBoq.flatMap((item) => this.costCatalogService.searchByDescription(item.description)).slice(0, 20);
    return this.invokeEstimate('cost-from-cad', input, catalogCandidates);
  }

  private async invokeEstimate(flow: string, input: unknown, catalogCandidates: unknown[]): Promise<unknown> {
    const response = await this.aiGateway.invoke<unknown>({
      context: { catalogCandidates, flow },
      input: { catalogCandidates, input },
      options: { cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC, idempotencyKey: `${flow}-${crypto.randomUUID()}` },
      taskType: AiTaskType.COST_ROUGH_ESTIMATE,
      tenantId: typeof input === 'object' && input && 'tenantId' in input ? String(input.tenantId) : 'mock-tenant',
      userId: typeof input === 'object' && input && 'userId' in input ? String(input.userId) : 'mock-user',
    });
    return response.data;
  }

  private comparableProjects(region: string, projectType: string, reference: number): RoughEstimateView['comparableProjects'] {
    return [0.92, 1.04, 1.12].map((factor, index) => ({ name: `cost.comparable.${projectType}.${index + 1}`, perSqmCny: Math.round(reference * factor), region }));
  }

  private trend(materialCode: string, region: string): MaterialPricePoint[] {
    const seed = [...materialCode, ...region].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const base = materialCode === 'steel' ? 3900 : materialCode === 'cement' ? 420 : materialCode === 'concrete' ? 510 : 1800;
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 4, index + 1));
      const wave = Math.sin((seed + index) / 4) * 0.025 + index * 0.001;
      return { date: date.toISOString().slice(0, 10), priceCny: Math.round(base * (1 + wave)) };
    });
  }

  private alertKey(tenantId: string, materialCode: string, region: string): string {
    return `${tenantId}:${region}:${materialCode}`;
  }

  private omitTenant(estimate: RoughEstimateView & { tenantId: string }): RoughEstimateView {
    const { tenantId: _tenantId, ...view } = estimate;
    return view;
  }
}
