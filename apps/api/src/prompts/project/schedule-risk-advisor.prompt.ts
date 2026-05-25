import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const scheduleRiskAdvisorInputSchema = z.object({
  criticalPath: z.array(z.string()),
  delayedTasks: z.array(z.object({ delayDays: z.number(), name: z.string() })),
});

export const scheduleRiskAdvisorOutputSchema = z.object({
  disclaimer: z.string(),
  guidanceButtons: z.array(z.string()).length(5),
  suggestions: z.array(z.string()).min(3).max(5),
  tier: z.number(),
});

export const scheduleRiskAdvisorPrompt: PromptTemplate<z.infer<typeof scheduleRiskAdvisorInputSchema>, z.infer<typeof scheduleRiskAdvisorOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 40,
  description: 'Lightweight schedule delay advisor for project managers.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本建议仅作项目管理参考，请由项目经理结合现场确认。',
  fewShotExamples: [],
  inputSchema: scheduleRiskAdvisorInputSchema,
  needsSanitize: true,
  outputSchema: scheduleRiskAdvisorOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是项目进度顾问，只做咨询辅助，不替代项目经理。输出必须含 disclaimer、Tier 徽章、AI 信心度语义和 5 引导按钮。',
  taskType: AiTaskType.SITE_MAJOR_HAZARD,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<critical>{{criticalPath}}</critical><delayed>{{delayedTasks}}</delayed>',
  version: 'v1',
};
