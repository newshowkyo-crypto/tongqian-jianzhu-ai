import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const rfpKeyClausesInputSchema = z.object({
  chunks: z.array(z.object({ content: z.string(), docName: z.string(), pageNumber: z.number().optional() })),
  tenderId: z.string(),
});

export const rfpKeyClausesOutputSchema = z.object({
  clauses: z.array(z.object({
    category: z.enum(['评分办法', '废标条件', '资格预审', '投标保证金', '工期要求', '付款方式', '履约保证金', '不平衡报价限制']),
    condition: z.string(),
    pageNumber: z.number().optional(),
    risk: z.enum(['red', 'yellow', 'green']),
    suggestion: z.string(),
  })).max(8),
});

export const rfpKeyClausesPrompt: PromptTemplate<z.infer<typeof rfpKeyClausesInputSchema>, z.infer<typeof rfpKeyClausesOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 90,
  description: 'Extract eight key tender clauses from multi-doc RFP chunks.',
  fallbackModel: 'qwen-plus',
  fallbackText: '招标关键条款抽取失败，请先查看原文片段。',
  fewShotExamples: [],
  inputSchema: rfpKeyClausesInputSchema,
  needsSanitize: true,
  outputSchema: rfpKeyClausesOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是招标文件审查专家。只基于 chunks 抽取 8 类关键条款：评分办法、废标条件、资格预审、投标保证金、工期要求、付款方式、履约保证金、不平衡报价限制。每条必须给 condition/risk/suggestion/引用页码。',
  taskType: AiTaskType.TENDER_RISK,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<tender>{{tenderId}}</tender><chunks>{{chunks}}</chunks>',
  version: 'v1',
};
