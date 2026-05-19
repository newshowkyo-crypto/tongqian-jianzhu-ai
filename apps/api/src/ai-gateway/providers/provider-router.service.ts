import { Injectable } from '@nestjs/common';
import { AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';
import { MockAiProvider } from './mock-provider.js';

@Injectable()
export class ProviderRouterService {
  private readonly providers: AiProvider[] = [
    new MockAiProvider(AiProviderCode.DEEPSEEK_DIRECT, 1, ['deepseek-chat', 'deepseek-reasoner'], isConfigured('DEEPSEEK_API_KEY')),
    new MockAiProvider(AiProviderCode.ALIYUN_DASHSCOPE, 2, ['qwen-plus', 'qwen-max', 'qwen-vl-max'], false, 'DISABLED_UNTIL_API_KEY_PROVIDED'),
    new MockAiProvider(AiProviderCode.OPENROUTER, 3, ['claude-sonnet-4-6', 'gpt-5'], false, 'DISABLED_UNTIL_API_KEY_PROVIDED'),
  ];

  async invoke<T>(preferred: AiProviderCode | undefined, request: AiProviderInvokeRequest): Promise<AiRawResponse<T> & { provider: AiProviderCode }> {
    const candidates = [...this.providers].sort((a, b) => a.priority - b.priority);
    const ordered = preferred ? [...candidates.filter((provider) => provider.code === preferred), ...candidates.filter((provider) => provider.code !== preferred)] : candidates;

    for (const provider of ordered) {
      if ((await provider.health()) && provider.supportedModels.includes(request.model)) {
        const response = await provider.invoke<T>(request);
        return { ...response, provider: provider.code };
      }
    }

    throw new Error('AI.GATEWAY.UNAVAILABLE');
  }

  async healthSnapshot(): Promise<Array<{ disabledReason?: string; healthy: boolean; provider: AiProviderCode }>> {
    return Promise.all(
      this.providers.map(async (provider) => ({
        disabledReason: provider.disabledReason,
        healthy: await provider.health(),
        provider: provider.code,
      })),
    );
  }
}

function isConfigured(key: string): boolean {
  const value = process.env[key];
  return Boolean(value && !value.includes('PLACEHOLDER') && value !== 'sk-xxx');
}
