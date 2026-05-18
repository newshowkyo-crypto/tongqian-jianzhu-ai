import { expect, test } from '@playwright/test';

const pages = [
  { name: 'web-dashboard', path: 'http://127.0.0.1:3000/dashboard' },
  { name: 'web-h5-contract', path: 'http://127.0.0.1:3000/h5/reports/contract-review' },
  { name: 'web-h5-invite', path: 'http://127.0.0.1:3000/h5/invite' },
  { name: 'web-wechat-menu', path: 'http://127.0.0.1:3000/wechat/menu' },
  { name: 'agent-dispatch', path: 'http://127.0.0.1:3002/dispatch' },
  { name: 'agent-training', path: 'http://127.0.0.1:3002/training' },
  { name: 'gov-policy', path: 'http://127.0.0.1:3003/' },
  { name: 'gov-funds', path: 'http://127.0.0.1:3003/funds' },
  { name: 'admin-credentials', path: 'http://127.0.0.1:3001/admin/credentials' },
  { name: 'admin-security', path: 'http://127.0.0.1:3001/admin/security' },
];

test.describe('M3 visual smoke regression', () => {
  for (const target of pages) {
    test(target.name, async ({ page }) => {
      await page.goto(target.path);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toHaveText('');
      await page.screenshot({ fullPage: true, path: `tests/e2e/screenshots/m3/${target.name}.png` });
    });
  }
});
