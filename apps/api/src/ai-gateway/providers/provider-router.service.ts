import { Injectable } from '@nestjs/common';
import { AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';
import { DeepSeekProvider } from './deepseek-provider.js';
import { MockAiProvider } from './mock-provider.js';

@Injectable()
export class ProviderRouterService {
  private readonly unhealthyUntil = new Map<AiProviderCode, number>();
  private readonly providers: AiProvider[] = [
    process.env.DEEPSEEK_API_KEY
      ? new DeepSeekProvider(AiProviderCode.DEEPSEEK_DIRECT, 1, ['deepseek-reasoner', 'deepseek-chat'])
      : new MockAiProvider(AiProviderCode.DEEPSEEK_DIRECT, 1, ['deepseek-reasoner'], isDeepSeekAvailable()),
    new MockAiProvider(AiProviderCode.ALIYUN_DASHSCOPE, 2, ['qwen3-max', 'qwen3-vl-max', 'text-embedding-v3'], isDashScopeAvailable()),
  ];

  async invoke<T>(preferred: AiProviderCode | undefined, request: AiProviderInvokeRequest): Promise<AiRawResponse<T> & { provider: AiProviderCode }> {
    const candidates = [...this.providers].filter((provider) => !this.isTemporarilyRemoved(provider.code)).sort((a, b) => a.priority - b.priority);
    const ordered = preferred ? [...candidates.filter((provider) => provider.code === preferred), ...candidates.filter((provider) => provider.code !== preferred)] : candidates;

    for (const provider of ordered) {
      if ((await provider.health()) && provider.supportedModels.includes(request.model)) {
        try {
          const response = await provider.invoke<T>(request);
          return { ...response, provider: provider.code };
        } catch (error) {
          this.markUnhealthy(provider.code, error instanceof Error ? error.message : 'provider invocation failed');
        }
      }
    }

    throw new Error('AI.GATEWAY.UNAVAILABLE');
  }

  async healthSnapshot(): Promise<Array<{ disabledReason?: string; healthy: boolean; provider: AiProviderCode }>> {
    const domesticProviders = await Promise.all(
      this.providers.map(async (provider) => ({
        disabledReason: provider.disabledReason,
        healthy: !this.isTemporarilyRemoved(provider.code) && (await provider.health()),
        provider: provider.code,
      })),
    );
    return [
      ...domesticProviders,
      {
        disabledReason: 'DEPRECATED_DO_NOT_USE: M3.12 removed OpenRouter, Claude and GPT from callable routing.',
        healthy: false,
        provider: AiProviderCode.OPENROUTER,
      },
    ];
  }

  /**
   * Lists providers that can currently be used for a model, skipping missing API keys.
   *
   * @param model Provider model id.
   * @returns Ordered provider codes.
   */
  async configuredProvidersFor(model: string): Promise<AiProviderCode[]> {
    const healthy = await Promise.all(
      this.providers.map(async (provider) => ({
        code: provider.code,
        healthy: !this.isTemporarilyRemoved(provider.code) && (await provider.health()) && provider.supportedModels.includes(model),
        priority: provider.priority,
      })),
    );
    return healthy.filter((item) => item.healthy).sort((a, b) => a.priority - b.priority).map((item) => item.code);
  }

  /**
   * Temporarily removes a provider after transient failures so the next call can retry another healthy route.
   *
   * @param code Provider code.
   * @param reason Failure reason.
   * @param cooldownMs Cooldown window.
   */
  markUnhealthy(code: AiProviderCode, reason: string, cooldownMs = 60_000): void {
    this.unhealthyUntil.set(code, Date.now() + cooldownMs);
    void reason;
  }

  private isTemporarilyRemoved(code: AiProviderCode): boolean {
    const until = this.unhealthyUntil.get(code);
    if (!until) return false;
    if (until <= Date.now()) {
      this.unhealthyUntil.delete(code);
      return false;
    }
    return true;
  }
}

function isConfigured(key: string): boolean {
  const value = process.env[key];
  return Boolean(value && !value.includes('PLACEHOLDER') && value !== 'sk-xxx');
}

function isDeepSeekAvailable(): boolean {
  return isConfigured('DEEPSEEK_API_KEY') || process.env.DISABLE_DEEPSEEK_LOCAL_MOCK !== 'true';
}

function isDashScopeAvailable(): boolean {
  return isConfigured('ALIYUN_DASHSCOPE_API_KEY') || isConfigured('DASHSCOPE_API_KEY') || process.env.DISABLE_DASHSCOPE_LOCAL_MOCK !== 'true';
}
