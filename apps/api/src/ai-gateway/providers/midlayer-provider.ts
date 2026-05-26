import { AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';

export class MidlayerProvider implements AiProvider {
  readonly code = AiProviderCode.MIDLAYER;
  readonly priority = 1;
  readonly supportedModels = ['deepseek-reasoner', 'deepseek-chat', 'qwen3-max'];
  readonly disabledReason = process.env.MIDLAYER_API_KEY ? undefined : 'MIDLAYER_API_KEY missing';

  async health(): Promise<boolean> {
    return Boolean(process.env.MIDLAYER_API_KEY && process.env.MIDLAYER_BASE_URL);
  }

  async invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>> {
    const response = await fetch(`${process.env.MIDLAYER_BASE_URL}/chat/completions`, {
      body: JSON.stringify({ messages: request.messages, model: request.model }),
      headers: { Authorization: `Bearer ${process.env.MIDLAYER_API_KEY}`, 'Content-Type': 'application/json' },
      method: 'POST',
      signal: request.timeoutMs ? AbortSignal.timeout(request.timeoutMs) : undefined,
    });
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: T } }>; usage?: { completion_tokens?: number; prompt_tokens?: number } };
    return { content: json.choices?.[0]?.message?.content as T, inputTokens: json.usage?.prompt_tokens ?? 0, outputTokens: json.usage?.completion_tokens ?? 0 };
  }
}
