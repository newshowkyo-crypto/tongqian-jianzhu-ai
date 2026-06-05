import type { AiConfidenceLevel } from '../ai-task/output.js';
import type { AiOutputTier } from '../ai-task/tier.js';

// Enums
export type OwnerRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type OwnerRiskCardType = 'guarantee' | 'mixing' | 'counterparty' | 'receivable';
export type GuaranteeType = 'mortgage' | 'pledge' | 'joint_liability';
export type GuaranteeStatus = 'active' | 'released' | 'defaulted';
export type MixingType = 'fund_mixing' | 'asset_mixing' | 'debt_mixing' | 'equity_mixing';
export type CounterpartyType = 'client' | 'supplier' | 'partner';
export type RiskEventType = 'court' | 'credit' | 'license' | 'tax' | 'safety';
export type AgeBucket = '0_30' | '30_60' | '60_90' | '90_180' | '180_plus';
export type ReceivableStatus = 'normal' | 'overdue' | 'bad_debt';
export type OwnerRiskReportType = 'overview' | 'guarantee' | 'mixing' | 'counterparty' | 'receivable';
export type ReviewType = 'human_review' | 'tongqian_consult' | 'expert_consult';
export type ReviewStatus = 'pending' | 'reviewing' | 'completed' | 'rejected';
export type OwnerRiskGenerationType = 'overview' | 'guarantee_analysis' | 'mixing_analysis' | 'counterparty_analysis' | 'receivable_analysis' | 'report';
export type OwnerRiskRuleType = 'guarantee_threshold' | 'mixing_indicator' | 'counterparty_risk' | 'receivable_aging';
export type DisclaimerType = 'guarantee' | 'mixing' | 'counterparty' | 'receivable' | 'general';

// Views
export interface OwnerRiskProfileView {
  id: string;
  tenantId: string;
  userId: string;
  ownerName: string;
  idCardMasked?: string;
  creditCode?: string;
  overallRiskLevel: OwnerRiskLevel;
  guaranteeRiskLevel: OwnerRiskLevel;
  mixingRiskLevel: OwnerRiskLevel;
  counterpartyRiskLevel: OwnerRiskLevel;
  receivableRiskLevel: OwnerRiskLevel;
  riskScore: number;
  lastAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerRiskCardView {
  id: string;
  tenantId: string;
  userId: string;
  cardType: OwnerRiskCardType;
  cardKey: string;
  title: string;
  summary: string;
  riskLevel: OwnerRiskLevel;
  tierBadge: AiOutputTier;
  confidence: AiConfidenceLevel;
  unlockCredits: number;
  isUnlocked: boolean;
  isAiGenerated: boolean;
  dataSnapshot: Record<string, unknown>;
  dataSource?: string;
  sourceUrl?: string;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerGuaranteeRecordView {
  id: string;
  profileId: string;
  tenantId: string;
  guaranteedCompany: string;
  guaranteeAmount: number;
  guaranteeType: GuaranteeType;
  startDate?: string;
  endDate?: string;
  status: GuaranteeStatus;
  riskLevel: OwnerRiskLevel;
  aiAnalysis?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerCompanyMixingRecordView {
  id: string;
  profileId: string;
  tenantId: string;
  mixingType: MixingType;
  description: string;
  riskLevel: OwnerRiskLevel;
  evidence: Record<string, unknown>;
  aiSuggestion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CounterpartyWatchlistView {
  id: string;
  profileId: string;
  tenantId: string;
  counterpartyName: string;
  counterpartyCode?: string;
  counterpartyType: CounterpartyType;
  riskLevel: OwnerRiskLevel;
  riskEvents: CounterpartyRiskEventView[];
  lastEventAt?: string;
  aiAnalysis?: string;
  isWatched: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CounterpartyRiskEventView {
  id: string;
  counterpartyId: string;
  tenantId: string;
  eventType: RiskEventType;
  eventDate: string;
  eventSummary: string;
  severity: OwnerRiskLevel;
  source: string;
  sourceUrl?: string;
  aiInterpretation?: string;
  createdAt: string;
}

export interface ReceivableRiskRecordView {
  id: string;
  profileId: string;
  tenantId: string;
  debtorName: string;
  debtorCode?: string;
  amount: number;
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  ageBucket: AgeBucket;
  status: ReceivableStatus;
  riskLevel: OwnerRiskLevel;
  aiAnalysis?: string;
  collectionSuggest?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerRiskReportView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  reportType: OwnerRiskReportType;
  title: string;
  tierBadge: AiOutputTier;
  confidence: AiConfidenceLevel;
  riskLevel: OwnerRiskLevel;
  executiveSummary: string;
  dataSnapshot: Record<string, unknown>;
  sections: OwnerRiskReportSectionView[];
  h5Url?: string;
  pdfUrl?: string;
  aiTaskId?: string;
  reportId?: string;
  creditsCost: number;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerRiskReportSectionView {
  sectionKey: string;
  title: string;
  content: string;
  riskLevel?: OwnerRiskLevel;
  tierBadge?: AiOutputTier;
  confidence?: AiConfidenceLevel;
  suggestedActions?: string[];
}

export interface OwnerRiskUnlockLogView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  cardId?: string;
  cardKey?: string;
  creditsCharged: number;
  status: 'success' | 'failed' | 'refunded';
  traceId: string;
  createdAt: string;
}

export interface OwnerRiskReviewRequestView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  reportId?: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  ticketId?: string;
  assignedTo?: string;
  reviewResult?: string;
  creditsCost: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OwnerRiskGenerationLogView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  generationType: OwnerRiskGenerationType;
  aiTaskId?: string;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot?: Record<string, unknown>;
  creditsCost: number;
  status: 'success' | 'failed' | 'partial';
  errorCode?: string;
  traceId: string;
  createdAt: string;
}

export interface OwnerRiskRuleConfigView {
  id: string;
  ruleKey: string;
  ruleName: string;
  ruleType: OwnerRiskRuleType;
  configJson: Record<string, unknown>;
  isActive: boolean;
  version: number;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerRiskDisclaimerView {
  id: string;
  disclaimerKey: string;
  disclaimerType: DisclaimerType;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateOwnerRiskProfileDto {
  ownerName: string;
  idCardMasked?: string;
  creditCode?: string;
}

export interface UpdateOwnerRiskProfileDto {
  ownerName?: string;
  idCardMasked?: string;
  creditCode?: string;
}

export interface UnlockOwnerRiskCardDto {
  profileId: string;
  cardId: string;
  idempotencyKey?: string;
}

export interface SubmitOwnerRiskReviewDto {
  profileId: string;
  reportId?: string;
  reviewType: ReviewType;
}

export interface OwnerRiskAnalysisInputDto {
  profileId: string;
  analysisType: OwnerRiskGenerationType;
}
