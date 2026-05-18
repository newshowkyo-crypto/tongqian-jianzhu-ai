import { defineConfig, devices } from '@playwright/test';

const node22Path = 'C:\\Users\\Administrator\\.codex-tools\\node-v22-win-x64';
const pathPrefix = `${node22Path};${process.env.PATH ?? ''}`;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  outputDir: 'tests/e2e/test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/e2e/html-report' }]],
  testDir: './tests/e2e',
  timeout: 90_000,
  use: {
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @tongqian/api dev',
      env: { ...process.env, PATH: pathPrefix, PORT: '4000' },
      reuseExistingServer: true,
      timeout: 120_000,
      url: 'http://127.0.0.1:4000/health',
    },
    {
      command: 'pnpm --filter @tongqian/web dev',
      env: { ...process.env, PATH: pathPrefix },
      reuseExistingServer: true,
      timeout: 120_000,
      url: 'http://127.0.0.1:3000/login',
    },
    {
      command: 'pnpm --filter @tongqian/admin dev',
      env: { ...process.env, PATH: pathPrefix },
      reuseExistingServer: true,
      timeout: 120_000,
      url: 'http://127.0.0.1:3001/login',
    },
    {
      command: 'pnpm --filter @tongqian/agent dev',
      env: { ...process.env, PATH: pathPrefix },
      reuseExistingServer: true,
      timeout: 120_000,
      url: 'http://127.0.0.1:3002/login',
    },
    {
      command: 'pnpm --filter @tongqian/gov dev',
      env: { ...process.env, PATH: pathPrefix },
      reuseExistingServer: true,
      timeout: 120_000,
      url: 'http://127.0.0.1:3003/login',
    },
  ],
  projects: [
    {
      name: 'critical-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
