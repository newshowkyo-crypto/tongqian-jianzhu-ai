import { AiProviderCode, AiTaskType } from '@tongqian/types';

export interface AiRouteConfig {
  costCredits: number;
  model: string;
  overseas: boolean;
  provider: AiProviderCode;
}

export const defaultAiRouting: Record<AiTaskType, AiRouteConfig> = Object.fromEntries(
  Object.values(AiTaskType).map((taskType) => [
    taskType,
    {
      costCredits: taskType.includes('pro') || taskType.includes('drawing') ? 800 : 100,
      model: taskType.includes('pro') ? 'claude-sonnet-4-6' : 'qwen-max',
      overseas: taskType.includes('pro'),
      provider: taskType.includes('pro') ? AiProviderCode.OPENROUTER : AiProviderCode.ALIYUN_DASHSCOPE,
    },
  ]),
) as Record<AiTaskType, AiRouteConfig>;
