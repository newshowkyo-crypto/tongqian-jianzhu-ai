import { Injectable } from '@nestjs/common';

interface BudgetInput {
  areaSqm: number;
  createdBy: string;
  plannedStart?: string;
  projectName: string;
  projectType: string;
  qualityLevel: string;
  region: string;
  structureType: string;
  tenantId: string;
}

interface BudgetEstimateView extends BudgetInput {
  aiAnalysis: string;
  baselineCny: number;
  coefficients: Record<'category' | 'quality' | 'region' | 'structure' | 'time', number>;
  confidence: number;
  disclaimer: string;
  estimateHighCny: number;
  estimateLowCny: number;
  estimateMidCny: number;
  id: string;
  tierBadge: number;
}

const PROJECT_BASE: Record<string, number> = { dc: 7200, factory: 2600, hospital: 5200, hotel: 4900, office: 3600, residential: 3300, school: 3100, warehouse: 2300 };
const REGION_FACTOR: Record<string, number> = { county: 0.85, first_tier: 1.2, provincial: 1.05, third_fourth: 0.92 };
const QUALITY_FACTOR: Record<string, number> = { luxury: 1.6, premium: 1.35, raw: 1, standard: 1.15 };
const CATEGORY_FACTOR: Record<string, number> = { dc: 2.2, factory: 1, hospital: 1.55, hotel: 1.45, office: 1.1, residential: 1.2, school: 1.08, warehouse: 0.95 };
const STRUCTURE_FACTOR: Record<string, number> = { brick_concrete: 1, frame: 1.15, frame_shear: 1.25, prefab: 1.3, steel: 1.4 };

@Injectable()
export class BudgetEstimatorService {
  private readonly estimates = new Map<string, BudgetEstimateView>();

  estimate(input: BudgetInput): BudgetEstimateView {
    if (input.areaSqm <= 0) throw new Error('BUDGET.INVALID_AREA');
    const baselineCny = this.getBaselineUnitCost(input.projectType, input.structureType, input.region, this.year(input.plannedStart));
    const coefficients = {
      category: CATEGORY_FACTOR[input.projectType] ?? 1,
      quality: QUALITY_FACTOR[input.qualityLevel] ?? 1,
      region: REGION_FACTOR[input.region] ?? 1,
      structure: STRUCTURE_FACTOR[input.structureType] ?? 1,
      time: this.timeCoefficient(input.plannedStart),
    };
    const product = Object.values(coefficients).reduce((total, factor) => total * factor, 1);
    const estimateMidCny = Math.round(input.areaSqm * baselineCny * product);
    const estimate: BudgetEstimateView = {
      ...input,
      aiAnalysis: `${input.projectName} estimate uses area x baseline unit cost x region/quality/category/structure/time coefficients. Cost range is advisory and needs estimator review.`,
      baselineCny,
      coefficients,
      confidence: 0.72,
      disclaimer: 'AI概算仅作经营辅助，不替代造价师正式成果或审计结论。',
      estimateHighCny: Math.round(estimateMidCny * 1.15),
      estimateLowCny: Math.round(estimateMidCny * 0.85),
      estimateMidCny,
      id: crypto.randomUUID(),
      tierBadge: 2,
    };
    this.estimates.set(estimate.id, estimate);
    return estimate;
  }

  getBaselineUnitCost(projectType: string, structureType: string, region: string, year = 2026): number {
    const base = PROJECT_BASE[projectType] ?? 3000;
    const structure = STRUCTURE_FACTOR[structureType] ?? 1;
    const regionFactor = REGION_FACTOR[region] ?? 1;
    const yearFactor = 1 + Math.max(0, year - 2026) * 0.025;
    return Math.round(base * structure * regionFactor * yearFactor);
  }

  list(): BudgetEstimateView[] {
    return [...this.estimates.values()];
  }

  private timeCoefficient(plannedStart?: string): number {
    if (!plannedStart) return 1.02;
    const start = new Date(plannedStart);
    const monthIndex = start.getUTCFullYear() * 12 + start.getUTCMonth() - (2026 * 12 + 0);
    return Number((1 + Math.max(0, monthIndex) * 0.0025).toFixed(3));
  }

  private year(plannedStart?: string): number {
    return plannedStart ? new Date(plannedStart).getUTCFullYear() : 2026;
  }
}
