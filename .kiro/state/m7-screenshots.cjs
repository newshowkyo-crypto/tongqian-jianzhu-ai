const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const outDir = path.resolve('tests/e2e/screenshots/m7');
const shots = [
  { name: 'm7-credentials-zh.png', url: 'http://127.0.0.1:3011/admin/credentials' },
  { name: 'm7-ingest-tianyancha-zh.png', url: 'http://127.0.0.1:3011/ingest/tianyancha' },
  { name: 'm7-prompts-no-crash.png', url: 'http://127.0.0.1:3011/admin/prompts' },
  { name: 'm7-rules-no-crash.png', url: 'http://127.0.0.1:3011/admin/rules' },
  { name: 'm7-ai-orb-no-template-leak.png', url: 'http://127.0.0.1:3010/dashboard', clickText: '管家小同' },
  { name: 'm7-admin-home-no-duplicate-tabs.png', url: 'http://127.0.0.1:3011/' },
  { name: 'm7-web-report-5-actions.png', url: 'http://127.0.0.1:3010/reports/demo' },
  { name: 'm7-agent-partner-subtype.png', url: 'http://127.0.0.1:3012/profile' },
];

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function assertPage(page, shot) {
  const text = await page.locator('body').innerText({ timeout: 20000 });
  const forbidden = [
    '404',
    'Application error',
    'Unhandled Runtime Error',
    'Cannot read properties',
    'TypeError',
    '{{',
    '<request>',
    '<company_profile>',
    '<document_text>',
  ];
  for (const word of forbidden) {
    if (text.includes(word)) throw new Error(`${shot.name} captured invalid page text: ${word}`);
  }
}

(async () => {
  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 4,
    viewport: { height: 1000, width: 1440 },
  });
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
    if (shot.clickText) {
      const target = page.getByText(shot.clickText, { exact: false }).first();
      if ((await target.count()) > 0) await target.click({ force: true, timeout: 10000 });
    }
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
