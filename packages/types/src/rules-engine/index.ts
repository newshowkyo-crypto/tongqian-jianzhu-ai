export type RuleStatusColor = 'green' | 'over' | 'red' | 'yellow';

export interface QualificationRuleView {
  category: string;
  fromLevel?: string;
  id: string;
  isActive: boolean;
  requirements: Record<string, unknown>;
  sourcePolicyId?: string;
  toLevel: string;
  version: number;
}

export interface ContractRuleView {
  id: string;
  isActive: boolean;
  riskLevel: 'green' | 'red' | 'yellow';
  standardWording: string;
  suggestion: string;
  trigger: { amountThresholdCny?: number; keywords?: string[] };
  type: string;
  version: number;
}

export interface TenderRuleView {
  bidStrategy: Record<string, unknown>;
  id: string;
  industry: string;
  isActive: boolean;
  scoringItem: string;
  trapWarnings: string[];
  version: number;
  weightPct: number;
}

export interface ReferencePriceView {
  amountHighCny: number;
  amountLowCny: number;
  dataSource: 'expert' | 'historical';
  id: string;
  isActive: boolean;
  region?: string;
  sampleCount?: number;
  serviceType: string;
  updatedAt: string;
}

export interface RuleVersionView {
  changedBy: string;
  changeReason: string;
  createdAt: string;
  id: string;
  ruleId: string;
  ruleTable: string;
  snapshot: Record<string, unknown>;
  version: number;
}
