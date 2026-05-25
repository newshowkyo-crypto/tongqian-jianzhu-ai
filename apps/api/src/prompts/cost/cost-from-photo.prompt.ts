import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

import { costEstimateOutputSchema } from './cost-from-text.prompt.js';

export const costFromPhotoInputSchema = z.object({
  photoUrls: z.array(z.string().url()).min(1),
  projectStage: z.enum(['rough_in', 'finishing', 'mep']),
  region: z.string(),
});

export const costFromPhotoOutputSchema = costEstimateOutputSchema.extend({ extractedScope: z.array(z.string()) });

export const costFromPhotoPrompt: PromptTemplate<z.infer<typeof costFromPhotoInputSchema>, z.infer<typeof costFromPhotoOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 120,
  description: 'Estimate cost from jobsite photos with catalog grounding.',
  fallbackModel: 'qwen-vl-plus',
  fallbackText: '本估算仅作参考，最终造价以正式预算书为准。',
  fewShotExamples: [],
  inputSchema: costFromPhotoInputSchema,
  needsSanitize: true,
  outputSchema: costFromPhotoOutputSchema,
  primaryModel: 'qwen-vl-plus',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是建筑造价师和现场工程师。先识别 extractedScope，再结合 cost-catalog 候选估价；items[].source 必须为 cwicr 或 ai_estimate；必须输出 disclaimer: 本估算仅作参考，最终造价以正式预算书为准。',
  taskType: AiTaskType.COST_ROUGH_ESTIMATE,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<photos>{{photoUrls}}</photos><region>{{region}}</region><stage>{{projectStage}}</stage>',
  version: 'v1',
};
