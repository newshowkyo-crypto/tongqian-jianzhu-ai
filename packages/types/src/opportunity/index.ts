import type { AiOutputTier } from '../ai-task/tier.js';

export type OpportunityOwnerVerifyStatus = 'high_risk' | 'pass' | 'warning';

export interface OpportunityView {
  amountEstimateCny: number;
  createdAt: string;
  deadline?: string;
  id: string;
  industry: string;
  meta?: Record<string, unknown>;
  ownerCreditCode?: string;
  ownerName: string;
  publishDate: string;
  rawUrl?: string;
  region: string;
  source: string;
  title: string;
}

export interface OpportunityPreferenceView {
  amountMaxCny?: number;
  amountMinCny?: number;
  industries: string[];
  pushEnabled: boolean;
  regions: string[];
  tenantId: string;
}

export interface OpportunityMatchView {
  bookmarked: boolean;
  matchScore: number;
  opportunity: OpportunityView;
  pushedAt: string;
  readAt?: string;
  tenantId: string;
}

export interface InvestabilityReportView {
  aiTaskId: string;
  createdAt: string;
  fundingScore: number;
  id: string;
  opportunityId: string;
  performanceScore: number;
  qualificationScore: number;
  relationshipScore: number;
  reportId?: string;
  riskPoints: string[];
  score: number;
  tenantId: string;
  tier: AiOutputTier;
}

export interface OwnerVerifyResultView {
  cachedUntil: string;
  evidence: Array<{ source: 'court' | 'credit' | 'government'; summary: string }>;
  ownerCreditCode: string;
  score: number;
  status: OpportunityOwnerVerifyStatus;
}

export interface PeerRadarView {
  bidRangeCny: { high: number; low: number };
  peers: Array<{ company: string; projectAmountCny: number; projectName: string; year: number }>;
  radiusKm: number;
}
