import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

import { costEstimateOutputSchema } from './cost-from-text.prompt.js';

export const costFromCadInputSchema = z.object({
  extractedBoq: z.array(z.object({ description: z.string(), qty: z.number(), unit: z.string(), workCode: z.string().optional() })),
  region: z.string(),
});

export const costFromCadPrompt: PromptTemplate<z.infer<typeof costFromCadInputSchema>, z.infer<typeof costEstimateOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 80,
  description: 'Estimate from extracted CAD BOQ; CAD parsing itself is a V2 stub.',
  fallbackModel: 'qwen-plus',
  fallbackText: 'CAD 解析能力建设中，请先用 IFC→Excel 工具导出 BOQ 后用本接口。本估算仅作参考，最终造价以正式预算书为准。',
  fewShotExamples: [],
  inputSchema: costFromCadInputSchema,
  needsSanitize: true,
  outputSchema: costEstimateOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是建筑造价师。输入已经是外部 CAD/IFC 工具抽出的 BOQ，不解析 CAD 原图。根据 BOQ 和 cost-catalog 候选估价；items[].source 必须为 cwicr 或 ai_estimate；必须输出 disclaimer。',
  taskType: AiTaskType.COST_ROUGH_ESTIMATE,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<boq>{{extractedBoq}}</boq><region>{{region}}</region>',
  version: 'v1',
};
