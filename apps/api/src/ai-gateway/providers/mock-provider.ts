import type { AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';

export class MockAiProvider implements AiProvider {
  constructor(
    public readonly code: AiProviderCode,
    public readonly priority: number,
    public readonly supportedModels: string[],
  ) {}

  async health(): Promise<boolean> {
    return true;
  }

  async invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>> {
    return {
      content: {
        confidence: 'medium',
        dataSourceStatement: 'mock provider',
        disclaimer: 'AI generated content is for reference only.',
        executionDifficultyRadar: { cost: 20, professional: 20, risk: 20, time: 20 },
        nextStepButtons: [],
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
