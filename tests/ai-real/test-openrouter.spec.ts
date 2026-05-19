import { test } from '@playwright/test';

import { invokeOpenAiCompatible } from './helpers';

test('OpenRouter real call validates contract review pro schema', async () => {
  const result = await invokeOpenAiCompatible(
    {
      apiKeyEnv: 'OPENROUTER_API_KEY',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-chat-latest',
      providerName: 'openrouter',
    },
    'contract.review.pro',
  );
  test.skip(result.skipped, 'OPENROUTER_API_KEY missing or placeholder');
});
