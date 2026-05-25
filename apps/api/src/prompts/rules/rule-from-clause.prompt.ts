import { AiCacheStrategy, AiOutputTier, AiTaskType, type PromptTemplate } from '@tongqian/types';
import { z } from 'zod';

export const ruleFromClauseInputSchema = z.object({
  clause: z.object({
    clauseNumber: z.string(),
    clauseText: z.string().min(20),
    clauseTitle: z.string().nullable(),
  }),
  corpus: z.object({
    code: z.string(),
    issuer: z.string(),
    title: z.string(),
    version: z.string(),
  }),
});

export const ruleFromClauseOutputSchema = z.object({
  analysisNote: z.string().optional(),
  candidates: z.array(z.object({
    applicableScenario: z.array(z.string()).max(5),
    clauseRef: z.string(),
    condition: z.string(),
    confidence: z.number().min(0).max(1),
    consequence: z.string(),
    legalBasis: z.string(),
    reverseExample: z.string().optional(),
    riskLevel: z.enum(['red', 'yellow', 'green']),
    suggestion: z.string(),
    title: z.string().max(30),
    type: z.enum(['contract', 'tender', 'qualification', 'cost', 'quality', 'regulation']),
  })).max(5),
});

export type RuleFromClauseInput = z.infer<typeof ruleFromClauseInputSchema>;
export type RuleFromClauseOutput = z.infer<typeof ruleFromClauseOutputSchema>;

export const fewShotExamples = [
  { name: '高风险付款条款', input: { corpus: { code: 'GF-2017-0201', issuer: '住建部', title: '建设工程施工合同', version: '2017' }, clause: { clauseNumber: '12.4.1', clauseTitle: '付款周期', clauseText: '发包人应按合同约定支付工程进度款，逾期支付的按约承担责任。' } }, output: { candidates: [{ applicableScenario: ['工程款回款', '进度款催收'], clauseRef: 'GF-2017-0201 12.4.1', condition: '发包人逾期支付进度款', confidence: 0.92, consequence: '可能形成现金流风险和索赔争议', legalBasis: 'GF-2017-0201 12.4.1', riskLevel: 'red', suggestion: '建议关注付款节点、催告证据和停工条件。', title: '进度款逾期预警', type: 'contract' }] } },
  { name: '中风险投标资格', input: { corpus: { code: 'BID-LAW-REG-2019', issuer: '国务院', title: '招标投标法实施条例', version: '2019' }, clause: { clauseNumber: '第三十二条', clauseTitle: null, clauseText: '招标人不得以不合理条件限制、排斥潜在投标人。' } }, output: { candidates: [{ applicableScenario: ['投标报名', '资格预审'], clauseRef: 'BID-LAW-REG-2019 第三十二条', condition: '招标文件设置本地备案等异常门槛', confidence: 0.86, consequence: '可能构成限制排斥投标', legalBasis: 'BID-LAW-REG-2019 第三十二条', riskLevel: 'yellow', suggestion: '建议关注资格条件是否与项目实际需要相匹配。', title: '异常资格门槛识别', type: 'tender' }] } },
  { name: '低风险定义条款抽零', input: { corpus: { code: 'GB50300-2013', issuer: '国家标准委', title: '建筑工程施工质量验收统一标准', version: '2013' }, clause: { clauseNumber: '1.0.2', clauseTitle: '适用范围', clauseText: '本标准适用于建筑工程施工质量的验收。' } }, output: { analysisNote: '本条为适用范围说明，未形成经营动作规则。', candidates: [] } },
  { name: '验收标准条款', input: { corpus: { code: 'GB50300-2013', issuer: '国家标准委', title: '建筑工程施工质量验收统一标准', version: '2013' }, clause: { clauseNumber: '5.0.6', clauseTitle: '验收记录', clauseText: '检验批质量验收记录应由施工项目专业质量检查员填写。' } }, output: { candidates: [{ applicableScenario: ['质量验收', '资料归档'], clauseRef: 'GB50300-2013 5.0.6', condition: '检验批验收资料缺失或填写主体不清', confidence: 0.89, consequence: '可能影响验收通过和结算资料完整性', legalBasis: 'GB50300-2013 5.0.6', riskLevel: 'yellow', suggestion: '建议关注检验批记录填写人、签章和归档链路。', title: '检验批记录校验', type: 'quality' }] } },
] satisfies Array<{ input: RuleFromClauseInput; name: string; output: RuleFromClauseOutput }>;

export const systemPrompt = `你是建筑业资深律师、造价师和招标专家组成的联合审查小组，任务是从权威法律文本、合同示范文本、国家标准和司法解释的单条条款中，生成对建筑企业经营真正有用的结构化规则候选。你的输出要服务老板、法务、项目经理和投标负责人，帮助他们提前识别合同付款、工期索赔、投标资格、资质维护、造价计量、质量验收、证据留痕等风险或机会。你只能依据输入条款作判断，不许编造未出现的法律依据，不许把常识包装成法规，不许扩大条款适用范围。每条规则必须写明 legalBasis，且 legalBasis 必须引用 corpus.code 与 clauseNumber。禁止绝对化表达：不要说“必须、一切、绝对、保证胜诉、一定违法、必然赔偿”等确定法律结果；需要使用“建议关注、通常做法、参考行业惯例、可能形成、需要人工确认”等审慎措辞。纯定义性、适用范围、目录性、程序性条款如果不能形成明确经营动作，应抽取 0 条 candidates，并在 analysisNote 说明原因。confidence 大于等于 0.85 代表条款明确、可直接进入律师批量审核；低于 0.85 代表仍需人工确认。输出只允许 JSON，必须符合 outputSchema。`;

export const ruleFromClausePrompt: PromptTemplate<RuleFromClauseInput, RuleFromClauseOutput> = {
  cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC,
  costCredits: 80,
  description: 'Generate construction business rule candidates from one authoritative legal clause.',
  fallbackModel: 'qwen-plus',
  fallbackText: '抱歉，本条款本次未能成功抽取规则，请人工补录。',
  fewShotExamples,
  inputSchema: ruleFromClauseInputSchema,
  needsSanitize: true,
  outputSchema: ruleFromClauseOutputSchema,
  primaryModel: 'deepseek-chat',
  safetyChecks: ['no_political', 'no_pii_leak', 'no_jailbreak'],
  systemPrompt,
  taskType: AiTaskType.RULE_EXTRACT,
  tier: () => AiOutputTier.TIER_2,
  userTemplate: '<corpus_meta><code>{{corpus.code}}</code><title>{{corpus.title}}</title><issuer>{{corpus.issuer}}</issuer><version>{{corpus.version}}</version></corpus_meta><clause><number>{{clause.clauseNumber}}</number><title>{{clause.clauseTitle}}</title><text>{{clause.clauseText}}</text></clause>请按 outputSchema 输出 JSON。',
  version: 'v1',
};
