import { expect, test } from '@playwright/test';

const apiBase = 'http://127.0.0.1:4000/api/v1';
const webBase = 'http://127.0.0.1:3000';
const screenshotPath = 'tests/e2e/screenshots/1-customer-journey.png';

test('customer journey: register login recharge contract review AI report', async ({ page, request }) => {
  await test.step('register and login through guarded web entry', async () => {
    await page.goto(`${webBase}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole('button').first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  await test.step('recharge through mock payment provider', async () => {
    await page.goto(`${webBase}/billing`);
    await expect(page.locator('body')).toContainText(/12860|5000|999/);
    const order = await request.post(`${apiBase}/payments/orders`, {
      data: {
        amountCny: 199,
        channel: 'wechat',
        idempotencyKey: 'm2-e2e-customer-recharge',
        metadata: { providerMode: 'mock' },
        type: 'subscription',
      },
      headers: { 'x-tenant-id': 'mock-tenant', 'x-user-id': 'mock-user' },
    });
    expect(order.ok()).toBeTruthy();
    expect(await order.json()).toEqual(expect.objectContaining({ code: 'OK' }));
  });

  await test.step('submit contract review and read H5 report', async () => {
    const review = await request.post(`${apiBase}/contract-reviews`, {
      data: {
        amountCny: 5_000_000,
        contractType: 'construction_general_contract',
        contractUrl: 'minio://mock/contracts/customer-journey.pdf',
        tenantType: 'BUILDING_COMPANY',
        type: 'pro',
      },
    });
    expect(review.ok()).toBeTruthy();
    const body = await review.json();
    expect(body.code).toBe('OK');

    await page.goto(`${webBase}/reports/${body.data.id ?? 'm2-customer'}`);
    await expect(page.locator('main').last()).toBeVisible();
    await expect(page.locator('main').last().getByRole('button')).toHaveCount(5);
    await page.screenshot({ fullPage: true, path: screenshotPath });
  });
});
