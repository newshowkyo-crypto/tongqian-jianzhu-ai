import type { AiConfidenceLevel } from '../ai-task/output.js';
import type { AiOutputTier } from '../ai-task/tier.js';
import type { OwnerRiskLevel } from '../owner-risk/index.js';

// Enums
export type SignalType = 'project_hot' | 'party_risk' | 'competitor_active' | 'qualification_dynamic' | 'policy_window' | 'judicial_risk';
export type SourceType = 'tender_platform' | 'courtWebsite' | 'creditPlatform' | 'policyWebsite' | 'newsMedia' | 'internal';
export type TagCategory = 'region' | 'industry' | 'risk_type' | 'opportunity_type';
export type UnlockType = 'impact_analysis' | 'simulation' | 'report' | 'full';
export type SimulationType = 'project_participation' | 'market_impact' | 'risk_spread' | 'opportunity_timing';
export type MarketSignalReportType = 'situation_summary' | 'impact_analysis' | 'participation_recommendation';
export type FeedbackType = 'accuracy' | 'relevance' | 'usefulness' | 'new_info';
export type MarketSignalGenerationType = 'summary' | 'impact_analysis' | 'simulation' | 'report';
export type MarketSignalRuleType = 'signal_generation' | 'risk_classification' | 'opportunity_scoring';

// Views
export interface MarketSignalView {
  id: string;
  tenantId: string;
  userId: string;
  signalType: SignalType;
  title: string;
  summary: string;
  region: string;
  businessLine?: string;
  riskLevel: OwnerRiskLevel;
  opportunityLevel: OpportunityLevel;
  confidence: AiConfidenceLevel;
  sourceId?: string;
  sourceUrl?: string;
  rawData?: Record<string, unknown>;
  impactAnalysis?: MarketImpactAnalysisView;
  isPublished: boolean;
  isFeatured: boolean;
  tierBadge: AiOutputTier;
  unlockCredits: number;
  viewCount: number;
  feedbackCount: number;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityLevel = 'low' | 'medium' | 'high';

export interface MarketImpactAnalysisView {
  affectedRegions: string[];
  affectedIndustries: string[];
  potentialOpportunities: string[];
  potentialRisks: string[];
  suggestedActions: string[];
  confidence: AiConfidenceLevel;
  tierBadge: AiOutputTier;
}

export interface MarketSignalSourceView {
  id: string;
  sourceName: string;
  sourceType: SourceType;
  sourceUrl?: string;
  region: string;
  dataTypes: string[];
  crawlIntervalMin: number;
  isActive: boolean;
  lastCrawledAt?: string;
  healthStatus: 'healthy' | 'degraded' | 'unknown';
  createdAt: string;
}

export interface MarketSignalTagView {
  id: string;
  tagKey: string;
  tagName: string;
  tagCategory: TagCategory;
  usageCount: number;
  createdAt: string;
}

export interface MarketSignalUnlockLogView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  unlockType: UnlockType;
  creditsCharged: number;
  status: 'success' | 'failed' | 'refunded';
  traceId: string;
  createdAt: string;
}

export interface MarketSignalSimulationView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  simulationType: SimulationType;
  inputParams: Record<string, unknown>;
  simulationResult: Record<string, unknown>;
  confidence: AiConfidenceLevel;
  tierBadge: AiOutputTier;
  aiTaskId?: string;
  creditsCost: number;
  createdAt: string;
}

export interface MarketSignalReportView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  reportType: MarketSignalReportType;
  title: string;
  tierBadge: AiOutputTier;
  confidence: AiConfidenceLevel;
  executiveSummary: string;
  dataSnapshot: Record<string, unknown>;
  h5Url?: string;
  pdfUrl?: string;
  aiTaskId?: string;
  reportId?: string;
  creditsCost: number;
  disclaimer: string;
  createdAt: string;
}

export interface MarketSignalFeedbackView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  feedbackType: FeedbackType;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MarketSignalGenerationLogView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  generationType: MarketSignalGenerationType;
  aiTaskId?: string;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot?: Record<string, unknown>;
  creditsCost: number;
  status: 'success' | 'failed' | 'partial';
  errorCode?: string;
  traceId: string;
  createdAt: string;
}

export interface MarketSignalRuleConfigView {
  id: string;
  ruleKey: string;
  ruleName: string;
  ruleType: MarketSignalRuleType;
  configJson: Record<string, unknown>;
  isActive: boolean;
  version: number;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Compliance Types
export type SensitiveTermCategory = 'illegal_activity' | 'unethical' | 'misleading' | 'discriminatory' | 'regulated_content';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type RefusalType = 'red_line_violation' | 'policy_violation' | 'ethical_violation' | 'unverified_claim';
export type AuditResult = 'approved' | 'flagged' | 'rejected';
export type AuditedBy = 'human' | 'system';
export type CheckType = 'input_sanitization' | 'output_filtering' | 'red_line_detection' | 'sensitive_term_check';
export type CheckResult = 'pass' | 'block' | 'rewrite' | 'escalate';

export interface ComplianceSensitiveTermView {
  id: string;
  termKey: string;
  termPattern: string;
  termCategory: SensitiveTermCategory;
  severityLevel: SeverityLevel;
  description?: string;
  refusalTemplate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceRefusalTemplateView {
  id: string;
  templateKey: string;
  refusalType: RefusalType;
  templateContent: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiOutputAuditSampleView {
  id: string;
  aiTaskId: string;
  taskType: string;
  inputHash: string;
  outputSnapshot: Record<string, unknown>;
  auditResult: AuditResult;
  auditReason?: string;
  auditedBy?: AuditedBy;
  auditorId?: string;
  createdAt: string;
}

export interface AiComplianceLogView {
  id: string;
  aiTaskId: string;
  tenantId: string;
  userId: string;
  checkType: CheckType;
  checkResult: CheckResult;
  blockedContent?: string;
  rewriteResult?: string;
  triggeredRules?: Record<string, unknown>;
  creditsCost: number;
  traceId: string;
  createdAt: string;
}

// DTOs for API requests
export interface CreateMarketSignalDto {
  signalType: SignalType;
  title: string;
  summary: string;
  region: string;
  businessLine?: string;
  riskLevel?: OwnerRiskLevel;
  opportunityLevel?: OpportunityLevel;
  sourceUrl?: string;
  rawData?: Record<string, unknown>;
  tags?: string[];
}

export interface UnlockMarketSignalDto {
  signalId: string;
  unlockType: UnlockType;
  idempotencyKey?: string;
}

export interface CreateMarketSignalSimulationDto {
  signalId: string;
  simulationType: SimulationType;
  inputParams: Record<string, unknown>;
}

export interface CreateMarketSignalReportDto {
  signalId: string;
  reportType: MarketSignalReportType;
}

export interface CreateMarketSignalFeedbackDto {
  signalId: string;
  feedbackType: FeedbackType;
  rating: number;
  comment?: string;
}

export interface MarketSignalAnalysisInputDto {
  signalId: string;
  analysisType: MarketSignalGenerationType;
}
