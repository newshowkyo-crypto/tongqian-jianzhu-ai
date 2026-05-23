const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const outDir = path.resolve('tests/e2e/screenshots/m10');
const directApps = [
  { name: 'web', port: 3010 },
  { name: 'admin', port: 3011 },
  { name: 'agent', port: 3012 },
  { name: 'gov', port: 3013 },
];
const shots = [
  { name: 'm10-admin-login-styled.png', url: 'http://127.0.0.1:3011/login', type: 'login' },
  { name: 'm10-web-dev-direct-dashboard.png', url: 'http://127.0.0.1:3010/', type: 'direct' },
  { name: 'm10-agent-login-button-clickable.png', url: 'http://127.0.0.1:3012/login?next=/dashboard', type: 'click' },
];

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function assertNoLogin(page, label) {
  const url = page.url();
  const text = await page.locator('body').innerText({ timeout: 30000 });
  if (!url.includes('/dashboard')) throw new Error(`${label} did not land on dashboard: ${url}`);
  if (url.includes('/login')) throw new Error(`${label} still on login: ${url}`);
  if (text.includes('登录') && text.includes('Cookie')) throw new Error(`${label} still shows login copy`);
  if (text.includes('Application error') || text.includes('Unhandled Runtime Error') || text.includes('404')) {
    throw new Error(`${label} captured broken page text`);
  }
}

async function assertLoginStyled(page) {
  const text = await page.locator('body').innerText({ timeout: 30000 });
  const className = await page.locator('main').getAttribute('class');
  if (!text.includes('登录平台后台')) throw new Error('admin login copy missing');
  if (!className?.includes('bg-navy-deepest')) throw new Error('admin login shell is not cyber styled');
}

(async () => {
  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const sizes = [];

  for (const app of directApps) {
    const context = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${app.port}/`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(700);
    await assertNoLogin(page, `${app.name} dev direct`);
    await context.close();
  }

  for (const shot of shots) {
    const context = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
    const page = await context.newPage();
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(700);

    if (shot.type === 'login') {
      await assertLoginStyled(page);
    }
    if (shot.type === 'direct') {
      await assertNoLogin(page, shot.name);
    }
    if (shot.type === 'click') {
      await page.getByRole('button').click({ timeout: 15000 });
      await page.waitForURL(/\/dashboard/, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await assertNoLogin(page, shot.name);
    }

    const file = path.join(outDir, shot.name);
    await page.screenshot({ fullPage: true, path: file, timeout: 120000 });
    const bytes = await fs.readFile(file);
    const stat = await fs.stat(file);
    const idat = idatCount(bytes);
    if (stat.size < 204800) throw new Error(`${shot.name} too small: ${stat.size}`);
    if (idat < 5) throw new Error(`${shot.name} has too few IDAT chunks: ${idat}`);
    sizes.push({ idat, name: shot.name, size: stat.size });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(sizes, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
