import { AiProviderCode, AiTaskType } from '@tongqian/types';

export const M312_MODELS = {
  dashscopeEmbedding: 'text-embedding-v3',
  dashscopeText: 'qwen3-max',
  dashscopeVision: 'qwen3-vl-max',
  deepseekReasoner: 'deepseek-reasoner',
} as const;

export interface AiRouteConfig {
  costCredits: number;
  fallbackModel: string;
  fallbackProvider: AiProviderCode;
  model: string;
  overseas: boolean;
  primaryModel: string;
  primaryProvider: AiProviderCode;
  provider: AiProviderCode;
  routeClass: 'daily_text' | 'embedding' | 'reasoning' | 'vision';
}

const REASONING_TASKS = new Set<AiTaskType>([
  AiTaskType.CONTRACT_REVIEW_BASIC,
  AiTaskType.CONTRACT_REVIEW_PRO,
  AiTaskType.CONTRACT_MODIFICATION_LETTER,
  AiTaskType.CONTRACT_CLAIM_STRATEGY,
  AiTaskType.TENDER_ELIGIBILITY,
  AiTaskType.TENDER_FRAMEWORK,
  AiTaskType.TENDER_RISK,
  AiTaskType.TENDER_SCORE_PREDICT,
  AiTaskType.QUAL_CHECKUP,
  AiTaskType.QUAL_UPGRADE_PATH,
  AiTaskType.QUAL_DYNAMIC_REVIEW,
  AiTaskType.GOV_POLICY_IMPACT,
  AiTaskType.OPS_POLICY_IMPACT,
  AiTaskType.CASH_FINANCING_DIAGNOSIS,
  AiTaskType.COST_PRICING_RECOMMEND,
]);

const VISION_TASKS = new Set<AiTaskType>([
  AiTaskType.DRAWING_UNDERSTAND,
  AiTaskType.DRAWING_ERROR_DETECT,
  AiTaskType.DRAWING_VERSION_DIFF,
  AiTaskType.DRAWING_QUANTITY_ESTIMATE,
]);

const GOV_TEXT_TASKS = new Set<AiTaskType>([
  AiTaskType.GOV_DOC_NOTICE,
  AiTaskType.GOV_DOC_REPORT,
  AiTaskType.GOV_DOC_REQUEST,
  AiTaskType.GOV_POLICY_IMPACT,
]);

function routeFor(taskType: AiTaskType): AiRouteConfig {
  if (VISION_TASKS.has(taskType)) {
    return buildRoute(taskType, AiProviderCode.ALIYUN_DASHSCOPE, M312_MODELS.dashscopeVision, 'vision', 600);
  }
  if (GOV_TEXT_TASKS.has(taskType)) {
    return buildRoute(taskType, AiProviderCode.ALIYUN_DASHSCOPE, M312_MODELS.dashscopeText, 'daily_text', 220);
  }
  if (REASONING_TASKS.has(taskType)) {
    return buildRoute(taskType, AiProviderCode.MIDLAYER, M312_MODELS.deepseekReasoner, 'reasoning', taskType.includes('pro') ? 800 : 360);
  }
  return buildRoute(taskType, AiProviderCode.MIDLAYER, M312_MODELS.deepseekReasoner, 'daily_text', 120);
}

function buildRoute(taskType: AiTaskType, provider: AiProviderCode, model: string, routeClass: AiRouteConfig['routeClass'], costCredits: number): AiRouteConfig {
  return {
    costCredits: taskType.includes('drawing') ? Math.max(costCredits, 600) : costCredits,
    fallbackModel: model,
    fallbackProvider: provider,
    model,
    overseas: false,
    primaryModel: model,
    primaryProvider: provider,
    provider,
    routeClass,
  };
}

export const defaultAiRouting: Record<AiTaskType, AiRouteConfig> = Object.fromEntries(
  Object.values(AiTaskType).map((taskType) => [taskType, routeFor(taskType)]),
) as Record<AiTaskType, AiRouteConfig>;

export function isM312DomesticProvider(provider: AiProviderCode): boolean {
  return provider === AiProviderCode.DEEPSEEK_DIRECT || provider === AiProviderCode.ALIYUN_DASHSCOPE || provider === AiProviderCode.MIDLAYER;
}
