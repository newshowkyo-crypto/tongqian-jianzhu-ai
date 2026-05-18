import type { AiOutputTier } from '../ai-task/tier.js';

export type TenderEligibilityStatus = 'fail' | 'partial' | 'pass';
export type TenderProjectStatus = 'framework_generated' | 'parsed' | 'submitted' | 'uploaded';

export interface TenderProjectView {
  amountEstimateCny?: number;
  createdAt: string;
  id: string;
  industry?: string;
  meta?: Record<string, unknown>;
  name: string;
  region?: string;
  sourceFileUrl: string;
  status: TenderProjectStatus;
  tenantId: string;
  userId: string;
}

export interface TenderSummaryView {
  aiTaskId: string;
  createdAt: string;
  eligibilityReq: string[];
  id: string;
  keyPoints: string[];
  projectId: string;
  reportId?: string;
  schedule: Array<{ date: string; event: string }>;
  scoringSummary: Array<{ item: string; points: number }>;
}

export interface TenderEligibilityView {
  aiTaskId: string;
  createdAt: string;
  id: string;
  missingItems: string[];
  projectId: string;
  remediation: string[];
  status: TenderEligibilityStatus;
}

export interface TenderFrameworkView {
  aiTaskId: string;
  businessOutline: Array<{ keyPoints: string[]; title: string; words: number }>;
  createdAt: string;
  id: string;
  projectId: string;
  technicalOutline: Array<{ keyPoints: string[]; title: string; words: number }>;
  templateCode: 'building' | 'highway' | 'municipal';
  tier: AiOutputTier;
}

export interface TenderSectionDraftView {
  aiTaskId: string;
  approvedBy?: string;
  content: string;
  createdAt: string;
  creditsCost: number;
  id: string;
  projectId: string;
  sectionKey: string;
  version: number;
}

export interface TenderScorePredictionView {
  aiTaskId: string;
  breakdown: Array<{ item: string; predicted: number; total: number }>;
  id: string;
  improvements: string[];
  predictedScore: number;
  projectId: string;
}
