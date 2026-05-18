export type ReceivableAgeBucket = '180+' | '30-60' | '60-90' | '90-180' | '<30';
export type FinanceTier = 1 | 2 | 3;

export interface ReceivableView {
  ageBucket: ReceivableAgeBucket;
  amountCny: number;
  debtorName: string;
  dueDate: string;
  id: string;
  invoiceDate: string;
  status: 'collected' | 'overdue' | 'pending';
  tenantId: string;
}

export interface AgingAnalysisView {
  aiTaskId: string;
  byBucket: Record<ReceivableAgeBucket, number>;
  disclaimer: string;
  highRiskTotalCny: number;
  id: string;
  reportId?: string;
  tierBadge: FinanceTier;
  totalAmountCny: number;
}

export interface CashflowForecastView {
  aiTaskId: string;
  alertTriggered: boolean;
  forecastPeriod: 'next_12_months';
  id: string;
  monthlyData: Array<{ month: string; netCashflowCny: number }>;
}

export interface FinancingDiagnosisView {
  aiTaskId: string;
  availableTypes: string[];
  disclaimer: string;
  estimatedAmounts: Array<{ highCny: number; lowCny: number; type: string }>;
  id: string;
  preparationSteps: string[];
  recommendedPath: 'agent_help' | 'self_apply' | 'tongqian_consult';
  tierBadge: FinanceTier;
}

export interface FinanceDispatchRecommendationView {
  reason: string;
  target: 'agent_finance' | 'self_service' | 'tongqian_strategy';
  tierBadge: FinanceTier;
}
