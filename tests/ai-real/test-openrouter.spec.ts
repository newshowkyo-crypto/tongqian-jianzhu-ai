import { test } from '@playwright/test';

test('OpenRouter real call is skipped until API key is enabled after M3.7', () => {
  test.skip(true, 'NEEDS_API_KEY: MOCK provider DISABLED_UNTIL_API_KEY_PROVIDED for M3.7 all-DeepSeek routing');
});
