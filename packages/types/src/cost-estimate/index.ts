export type CostEstimateConfidence = 'high' | 'low' | 'medium';

export interface RoughEstimateRequest {
  areaSqm: number;
  decoration: string;
  projectType: string;
  region: string;
  structureType: string;
}

export interface RoughEstimateView {
  aiTaskId: string;
  comparableProjects: Array<{ name: string; perSqmCny: number; region: string }>;
  disclaimer: string;
  id: string;
  perSqmHighCny: number;
  perSqmLowCny: number;
  precisionBand: { high: 0.3; low: -0.2 };
  totalHighCny: number;
  totalLowCny: number;
  tierBadge: 1;
  confidence: CostEstimateConfidence;
}

export interface ChecklistReviewFinding {
  itemCode?: string;
  issueType: 'missing_item' | 'quantity_outlier' | 'unit_price_outlier';
  recommendation: string;
  severity: 'high' | 'low' | 'medium';
}

export interface ChecklistReviewView {
  aiTaskId: string;
  findings: ChecklistReviewFinding[];
  id: string;
  sourceFileUrl: string;
}

export interface PricingRecommendationView {
  aiTaskId: string;
  id: string;
  negotiationCny: number;
  rationale: string[];
  tenderCny: number;
  yieldCny: number;
}

export interface MaterialPricePoint {
  date: string;
  priceCny: number;
}

export interface MaterialPriceView {
  alertTriggered: boolean;
  materialCode: string;
  region: string;
  source: string;
  spec?: string;
  trend30d: MaterialPricePoint[];
  unit: string;
}

export interface MaterialPriceAlertView {
  id: string;
  materialCode: string;
  region: string;
  tenantId: string;
  thresholdPct: number;
}
