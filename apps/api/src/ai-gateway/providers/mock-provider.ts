import { AiAudienceRole, AiNextStepAction, type AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';

export class MockAiProvider implements AiProvider {
  constructor(
    public readonly code: AiProviderCode,
    public readonly priority: number,
    public readonly supportedModels: string[],
    private readonly configured = true,
    public readonly disabledReason?: string,
  ) {}

  async health(): Promise<boolean> {
    return this.configured;
  }

  async invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>> {
    return {
      content: {
        confidence: 'medium',
        dataSourceStatement: 'mock provider',
        disclaimer: 'AI generated content is for reference only.',
        executionDifficultyRadar: { cost: 20, professional: 20, risk: 20, time: 20 },
        nextStepButtons: [
          { action: AiNextStepAction.SELF_EXECUTE, i18nKey: 'ai.actions.selfExecute', role: AiAudienceRole.OWNER },
          { action: AiNextStepAction.APPLY_AGENT, i18nKey: 'ai.actions.applyAgent', role: AiAudienceRole.OWNER },
          { action: AiNextStepAction.APPLY_TONGQIAN_CONSULTING, i18nKey: 'ai.actions.applyTongqian', role: AiAudienceRole.OWNER },
          { action: AiNextStepAction.REQUEST_HUMAN_REVIEW, i18nKey: 'ai.actions.humanReview', role: AiAudienceRole.OWNER },
          { action: AiNextStepAction.REQUEST_EXPERT_CONSULTING, i18nKey: 'ai.actions.expertConsult', role: AiAudienceRole.OWNER },
        ],
        nextStepHint: 'use-directly',
        sections: [],
        summary: request.messages.at(-1)?.content ?? '',
        tier: 1,
        title: request.model,
        traceId: 'mock-trace',
      } as T,
      inputTokens: 100,
      outputTokens: 200,
    };
  }
}
