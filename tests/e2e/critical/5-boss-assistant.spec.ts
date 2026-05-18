import { expect, test } from '@playwright/test';

const webBase = 'http://127.0.0.1:3000';
const apiBase = 'http://127.0.0.1:4000/api/v1';
const screenshotPath = 'tests/e2e/screenshots/5-boss-assistant.png';

test('boss assistant: AI chat morning brief risk alert', async ({ page, request }) => {
  await page.goto(`${webBase}/login`);
  await page.getByRole('button').first().click();
  await page.goto(`${webBase}/dashboard`);

  await expect(page.locator('body')).toContainText(/AI|12860|风险|椋/);
  await expect(page.getByRole('button').last()).toBeVisible();

  const assistant = await request.post(`${apiBase}/assistant/queries`, {
    data: { question: '生成今日早安简报，并提醒合同与回款风险。' },
    headers: { 'x-tenant-id': 'mock-tenant', 'x-user-id': 'mock-user' },
  });
  expect(assistant.ok()).toBeTruthy();
  expect(await assistant.json()).toEqual(expect.objectContaining({ code: 'OK' }));

  const brief = await request.get(`${apiBase}/ops/weekly-report`, {
    headers: { 'x-tenant-id': 'mock-tenant' },
  });
  expect(brief.ok()).toBeTruthy();
  expect(await brief.json()).toEqual(expect.objectContaining({ code: 'OK' }));

  await page.screenshot({ fullPage: true, path: screenshotPath });
});
