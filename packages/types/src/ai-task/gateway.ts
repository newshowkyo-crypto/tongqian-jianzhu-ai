import type { TenantId, UserId } from '../common/protocol.js';

import type { AiTaskType } from './task-type.js';

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
