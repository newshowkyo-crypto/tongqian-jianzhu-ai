const { chromium } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs/promises');

const outDir = path.resolve('tests/e2e/screenshots/m6');
const shots = [
  { name: 'm6-admin-credentials-overview.png', url: 'http://127.0.0.1:3011/admin/credentials' },
  { name: 'm6-admin-credentials-edit-drawer.png', url: 'http://127.0.0.1:3011/admin/credentials', clickSelector: 'button', waitMs: 800 },
  { name: 'm6-admin-observability.png', url: 'http://127.0.0.1:3011/admin/observability' },
  { name: 'm6-admin-jobs.png', url: 'http://127.0.0.1:3011/admin/jobs' },
  { name: 'm6-admin-ai-monitor.png', url: 'http://127.0.0.1:3011/admin/ai-monitor' },
  { name: 'm6-admin-notifications.png', url: 'http://127.0.0.1:3011/admin/notifications' },
  { name: 'm6-admin-health.png', url: 'http://127.0.0.1:3011/admin/health' },
  { name: 'm6-web-dashboard-with-data.png', url: 'http://127.0.0.1:3010/dashboard' },
  { name: 'm6-agent-dispatch-with-data.png', url: 'http://127.0.0.1:3012/dispatch' },
  { name: 'm6-gov-dashboard-with-data.png', url: 'http://127.0.0.1:3013/' },
  { name: 'm6-admin-overview-with-metrics.png', url: 'http://127.0.0.1:3011/admin/observability', waitMs: 2000 },
  { name: 'm6-cyber-component-storybook.png', url: 'http://127.0.0.1:3011/admin/credentials' },
];

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function assertPage(page, shot) {
  const text = await page.locator('body').innerText({ timeout: 10000 });
  const forbidden = ['404', 'Application error', 'Sign in', '登录'];
  for (const word of forbidden) {
    if (text.includes(word)) throw new Error(`${shot.name} captured invalid page containing ${word}`);
  }
}

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 4,
  });
  await context.addCookies([
    { name: 'tq_auth_token', value: 'dev-admin', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
    { name: 'tq_role', value: 'platform_owner', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
  ]);
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('tongqian.jwt', 'dev-admin');
    localStorage.setItem('tongqian.userId', 'platform-owner');
    localStorage.setItem('tongqian.tenantId', 'platform-tenant');
  });

  const sizes = [];
  for (const shot of shots) {
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    if (shot.clickSelector) {
      const target = page.locator(shot.clickSelector);
      if ((await target.count()) > 0) await target.first().click({ timeout: 10000, force: true });
    }
    await page.waitForTimeout(shot.waitMs ?? 500);
    await assertPage(page, shot);

    const file = path.join(outDir, shot.name);
    await page.screenshot({ path: file, fullPage: true });
    const bytes = await fs.readFile(file);
    const stat = await fs.stat(file);
    const chunks = idatCount(bytes);
    if (stat.size < 204800) throw new Error(`${shot.name} too small after Playwright capture: ${stat.size}`);
    if (chunks < 5) throw new Error(`${shot.name} IDAT=${chunks} after Playwright capture`);
    sizes.push({ name: shot.name, size: stat.size, idat: chunks });
  }
  await browser.close();
  console.log(JSON.stringify(sizes, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
