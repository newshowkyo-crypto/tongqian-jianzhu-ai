import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const safetyBriefingInputSchema = z.object({ seasonalRisk: z.enum(['rainy', 'spring', 'winter', 'summer']).optional(), siteCondition: z.string(), weather: z.string().optional(), workType: z.string() });
export const safetyBriefingOutputSchema = z.object({
  applicableScope: z.string(),
  disclaimer: z.string(),
  emergencyContacts: z.array(z.string()),
  guidanceButtons: z.array(z.string()).length(5),
  regulationRefs: z.array(z.string()),
  requiredPpe: z.array(z.string()),
  riskPoints: z.array(z.object({ level: z.string(), point: z.string(), prevention: z.string() })),
  signOffSlot: z.string(),
  tier: z.number(),
  title: z.string(),
});

export const safetyBriefingPrompt: PromptTemplate<z.infer<typeof safetyBriefingInputSchema>, z.infer<typeof safetyBriefingOutputSchema>> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 60,
  description: 'Generate lightweight safety briefing for construction crews.',
  fallbackModel: 'qwen-plus',
  fallbackText: '本交底仅作安全管理辅助，需由安全员结合现场复核。',
  fewShotExamples: [
    { name: '高处作业', input: { siteCondition: '外架临边', workType: '高处作业' }, output: { applicableScope: '临边作业', disclaimer: '仅作辅助', emergencyContacts: ['项目安全员'], guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'], regulationRefs: ['GB 50870', 'JGJ 80'], requiredPpe: ['安全帽', '安全带'], riskPoints: [{ level: 'red', point: '坠落', prevention: '应当挂设安全带' }], signOffSlot: '班组签字', tier: 2, title: '高处作业安全交底' } },
    { name: '临时用电', input: { siteCondition: '雨后潮湿', workType: '用电' }, output: { applicableScope: '临电作业', disclaimer: '仅作辅助', emergencyContacts: ['电工'], guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'], regulationRefs: ['GB 50194', 'JGJ 46'], requiredPpe: ['绝缘手套'], riskPoints: [{ level: 'red', point: '触电', prevention: '建议漏保测试' }], signOffSlot: '班组签字', tier: 2, title: '临时用电安全交底' } },
    { name: '焊接作业', input: { siteCondition: '地下室', workType: '焊接' }, output: { applicableScope: '动火作业', disclaimer: '仅作辅助', emergencyContacts: ['消防员'], guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'], regulationRefs: ['GB 50720'], requiredPpe: ['面罩'], riskPoints: [{ level: 'yellow', point: '火灾', prevention: '建议清理可燃物' }], signOffSlot: '班组签字', tier: 2, title: '焊接安全交底' } },
  ],
  inputSchema: safetyBriefingInputSchema,
  needsSanitize: true,
  outputSchema: safetyBriefingOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak'],
  systemPrompt: '你是安全工程师助手，只做咨询辅助。引用 GB 50870、GB 50194、GB 50720 等规范；避免“必须/绝对”，用“应当/建议/通常做法”。必须含 disclaimer、Tier 徽章、5 引导按钮。',
  taskType: AiTaskType.SITE_MAJOR_HAZARD,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<work>{{workType}}</work><condition>{{siteCondition}}</condition><weather>{{weather}}</weather>',
  version: 'v1',
};
