import { defineConfig } from '@playwright/test';

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  testDir: '.',
  timeout: 120_000,
  use: {
    trace: 'retain-on-failure',
  },
});
