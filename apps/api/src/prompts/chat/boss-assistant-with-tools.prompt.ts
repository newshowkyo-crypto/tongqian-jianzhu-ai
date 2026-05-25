import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const bossAssistantWithToolsInputSchema = z.object({
  question: z.string(),
  toolResults: z.array(z.object({ name: z.string(), result: z.unknown() })).optional(),
});

export const bossAssistantWithToolsOutputSchema = z.object({
  answer: z.string(),
  toolCalls: z.array(z.object({ arguments: z.record(z.unknown()), name: z.string() })).optional(),
});

export const bossAssistantWithToolsPrompt: PromptTemplate<z.infer<typeof bossAssistantWithToolsInputSchema>, z.infer<typeof bossAssistantWithToolsOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 60,
  description: 'Boss assistant chooses internal tools before final answer.',
  fallbackModel: 'qwen-plus',
  fallbackText: '我先查一下业务数据，再给你结论。',
  fewShotExamples: [],
  inputSchema: bossAssistantWithToolsInputSchema,
  needsSanitize: true,
  outputSchema: bossAssistantWithToolsOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是同乾方略 AI 老板助理。遇到合同、招标、资质、现金流、风险、点数、项目进度等问题，先选择最合适的内部 tool；拿到 toolResults 后再用简明中文回答。',
  taskType: AiTaskType.CHAT_LONG,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<question>{{question}}</question><tool_results>{{toolResults}}</tool_results>',
  version: 'v1',
};
