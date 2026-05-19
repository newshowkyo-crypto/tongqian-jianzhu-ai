import { AiProviderCode, AiTaskType } from '@tongqian/types';

export interface AiRouteConfig {
  costCredits: number;
  fallbackModel: string;
  fallbackProvider: AiProviderCode;
  model: string;
  overseas: boolean;
  primaryModel: string;
  primaryProvider: AiProviderCode;
  provider: AiProviderCode;
}

const REASONER_TASKS = new Set<AiTaskType>([
  AiTaskType.CONTRACT_REVIEW_BASIC,
  AiTaskType.CONTRACT_REVIEW_PRO,
  AiTaskType.TENDER_ELIGIBILITY,
  AiTaskType.TENDER_FRAMEWORK,
  AiTaskType.TENDER_SUMMARY,
  AiTaskType.QUAL_CHECKUP,
  AiTaskType.QUAL_UPGRADE_PATH,
  AiTaskType.GOV_POLICY_IMPACT,
  AiTaskType.OPS_POLICY_IMPACT,
]);

function selectDeepSeekModel(taskType: AiTaskType): 'deepseek-chat' | 'deepseek-reasoner' {
  return REASONER_TASKS.has(taskType) ? 'deepseek-reasoner' : 'deepseek-chat';
}

export const defaultAiRouting: Record<AiTaskType, AiRouteConfig> = Object.fromEntries(
  Object.values(AiTaskType).map((taskType) => {
    const model = selectDeepSeekModel(taskType);
    return [
      taskType,
      {
        costCredits: taskType.includes('pro') || taskType.includes('drawing') ? 800 : 100,
        fallbackModel: model,
        fallbackProvider: AiProviderCode.DEEPSEEK_DIRECT,
        model,
        overseas: false,
        primaryModel: model,
        primaryProvider: AiProviderCode.DEEPSEEK_DIRECT,
        provider: AiProviderCode.DEEPSEEK_DIRECT,
      },
    ];
  }),
) as Record<AiTaskType, AiRouteConfig>;
