import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const dueDiligenceInputSchema = z.object({ blacklist: z.unknown(), creditChina: z.unknown(), tianyancha: z.unknown() });
export const dueDiligenceOutputSchema = z.object({ analysis: z.string(), disclaimer: z.string(), guidanceButtons: z.array(z.string()).length(5), recommendations: z.array(z.string()).length(5), riskLevel: z.enum(['red', 'yellow', 'green']), tier: z.number() });

export const dueDiligencePrompt: PromptTemplate<z.infer<typeof dueDiligenceInputSchema>, z.infer<typeof dueDiligenceOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 5,
  description: 'Customer due diligence interpretation using tianyancha and creditchina data.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本尽调仅作合作前辅助判断，请结合合同和实地访谈复核。',
  fewShotExamples: [],
  inputSchema: dueDiligenceInputSchema,
  needsSanitize: true,
  outputSchema: dueDiligenceOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是建筑企业客户尽调顾问。基于 tianyancha、creditchina 和内部黑名单输出风险等级、是否建议合作、5 条建议。必须含 disclaimer、Tier 徽章、5 引导按钮。',
  taskType: AiTaskType.OPP_AUTHENTICITY,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<tyc>{{tianyancha}}</tyc><credit>{{creditChina}}</credit><blacklist>{{blacklist}}</blacklist>',
  version: 'v1',
};
