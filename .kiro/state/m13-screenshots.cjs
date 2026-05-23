const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const outDir = path.resolve('tests/e2e/screenshots/m13');

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function save(page, name) {
  const file = path.join(outDir, name);
  await page.screenshot({ fullPage: true, path: file });
  const bytes = await fs.readFile(file);
  const stat = await fs.stat(file);
  const idat = idatCount(bytes);
  if (stat.size < 204800) throw new Error(`${name} too small: ${stat.size}`);
  if (idat < 5) throw new Error(`${name} has too few IDAT chunks: ${idat}`);
  return { idat, name, size: stat.size };
}

async function assertHealthy(page, label) {
  const text = await page.locator('body').innerText({ timeout: 45000 });
  for (const bad of ['Application error', 'Unhandled Runtime Error', 'TypeError']) {
    if (text.includes(bad)) throw new Error(`${label} contains ${bad}`);
  }
  return text;
}

(async () => {
  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ deviceScaleFactor: 3, viewport: { height: 1000, width: 1440 } });
  await context.addCookies([
    { name: 'tq_auth_token', value: 'dev-web', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
    { name: 'tq_role', value: 'owner', domain: '127.0.0.1', path: '/', httpOnly: false, sameSite: 'Lax' },
  ]);
  const page = await context.newPage();
  const sizes = [];

  await page.goto('http://127.0.0.1:3010/dashboard', { waitUntil: 'networkidle', timeout: 90000 });
  await assertHealthy(page, 'dashboard');
  sizes.push(await save(page, 'm13-dashboard-stitch.png'));

  await page.goto('http://127.0.0.1:3010/opportunities', { waitUntil: 'networkidle', timeout: 90000 });
  await assertHealthy(page, 'opportunities');
  sizes.push(await save(page, 'm13-opportunities-stitch.png'));
  const aiButton = page.getByTestId('m13-ai-primary');
  await aiButton.click({ timeout: 15000 });
  await page.getByText('traceId:', { exact: false }).waitFor({ timeout: 120000 });
  const traceText = await page.locator('article').filter({ hasText: 'traceId:' }).first().innerText({ timeout: 15000 });
  const traceId = traceText.match(/traceId:\s*([0-9a-f-]{20,}|mock)/i)?.[1] ?? '';
  if (!traceId || traceId === 'mock') throw new Error(`invalid DeepSeek traceId: ${traceId}`);
  await fs.writeFile(path.join(outDir, 'deepseek-trace.json'), JSON.stringify({ traceId }, null, 2));

  await page.goto('http://127.0.0.1:3010/h5/reports/contract-review', { waitUntil: 'networkidle', timeout: 90000 });
  await assertHealthy(page, 'h5 contract review');
  sizes.push(await save(page, 'm13-h5-contract-review-stitch.png'));

  await page.goto('http://127.0.0.1:3010/login', { waitUntil: 'networkidle', timeout: 90000 });
  await assertHealthy(page, 'login');
  sizes.push(await save(page, 'm13-login-web-stitch.png'));

  await page.goto('http://127.0.0.1:3010/welcome', { waitUntil: 'networkidle', timeout: 90000 });
  await assertHealthy(page, 'welcome');
  sizes.push(await save(page, 'm13-welcome-marketing-stitch.png'));

  const left = path.resolve('design/stitch/_1/screen.png').replace(/\\/g, '/');
  const right = path.resolve(outDir, 'm13-dashboard-stitch.png').replace(/\\/g, '/');
  const html = `<!doctype html><html><body style="margin:0;background:#f7f9fc;font-family:Arial,sans-serif"><div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px"><div><h2>Stitch design</h2><img src="file:///${left}" style="width:100%;border:1px solid #c2c6d4;border-radius:8px"/></div><div><h2>React implementation</h2><img src="file:///${right}" style="width:100%;border:1px solid #c2c6d4;border-radius:8px"/></div></div></body></html>`;
  await fs.writeFile(path.join(outDir, 'comparison.html'), html);
  await page.goto(`file:///${path.resolve(outDir, 'comparison.html').replace(/\\/g, '/')}`, { waitUntil: 'load', timeout: 90000 });
  sizes.push(await save(page, 'm13-side-by-side-comparison.png'));

  await browser.close();
  await fs.writeFile(path.join(outDir, 'screenshot-sizes.json'), JSON.stringify(sizes, null, 2));
  console.log(JSON.stringify({ deepseekTraceId: traceId, sizes }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
