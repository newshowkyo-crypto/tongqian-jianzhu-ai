import { test } from '@playwright/test';

import { invokeOpenAiCompatible, loadEnvValue } from './helpers';

test('DashScope qwen3-max real call validates daily text route', async () => {
  const apiKeyEnv = loadEnvValue('ALIYUN_DASHSCOPE_API_KEY') ? 'ALIYUN_DASHSCOPE_API_KEY' : 'DASHSCOPE_API_KEY';
  const result = await invokeOpenAiCompatible(
    {
      apiKeyEnv,
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen3-max',
      providerName: 'aliyun-dashscope',
      timeoutMs: 120_000,
    },
    'chat.long',
  );
  test.skip(result.skipped, 'NEEDS_API_KEY: ALIYUN_DASHSCOPE_API_KEY/DASHSCOPE_API_KEY missing or placeholder');
});
