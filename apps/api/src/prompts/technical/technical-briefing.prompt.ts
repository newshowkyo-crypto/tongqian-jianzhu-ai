import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const technicalBriefingInputSchema = z.object({ process: z.string(), qualityTarget: z.string().optional(), siteCondition: z.string() });
export const technicalBriefingOutputSchema = z.object({ disclaimer: z.string(), guidanceButtons: z.array(z.string()).length(5), keyParameters: z.array(z.string()), procedure: z.array(z.string()), regulationRefs: z.array(z.string()), tier: z.number(), title: z.string() });

export const technicalBriefingPrompt: PromptTemplate<z.infer<typeof technicalBriefingInputSchema>, z.infer<typeof technicalBriefingOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 60,
  description: 'Generate lightweight technical briefing for construction process.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本技术交底仅作辅助，请由项目技术负责人复核。',
  fewShotExamples: [],
  inputSchema: technicalBriefingInputSchema,
  needsSanitize: true,
  outputSchema: technicalBriefingOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是项目技术负责人助手，引用 GB 50204、GB 50203、GB 50202 等施工规范，输出工艺参数和检查点。必须含 disclaimer、Tier 徽章、5 引导按钮。',
  taskType: AiTaskType.OPS_WORK_REPORT,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<process>{{process}}</process><condition>{{siteCondition}}</condition>',
  version: 'v1',
};
