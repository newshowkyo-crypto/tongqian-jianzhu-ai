import type { AiOutputTier } from '../ai-task/tier.js';

export type RiskLevel = 'green' | 'red' | 'yellow';
export type RiskReviewType = 'basic' | 'pro' | 'tender';
export type RiskType =
  | 'excessive_ip_confidentiality'
  | 'excessive_delay_penalty'
  | 'owner_unilateral_termination'
  | 'payment_milestone_unreasonable'
  | 'unlimited_liability'
  | 'unreasonable_variation_claim_limit';

export interface ContractRiskFindingView {
  clauseNo?: string;
  clauseText: string;
  id: string;
  impact: string;
  level: RiskLevel;
  ruleId?: string;
  standardWording?: string;
  suggestion: string;
  type: RiskType;
}

export interface ContractReviewView {
  aiTaskId: string;
  contractType: string;
  contractUrl: string;
  createdAt: string;
  findingCount: number;
  findings: ContractRiskFindingView[];
  greenCount: number;
  id: string;
  overallRisk: RiskLevel;
  projectAmountCny?: number;
  redCount: number;
  reportId?: string;
  status: 'human_takeover' | 'ready';
  tenantId: string;
  tier: AiOutputTier;
  type: RiskReviewType;
  userId: string;
  yellowCount: number;
}

export interface ModificationLetterView {
  aiTaskId: string;
  content: string;
  createdAt: string;
  id: string;
  pdfUrl?: string;
  reviewId: string;
}

export interface ClaimStrategyView {
  aiTaskId: string;
  contractReviewId?: string;
  createdAt: string;
  evidenceList: string[];
  facts: Record<string, unknown>;
  id: string;
  steps: string[];
  tier: AiOutputTier;
}
