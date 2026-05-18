import { expect, test } from '@playwright/test';

const govBase = 'http://127.0.0.1:3003';
const apiBase = 'http://127.0.0.1:4000/api/v1';
const screenshotPath = 'tests/e2e/screenshots/3-gov-journey.png';

test('gov journey: register policy fund matching official document generation', async ({ page, request }) => {
  await page.goto(govBase);
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole('button').first().click();
  await expect(page).toHaveURL(`${govBase}/`);

  const funds = await request.post(`${apiBase}/gov/policy-funds/match`, {
    data: { projectFeatures: ['urban-renewal', 'green-building', 'county-infrastructure'] },
    headers: { 'x-tenant-id': 'mock-gov', 'x-user-id': 'mock-gov-user' },
  });
  expect(funds.ok()).toBeTruthy();
  expect(await funds.json()).toEqual(expect.objectContaining({ code: 'OK' }));

  const doc = await request.post(`${apiBase}/gov/docs`, {
    data: { docType: 'meeting_minutes', topic: '绿色建筑专项资金推进会纪要' },
    headers: { 'x-tenant-id': 'mock-gov', 'x-user-id': 'mock-gov-user' },
  });
  expect(doc.ok()).toBeTruthy();
  expect(await doc.json()).toEqual(expect.objectContaining({ code: 'OK' }));

  await expect(page.locator('body')).toContainText(/AI|政策|鏀/);
  await page.screenshot({ fullPage: true, path: screenshotPath });
});
