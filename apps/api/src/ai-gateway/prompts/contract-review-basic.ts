import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';

export const contractReviewBasicPrompt: PromptTemplate = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 300,
  description: 'Contract review basic prompt skeleton.',
  fallbackModel: 'deepseek-chat',
  fallbackText: 'The review is unavailable. Please retry later.',
  fewShotExamples: [],
  inputSchema: undefined,
  needsSanitize: true,
  outputSchema: undefined,
  primaryModel: 'qwen-max',
  safetyChecks: ['no_pii_leak', 'no_absolute_claims'],
  systemPrompt: 'You are a construction business risk review assistant.',
  taskType: AiTaskType.CONTRACT_REVIEW_BASIC,
  tier: (context) => ((context.amount ?? 0) > 1_000_000 ? AiOutputTier.TIER_2 : AiOutputTier.TIER_1),
  userTemplate: '{{input}}',
  version: 'v1',
};
