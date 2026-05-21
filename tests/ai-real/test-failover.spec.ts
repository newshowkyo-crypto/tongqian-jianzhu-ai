import { expect, test } from '@playwright/test';

import { invokeOpenAiCompatible, loadEnvValue } from './helpers';

test('manual failover chain retries within domestic flagship routes for M3.12', async () => {
  const attempts = [
    () => invokeOpenAiCompatible({ apiKeyEnv: 'DEEPSEEK_API_KEY', baseUrl: 'https://api.deepseek.com', model: 'deepseek-reasoner', providerName: 'deepseek' }, 'tender.framework'),
    () =>
      invokeOpenAiCompatible(
        {
          apiKeyEnv: loadEnvValue('ALIYUN_DASHSCOPE_API_KEY') ? 'ALIYUN_DASHSCOPE_API_KEY' : 'DASHSCOPE_API_KEY',
          baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          model: 'qwen3-max',
          providerName: 'aliyun-dashscope',
        },
        'chat.long',
      ),
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
