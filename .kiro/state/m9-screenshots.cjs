const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const axeSource = require('axe-core').source;

const outDir = path.resolve('tests/e2e/screenshots/m9');
const shots = [
  { name: 'm9-admin-notifications-readable.png', url: 'http://127.0.0.1:3011/admin/notifications' },
  { name: 'm9-admin-jobs-readable.png', url: 'http://127.0.0.1:3011/admin/jobs' },
  { name: 'm9-admin-health-readable.png', url: 'http://127.0.0.1:3011/admin/health' },
  { name: 'm9-admin-ai-monitor-readable.png', url: 'http://127.0.0.1:3011/admin/ai-monitor' },
  { name: 'm9-admin-data-center-zh.png', url: 'http://127.0.0.1:3011/admin/data-center/dashboard' },
  { name: 'm9-web-dashboard-tokenized.png', url: 'http://127.0.0.1:3010/dashboard' },
];

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function contrastAudit(page) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } }));
  return result.violations;
}

async function assertPage(page, shot) {
  const text = await page.locator('body').innerText({ timeout: 20000 });
  const forbidden = ['404', 'Application error', 'Unhandled Runtime Error', 'TypeError', 'Search title', 'Interface-first', 'Upload CSV', 'Wenshu CSV importer', 'case field'];
  for (const word of forbidden) {
    if (text.includes(word)) throw new Error(`${shot.name} captured invalid page text: ${word}`);
  }
  const contrast = await contrastAudit(page);
  if (contrast.length > 0) throw new Error(`${shot.name} axe color-contrast violations: ${JSON.stringify(contrast.map((item) => ({ id: item.id, nodes: item.nodes.length })))}`);
}

(async () => {
  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  await context.addCookies([
    { name: 'tq_auth_token', value: 'dev-admin', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
    { name: 'tq_role', value: 'platform_owner', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
  ]);
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('tongqian.jwt', 'dev-admin');
    localStorage.setItem('tongqian.role', 'platform_owner');
    localStorage.setItem('tongqian.userId', 'platform-owner');
    localStorage.setItem('tongqian.tenantId', 'platform-tenant');
  });

  const sizes = [];
  for (const shot of shots) {
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);
    await assertPage(page, shot);
    const file = path.join(outDir, shot.name);
    await page.screenshot({ fullPage: true, path: file });
    const bytes = await fs.readFile(file);
    const stat = await fs.stat(file);
    const idat = idatCount(bytes);
    if (stat.size < 204800) throw new Error(`${shot.name} too small: ${stat.size}`);
    if (idat < 5) throw new Error(`${shot.name} has too few IDAT chunks: ${idat}`);
    sizes.push({ idat, name: shot.name, size: stat.size });
  }
  await browser.close();
  console.log(JSON.stringify(sizes, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
