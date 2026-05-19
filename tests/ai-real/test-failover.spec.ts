import { expect, test } from '@playwright/test';

import { invokeOpenAiCompatible } from './helpers';

test('manual failover chain can fall back from OpenRouter to DashScope to DeepSeek', async () => {
  const attempts = [
    () => invokeOpenAiCompatible({ apiKeyEnv: 'OPENROUTER_API_KEY', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-chat-latest', providerName: 'openrouter' }, 'tender.framework'),
    () => invokeOpenAiCompatible({ apiKeyEnv: 'ALIYUN_DASHSCOPE_API_KEY', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-max', providerName: 'dashscope' }, 'tender.framework'),
    () => invokeOpenAiCompatible({ apiKeyEnv: 'DEEPSEEK_API_KEY', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', providerName: 'deepseek' }, 'tender.framework'),
  ];

  let passed = false;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (!result.skipped) {
        passed = true;
        break;
      }
    } catch {
      continue;
    }
  }
  expect(passed).toBeTruthy();
});
