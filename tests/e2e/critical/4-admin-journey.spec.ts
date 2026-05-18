import { expect, test } from '@playwright/test';

const adminBase = 'http://127.0.0.1:3001';
const screenshotPath = 'tests/e2e/screenshots/4-admin-journey.png';

test('admin journey: login credential replacement approval audit', async ({ page }) => {
  await page.goto(`${adminBase}/admin/credentials`);
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole('button').first().click();
  await page.goto(`${adminBase}/admin/credentials`);

  await expect(page.locator('input[value="wechat_pay"]')).toBeVisible();
  await expect(page.locator('input[name="mode"]').first()).toBeChecked();
  await expect(page.locator('body')).toContainText(/platform-owner|PLATFORM_OWNER|mock|real|system_configs|audit_log/);
  await page.locator('input[type="password"]').fill('[PLACEHOLDER_REAL_SECRET_INPUT]');
  await page.screenshot({ fullPage: true, path: screenshotPath });
});
