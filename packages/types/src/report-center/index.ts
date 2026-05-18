import type { AiAudienceRole, AiConfidenceLevel, AiNextStepAction } from '../ai-task/output.js';
import type { AiOutputTier } from '../ai-task/tier.js';
import type { ReportNextStepHint } from '../report/required-elements.js';

export type ReportBrandMode = 'co_brand_agent' | 'co_brand_flagship' | 'standard';
export type ReportEscalationType = 'human_review' | 'tongqian_consult';
export type ReportRole = AiAudienceRole.AGENT | AiAudienceRole.EMPLOYEE | AiAudienceRole.GOV_SOE | AiAudienceRole.OWNER;

export interface GuidanceButtonView {
  action: AiNextStepAction;
  highlighted?: boolean;
  i18nKey: string;
  role: ReportRole;
}

export interface ReportDifficultyRadarView {
  agentAlternative: { compensation: boolean; days: number; successRate: number };
  costScore: number;
  professional: number;
  renderedSvg?: string;
  riskScore: number;
  timeHours: number;
}

export interface ReportView {
  agentId?: string;
  aiTaskType: string;
  brandMode: ReportBrandMode;
  confidence: AiConfidenceLevel;
  createdAt: string;
  dataSnapshot: Record<string, unknown>;
  deviceLimit: number;
  disclaimer: string;
  guidanceButtons: GuidanceButtonView[];
  h5Url?: string;
  id: string;
  nextStep: ReportNextStepHint;
  pdfUrl?: string;
  rating?: { feedback?: string; ratedAt: string; stars: number };
  radar?: ReportDifficultyRadarView;
  sourceModule: string;
  sourceTaskId: string;
  templateVersion: number;
  tenantId: string;
  tier: AiOutputTier;
  traceId: string;
  userId: string;
  watermark: string;
}

export interface ReportTemplateView {
  createdAt: string;
  id: string;
  isActive: boolean;
  layoutSchema: Record<string, unknown>;
  sourceModule: string;
  version: number;
}
