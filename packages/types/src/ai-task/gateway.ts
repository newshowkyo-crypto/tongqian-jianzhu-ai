import type { TenantId, UserId } from '../common/protocol.js';
import type { RequiredElements } from '../report/required-elements.js';

import type { AiTaskType } from './task-type.js';
import type { AiOutputTier } from './tier.js';

export enum AiProviderCode {
  ALIYUN_DASHSCOPE = 'aliyun_dashscope',
  OPENROUTER = 'openrouter',
  DEEPSEEK_DIRECT = 'deepseek_direct',
}

export enum AiCacheStrategy {
  NONE = 'none',
  EXACT = 'exact',
  SEMANTIC = 'semantic',
  EXACT_AND_SEMANTIC = 'exact_and_semantic',
}

export enum AiSanitizeMaskType {
  COMPANY = 'company',
  PERSON = 'person',
  PROJECT = 'project',
  CONTACT = 'contact',
  AMOUNT = 'amount',
  ADDRESS = 'address',
  ID_CARD = 'id_card',
  BANK_CARD = 'bank_card',
  SOCIAL_CREDIT_CODE = 'social_credit_code',
}

export interface AiRequest<TInput = unknown, TContext = Record<string, unknown>> {
  taskType: AiTaskType;
  userId: UserId;
  tenantId: TenantId;
  input: TInput;
  context: TContext;
  options?: {
    cacheStrategy?: AiCacheStrategy;
    preferredProvider?: AiProviderCode;
    allowOverseasModel?: boolean;
    idempotencyKey?: string;
  };
}

export interface TierContext {
  amount?: number;
  confidence?: number;
  hasLegalRisk?: boolean;
  hasOverseasConsent?: boolean;
  role?: string;
  urgency?: 'high' | 'low' | 'medium';
}

export interface AiPromptMessage {
  content: string;
  role: 'assistant' | 'system' | 'user';
}

export interface PromptExample<TInput = unknown, TOutput = unknown> {
  input: TInput;
  name: string;
  output: TOutput;
}

export interface PromptTemplate<TInput = unknown, TOutput = unknown> {
  cacheStrategy: AiCacheStrategy;
  costCredits: number;
  description: string;
  fallbackText: string;
  fewShotExamples: Array<PromptExample<TInput, TOutput>>;
  inputSchema?: unknown;
  needsSanitize: boolean;
  outputSchema?: unknown;
  primaryModel: string;
  fallbackModel: string;
  safetyChecks: string[];
  systemPrompt: string;
  taskType: AiTaskType;
  tier: (context: TierContext) => AiOutputTier;
  userTemplate: string;
  version: string;
}

export interface AiCostBreakdown {
  credits: number;
  rmb: number;
}

export interface AiResponse<TOutput = unknown> extends RequiredElements {
  cacheHit: boolean;
  cost: AiCostBreakdown;
  data: TOutput;
  modelUsed: string;
  providerUsed: AiProviderCode;
}

export interface SanitizedText {
  masked: string;
  replacements: Record<string, string>;
  maskTypes: readonly AiSanitizeMaskType[];
}

export const AI_PROVIDER_CODE_VALUES = Object.values(AiProviderCode);
export const AI_CACHE_STRATEGY_VALUES = Object.values(AiCacheStrategy);
export const AI_SANITIZE_MASK_TYPE_VALUES = Object.values(AiSanitizeMaskType);

export type AiProviderCodeValue = `${AiProviderCode}`;
export type AiCacheStrategyValue = `${AiCacheStrategy}`;
export type AiSanitizeMaskTypeValue = `${AiSanitizeMaskType}`;
