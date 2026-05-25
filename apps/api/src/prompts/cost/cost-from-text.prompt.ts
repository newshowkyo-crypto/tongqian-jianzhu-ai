import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const costEstimateOutputSchema = z.object({
  confidence: z.number().min(0).max(1),
  disclaimer: z.string(),
  items: z.array(z.object({
    description: z.string(),
    qty: z.number(),
    source: z.enum(['cwicr', 'ai_estimate']),
    totalPrice: z.number(),
    unit: z.string(),
    unitPrice: z.number(),
    workCode: z.string(),
  })),
  totalCny: z.number(),
});

export const costFromTextInputSchema = z.object({
  area: z.number().optional(),
  description: z.string().min(10),
  projectType: z.string(),
  region: z.string(),
});

export const costFromTextPrompt: PromptTemplate<z.infer<typeof costFromTextInputSchema>, z.infer<typeof costEstimateOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 100,
  description: 'Estimate construction cost from plain text with cost-catalog candidates.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本估算仅作参考，最终造价以正式预算书为准。',
  fewShotExamples: [
    { name: '小工程', input: { description: '200 平米办公室装修', projectType: 'decoration', region: '上海' }, output: { confidence: 0.78, disclaimer: '本估算仅作参考，最终造价以正式预算书为准。', items: [{ description: '墙面乳胶漆', qty: 200, source: 'cwicr', totalPrice: 6000, unit: 'm2', unitPrice: 30, workCode: 'DDC-PAINT' }], totalCny: 6000 } },
    { name: '中工程', input: { area: 1000, description: '厂房地坪和机电粗估', projectType: 'industrial', region: '苏州' }, output: { confidence: 0.72, disclaimer: '本估算仅作参考，最终造价以正式预算书为准。', items: [{ description: '金刚砂地坪', qty: 1000, source: 'ai_estimate', totalPrice: 85000, unit: 'm2', unitPrice: 85, workCode: 'AI-FLOOR' }], totalCny: 85000 } },
    { name: '大工程', input: { area: 12000, description: '住宅主体结构粗估', projectType: 'civil', region: '杭州' }, output: { confidence: 0.69, disclaimer: '本估算仅作参考，最终造价以正式预算书为准。', items: [{ description: '现浇混凝土结构', qty: 12000, source: 'ai_estimate', totalPrice: 36000000, unit: 'm2', unitPrice: 3000, workCode: 'AI-STRUCTURE' }], totalCny: 36000000 } },
  ],
  inputSchema: costFromTextInputSchema,
  needsSanitize: true,
  outputSchema: costEstimateOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是建筑造价师。必须先参考 cost-catalog 候选子目，再输出工程量、单价和总价。items[].source 必须标记 cwicr 或 ai_estimate。禁止绝对化，必须包含 disclaimer: 本估算仅作参考，最终造价以正式预算书为准。',
  taskType: AiTaskType.COST_ROUGH_ESTIMATE,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<description>{{description}}</description><region>{{region}}</region><projectType>{{projectType}}</projectType>',
  version: 'v1',
};
