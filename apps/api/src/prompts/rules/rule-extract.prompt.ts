import { AiCacheStrategy, AiTaskType, AiOutputTier, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const ruleExtractInputSchema = z.object({
  sourceText: z.string().min(20),
  sourceType: z.enum(['judgment', 'tender', 'policy']),
  sourceUrl: z.string().url(),
});

export const ruleExtractOutputSchema = z.object({
  candidates: z.array(z.object({
    clauseRef: z.string().optional(),
    confidence: z.number().min(0).max(1),
    reverseExample: z.string().optional(),
    riskLevel: z.enum(['red', 'yellow', 'green']),
    suggestion: z.string(),
    title: z.string(),
    type: z.enum(['contract', 'tender', 'qual', 'regulation', 'price']),
  })).max(20),
});

export type RuleExtractInput = z.infer<typeof ruleExtractInputSchema>;
export type RuleExtractOutput = z.infer<typeof ruleExtractOutputSchema>;

export const fewShotExamples = [
  {
    input: { sourceText: '工程款逾期支付，发包人未按节点确认。', sourceType: 'judgment', sourceUrl: 'https://example.gov/j1' },
    name: 'red payment risk',
    output: { candidates: [{ confidence: 0.91, riskLevel: 'red', suggestion: '建议关注付款节点、签证证据和催告时点。', title: '工程款节点证据规则', type: 'contract' }] },
  },
  {
    input: { sourceText: '招标文件要求本地备案和类似业绩。', sourceType: 'tender', sourceUrl: 'https://example.gov/t1' },
    name: 'yellow tender eligibility',
    output: { candidates: [{ confidence: 0.82, riskLevel: 'yellow', suggestion: '建议关注备案、类似业绩和人员证书有效期。', title: '投标资格材料核验规则', type: 'tender' }] },
  },
  {
    input: { sourceText: '政策鼓励绿色建材应用，按项目申报补贴。', sourceType: 'policy', sourceUrl: 'https://example.gov/p1' },
    name: 'green policy opportunity',
    output: { candidates: [{ confidence: 0.76, riskLevel: 'green', suggestion: '建议关注申报窗口、项目类型和材料清单。', title: '绿色建材补贴识别规则', type: 'regulation' }] },
  },
] satisfies Array<{ input: RuleExtractInput; name: string; output: RuleExtractOutput }>;

export const ruleExtractPrompt: PromptTemplate<RuleExtractInput, RuleExtractOutput> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 120,
  description: 'Extract construction business rule candidates from public crawler text.',
  fallbackModel: 'qwen-plus',
  fallbackText: '抱歉本次抽取失败，请重试；系统已保留来源链接和审计 trace，方便人工复核。',
  fewShotExamples,
  inputSchema: ruleExtractInputSchema,
  needsSanitize: false,
  outputSchema: ruleExtractOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak', 'no_jailbreak'],
  systemPrompt: '你是建筑业资深律师和招标专家联合视角，只抽取可复核的规则候选。禁止绝对化承诺，避免使用“必须/绝对”等确定法律结果措辞，引用要能追溯来源。',
  taskType: AiTaskType.RULE_EXTRACT,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<source_type>{{sourceType}}</source_type><source_url>{{sourceUrl}}</source_url><source_text>{{sourceText}}</source_text>',
  version: 'v1',
};
