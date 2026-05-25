import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';
import { summaryOutputSchema } from './daily-summary.prompt.js';

export const weeklySummaryInputSchema = z.object({ dataPoints: z.record(z.unknown()), tenantId: z.string(), week: z.string() });

export const weeklySummaryPrompt: PromptTemplate<z.infer<typeof weeklySummaryInputSchema>, z.infer<typeof summaryOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 60,
  description: 'Weekly business trend summary.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本周报仅作经营辅助，请结合原始数据复核。',
  fewShotExamples: [],
  inputSchema: weeklySummaryInputSchema,
  needsSanitize: true,
  outputSchema: summaryOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '输出含趋势对比和 5 引导按钮：继续、部分完成、调整目标、升级求助、暂停。必须含 disclaimer、Tier 徽章。',
  taskType: AiTaskType.OPS_WORK_REPORT,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<week>{{week}}</week><data>{{dataPoints}}</data>',
  version: 'v1',
};
