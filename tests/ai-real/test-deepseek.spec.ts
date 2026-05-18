import { test } from '@playwright/test';
import { AiTaskType } from '@tongqian/types';

import { invokeOpenAiCompatible } from './helpers';

test('DeepSeek real call validates qualification upgrade schema', async () => {
  const result = await invokeOpenAiCompatible(
    {
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      providerName: 'deepseek',
    },
    AiTaskType.QUAL_UPGRADE_PATH,
  );
  test.skip(result.skipped, 'DEEPSEEK_API_KEY missing or placeholder');
});
