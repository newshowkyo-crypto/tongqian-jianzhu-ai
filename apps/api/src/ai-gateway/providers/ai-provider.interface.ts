import type { AiProviderCode, AiPromptMessage } from '@tongqian/types';

export interface AiRawResponse<T = unknown> {
  content: T;
  inputTokens: number;
  outputTokens: number;
}

export interface AiProviderInvokeRequest {
  messages: AiPromptMessage[];
  model: string;
  timeoutMs?: number;
}

export interface AiProvider {
  code: AiProviderCode;
  disabledReason?: string;
  priority: number;
  supportedModels: string[];
  health(): Promise<boolean>;
  invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>>;
}
