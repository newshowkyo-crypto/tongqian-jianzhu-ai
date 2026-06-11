import assert from 'node:assert/strict';
import test from 'node:test';

import { AiProviderCode } from '@tongqian/types';

import { ProviderRouterService } from './provider-router.service.js';

const ENV_KEYS = [
  'ALIYUN_DASHSCOPE_API_KEY',
  'DASHSCOPE_API_KEY',
  'DEEPSEEK_API_KEY',
  'DISABLE_DASHSCOPE_LOCAL_MOCK',
  'DISABLE_DEEPSEEK_LOCAL_MOCK',
  'DISABLE_MIDLAYER_LOCAL_MOCK',
  'MIDLAYER_API_KEY',
  'MIDLAYER_BASE_URL',
  'NODE_ENV',
] as const;

function withEnv(overrides: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>, fn: () => Promise<void>): Promise<void> {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]])) as Record<(typeof ENV_KEYS)[number], string | undefined>;
  for (const key of ENV_KEYS) {
    const nextValue = overrides[key];
    if (nextValue === undefined) {
      Reflect.deleteProperty(process.env, key);
    } else {
      process.env[key] = nextValue;
    }
  }

  return fn().finally(() => {
    for (const key of ENV_KEYS) {
      const oldValue = previous[key];
      if (oldValue === undefined) {
        Reflect.deleteProperty(process.env, key);
      } else {
        process.env[key] = oldValue;
      }
    }
  });
}

test('production runtime does not expose mock AI providers when keys are missing', async () => {
  await withEnv(
    {
      DISABLE_DASHSCOPE_LOCAL_MOCK: undefined,
      DISABLE_DEEPSEEK_LOCAL_MOCK: undefined,
      DISABLE_MIDLAYER_LOCAL_MOCK: undefined,
      NODE_ENV: 'production',
    },
    async () => {
      const service = new ProviderRouterService();
      const snapshot = await service.healthSnapshot();
      assert.equal(snapshot.find((item) => item.provider === AiProviderCode.ALIYUN_DASHSCOPE)?.healthy, false);
      assert.equal(snapshot.find((item) => item.provider === AiProviderCode.DEEPSEEK_DIRECT)?.healthy, false);
      assert.equal(snapshot.find((item) => item.provider === AiProviderCode.MIDLAYER)?.healthy, false);

      await assert.rejects(
        service.invoke(AiProviderCode.ALIYUN_DASHSCOPE, {
          messages: [{ content: 'hello', role: 'user' }],
          model: 'qwen3-max',
        }),
        /AI\.GATEWAY\.UNAVAILABLE/u,
      );
    },
  );
});

test('placeholder AI keys are treated as missing credentials', async () => {
  await withEnv(
    {
      ALIYUN_DASHSCOPE_API_KEY: 'PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL',
      DEEPSEEK_API_KEY: 'sk-xxx',
      DISABLE_DASHSCOPE_LOCAL_MOCK: 'true',
      DISABLE_DEEPSEEK_LOCAL_MOCK: 'true',
      DISABLE_MIDLAYER_LOCAL_MOCK: 'true',
      NODE_ENV: 'development',
    },
    async () => {
      const service = new ProviderRouterService();
      const snapshot = await service.healthSnapshot();
      assert.equal(snapshot.find((item) => item.provider === AiProviderCode.ALIYUN_DASHSCOPE)?.healthy, false);
      assert.equal(snapshot.find((item) => item.provider === AiProviderCode.DEEPSEEK_DIRECT)?.healthy, false);
    },
  );
});

test('development runtime can still use local mock providers for offline tests', async () => {
  await withEnv({ NODE_ENV: 'test' }, async () => {
    const service = new ProviderRouterService();
    const providers = await service.configuredProvidersFor('qwen3-max');
    assert.ok(providers.includes(AiProviderCode.ALIYUN_DASHSCOPE));
    assert.ok(providers.includes(AiProviderCode.MIDLAYER));
  });
});
