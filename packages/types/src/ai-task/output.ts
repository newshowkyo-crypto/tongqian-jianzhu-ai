import type { TraceId } from '../common/protocol.js';

import type { AiOutputTier } from './tier.js';

export enum AiConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum AiAudienceRole {
  OWNER = 'owner',
  AGENT = 'agent',
  GOV_SOE = 'gov_soe',
  EMPLOYEE = 'employee',
}

export enum AiNextStepAction {
  SELF_EXECUTE = 'self_execute',
  APPLY_AGENT = 'apply_agent',
  APPLY_TONGQIAN_CONSULTING = 'apply_tongqian_consulting',
  REQUEST_HUMAN_REVIEW = 'request_human_review',
  REQUEST_EXPERT_CONSULTING = 'request_expert_consulting',
  EXECUTE_BY_PLAN = 'execute_by_plan',
  RECOMMEND_TO_TONGQIAN = 'recommend_to_tongqian',
  CONTACT_PLATFORM_SUPPORT = 'contact_platform_support',
  REPORT_TO_OWNER = 'report_to_owner',
}

export interface AiNextStepButton {
  action: AiNextStepAction;
  i18nKey: string;
  role: AiAudienceRole;
  tierMin?: AiOutputTier;
  tierMax?: AiOutputTier;
}

export interface AiRequiredOutputElements {
  disclaimer: string;
  tier: AiOutputTier;
  confidence: AiConfidenceLevel;
  dataSourceStatement: string;
  traceId: TraceId;
  nextStepButtons: readonly AiNextStepButton[];
}

export interface AiResponseMeta {
  modelUsed: string;
  providerUsed: string;
  costCredits: number;
  tier: AiOutputTier;
  confidence: AiConfidenceLevel;
  cacheHit: boolean;
  traceId: TraceId;
}

export const AI_CONFIDENCE_LEVEL_VALUES = Object.values(AiConfidenceLevel);
export const AI_AUDIENCE_ROLE_VALUES = Object.values(AiAudienceRole);
export const AI_NEXT_STEP_ACTION_VALUES = Object.values(AiNextStepAction);

export type AiConfidenceLevelValue = `${AiConfidenceLevel}`;
export type AiAudienceRoleValue = `${AiAudienceRole}`;
export type AiNextStepActionValue = `${AiNextStepAction}`;
