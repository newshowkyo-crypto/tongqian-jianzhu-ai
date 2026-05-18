import { expect, test } from '@playwright/test';

const agentBase = 'http://127.0.0.1:3002';
const apiBase = 'http://127.0.0.1:4000/api/v1';
const screenshotPath = 'tests/e2e/screenshots/2-agent-journey.png';

test('agent journey: registration training dispatch submit commission', async ({ page, request }) => {
  await page.goto(`${agentBase}/dispatch`);
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole('button').first().click();
  await expect(page).toHaveURL(/\/dispatch/);

  await expect(page.locator('body')).toContainText(/DQ-20260518|LV5|LV4/);
  await page.locator('input[type="number"]').first().fill('1600');
  await page.getByRole('button').filter({ hasText: /接|鎺/ }).first().click();

  const commission = await request.post(`${apiBase}/agent/commissions/cross-domain`, {
    data: {
      actualAmountCny: 4800,
      assignedAgentId: 'seed-agent-1',
      clientTenantId: 'seed-client-1',
      dispatchId: 'DQ-20260518-001',
      ownerAgentId: 'seed-owner-agent',
    },
  });
  expect(commission.ok()).toBeTruthy();
  expect(await commission.json()).toEqual(expect.objectContaining({ code: 'OK' }));

  await page.goto(`${agentBase}/reputation`);
  await expect(page.locator('body')).toContainText(/LV4|LV5|620|信誉|淇/);
  await page.screenshot({ fullPage: true, path: screenshotPath });
});
