import { Injectable } from '@nestjs/common';
import { AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';
import { MockAiProvider } from './mock-provider.js';

@Injectable()
export class ProviderRouterService {
  private readonly providers: AiProvider[] = [
    new MockAiProvider(AiProviderCode.ALIYUN_DASHSCOPE, 1, ['qwen-plus', 'qwen-max', 'qwen-vl-max']),
    new MockAiProvider(AiProviderCode.DEEPSEEK_DIRECT, 2, ['deepseek-chat']),
    new MockAiProvider(AiProviderCode.OPENROUTER, 3, ['claude-sonnet-4-6', 'gpt-5']),
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

  async healthSnapshot(): Promise<Array<{ healthy: boolean; provider: AiProviderCode }>> {
    return Promise.all(this.providers.map(async (provider) => ({ healthy: await provider.health(), provider: provider.code })));
  }
}
