import { test } from '@playwright/test';

import { invokeOpenAiCompatible } from './helpers';

const p0Cases = [
  { model: 'deepseek-reasoner', taskType: 'contract.review.pro' as const },
  { model: 'deepseek-reasoner', taskType: 'tender.framework' as const },
  { model: 'deepseek-reasoner', taskType: 'qual.upgrade_path' as const },
  { model: 'deepseek-reasoner', taskType: 'ops.policy_impact' as const },
  { model: 'deepseek-chat', taskType: 'chat.long' as const },
];

for (const item of p0Cases) {
  test(`DeepSeek real call validates ${item.taskType} schema`, async () => {
    const result = await invokeOpenAiCompatible(
      {
        apiKeyEnv: 'DEEPSEEK_API_KEY',
        baseUrl: 'https://api.deepseek.com',
        model: item.model,
        providerName: 'deepseek',
        timeoutMs: 120_000,
      },
      item.taskType,
    );
    test.skip(result.skipped, 'DEEPSEEK_API_KEY missing or placeholder');
  });
}
