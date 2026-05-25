import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const dailySummaryInputSchema = z.object({ dataPoints: z.record(z.unknown()), date: z.string(), projectId: z.string().optional(), tenantId: z.string() });
export const summaryOutputSchema = z.object({ confidence: z.number(), disclaimer: z.string(), guidanceButtons: z.array(z.string()).length(5), headline: z.string(), highlights: z.array(z.string()), lowlights: z.array(z.string()), tier: z.number(), todayActions: z.array(z.string()), tomorrowFocus: z.array(z.string()) });

export const dailySummaryPrompt: PromptTemplate<z.infer<typeof dailySummaryInputSchema>, z.infer<typeof summaryOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 40,
  description: 'Daily construction business summary.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本日报仅作经营辅助，请结合原始数据复核。',
  fewShotExamples: [],
  inputSchema: dailySummaryInputSchema,
  needsSanitize: true,
  outputSchema: summaryOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '克制、信息密度高，输出日报。必须含 disclaimer、Tier 徽章、5 引导按钮。',
  taskType: AiTaskType.OPS_WORK_REPORT,
  tier: () => AiOutputTier.TIER_1,
  userTemplate: '<date>{{date}}</date><data>{{dataPoints}}</data>',
  version: 'v1',
};
