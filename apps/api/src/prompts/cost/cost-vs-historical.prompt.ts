import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const costVsHistoricalInputSchema = z.object({ current: z.record(z.unknown()), deviation: z.record(z.unknown()), similar: z.array(z.record(z.unknown())) });
export const costVsHistoricalOutputSchema = z.object({ disclaimer: z.string(), guidanceButtons: z.array(z.string()).length(5), reasons: z.array(z.string()), suggestions: z.array(z.string()), tier: z.number() });

export const costVsHistoricalPrompt: PromptTemplate<z.infer<typeof costVsHistoricalInputSchema>, z.infer<typeof costVsHistoricalOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 50,
  description: 'Explain deviation between current estimate and tenant historical projects.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本对比仅作咨询辅助，不替代造价师复核。',
  fewShotExamples: [],
  inputSchema: costVsHistoricalInputSchema,
  needsSanitize: true,
  outputSchema: costVsHistoricalOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是造价顾问。基于历史项目偏离度解释人材机比例、地区差、时间差。必须含 disclaimer、Tier 徽章和 5 引导按钮。',
  taskType: AiTaskType.COST_ROUGH_ESTIMATE,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<current>{{current}}</current><deviation>{{deviation}}</deviation><similar>{{similar}}</similar>',
  version: 'v1',
};
