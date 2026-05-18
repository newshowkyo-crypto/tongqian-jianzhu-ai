import { expect, test } from '@playwright/test';
import { AiTaskType } from '@tongqian/types';

import { invokeOpenAiCompatible } from './helpers';

test('manual failover chain can fall back from OpenRouter to DashScope to DeepSeek', async () => {
  const attempts = [
    () => invokeOpenAiCompatible({ apiKeyEnv: 'OPENROUTER_API_KEY', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', providerName: 'openrouter' }, AiTaskType.TENDER_FRAMEWORK),
    () => invokeOpenAiCompatible({ apiKeyEnv: 'ALIYUN_DASHSCOPE_API_KEY', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-max', providerName: 'dashscope' }, AiTaskType.TENDER_FRAMEWORK),
    () => invokeOpenAiCompatible({ apiKeyEnv: 'DEEPSEEK_API_KEY', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', providerName: 'deepseek' }, AiTaskType.TENDER_FRAMEWORK),
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
