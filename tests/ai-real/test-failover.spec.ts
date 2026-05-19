import { expect, test } from '@playwright/test';

import { invokeOpenAiCompatible } from './helpers';

test('manual failover chain retries within DeepSeek only for M3.7', async () => {
  const attempts = [
    () => invokeOpenAiCompatible({ apiKeyEnv: 'DEEPSEEK_API_KEY', baseUrl: 'https://api.deepseek.com', model: 'deepseek-reasoner', providerName: 'deepseek' }, 'tender.framework'),
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
