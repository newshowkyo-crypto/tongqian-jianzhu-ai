import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

import { summaryOutputSchema } from './daily-summary.prompt.js';

export const monthlySummaryInputSchema = z.object({ dataPoints: z.record(z.unknown()), month: z.string(), tenantId: z.string() });

export const monthlySummaryPrompt: PromptTemplate<z.infer<typeof monthlySummaryInputSchema>, z.infer<typeof summaryOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 80,
  description: 'Monthly owner report with peer comparison.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本月报仅作经营辅助，请结合财务和项目原始数据复核。',
  fewShotExamples: [],
  inputSchema: monthlySummaryInputSchema,
  needsSanitize: true,
  outputSchema: summaryOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '输出同行 PK、上月对比和下月展望。必须含 disclaimer、Tier 徽章、5 引导按钮。',
  taskType: AiTaskType.OPS_WORK_REPORT,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<month>{{month}}</month><data>{{dataPoints}}</data>',
  version: 'v1',
};
