import { test } from '@playwright/test';

import { invokeOpenAiCompatible } from './helpers';

test('DashScope real call validates policy fund match schema', async () => {
  const result = await invokeOpenAiCompatible(
    {
      apiKeyEnv: 'ALIYUN_DASHSCOPE_API_KEY',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-max',
      providerName: 'dashscope',
    },
    'gov.policy_impact',
  );
  test.skip(result.skipped, 'ALIYUN_DASHSCOPE_API_KEY missing or placeholder');
});
