import { test } from '@playwright/test';
import { AiTaskType } from '@tongqian/types';

import { invokeOpenAiCompatible } from './helpers';

test('OpenRouter real call validates contract review pro schema', async () => {
  const result = await invokeOpenAiCompatible(
    {
      apiKeyEnv: 'OPENROUTER_API_KEY',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o-mini',
      providerName: 'openrouter',
    },
    AiTaskType.CONTRACT_REVIEW_PRO,
  );
  test.skip(result.skipped, 'OPENROUTER_API_KEY missing or placeholder');
});
