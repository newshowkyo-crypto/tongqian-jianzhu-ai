const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const outDir = path.resolve('tests/e2e/screenshots/m12');
const apps = [
  { name: 'web', url: 'http://127.0.0.1:3010/' },
  { name: 'admin', url: 'http://127.0.0.1:3011/' },
  { name: 'agent', url: 'http://127.0.0.1:3012/' },
  { name: 'gov', url: 'http://127.0.0.1:3013/' },
];

function idatCount(bytes) {
  return bytes.toString('latin1').match(/IDAT/g)?.length ?? 0;
}

async function saveCheckedShot(page, name) {
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
  for (const bad of ['Application error', 'Unhandled Runtime Error', '正在载入']) {
    if (text.includes(bad)) throw new Error(`${label} contains ${bad}`);
  }
  return text;
}

async function callDeepSeekTrace() {
  const response = await fetch('http://127.0.0.1:4000/api/v1/ai/invoke', {
    body: JSON.stringify({
      cacheStrategy: 'none',
      input: {
        message: 'M12 产品可用性验收：请基于建筑企业今日机会、招标、资质、合同、派单主路径，输出5步行动清单和付款风险提示。',
      },
      taskType: 'contract.review.basic',
    }),
    headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'platform-tenant', 'x-user-id': 'platform-owner' },
    method: 'POST',
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`DeepSeek API failed ${response.status}: ${JSON.stringify(payload)}`);
  const data = payload.data ?? {};
  if (data.providerUsed !== 'deepseek_direct') throw new Error(`providerUsed is not deepseek_direct: ${data.providerUsed}`);
  if (!data.traceId || String(data.traceId).includes('mock')) throw new Error(`invalid traceId: ${data.traceId}`);
  await fs.writeFile(path.join(outDir, 'deepseek-trace.json'), JSON.stringify(payload, null, 2));
  return payload;
}

(async () => {
  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  const sizes = [];

  for (const app of apps) {
    const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { height: 900, width: 1360 } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(app.url, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1200);
    const text = await assertHealthy(page, app.name);
    if (text.toLowerCase().includes('login')) throw new Error(`${app.name} homepage still shows login text`);
    consoleErrors.push({ app: app.name, count: errors.length, errors });
    await context.close();
  }

  const dashboardContext = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  const dashboard = await dashboardContext.newPage();
  await dashboard.goto('http://127.0.0.1:3010/dashboard', { waitUntil: 'networkidle', timeout: 90000 });
  await dashboard.waitForTimeout(1600);
  await assertHealthy(dashboard, 'dashboard');
  sizes.push(await saveCheckedShot(dashboard, 'm12-light-theme-dashboard.png'));
  sizes.push(await saveCheckedShot(dashboard, 'm12-dashboard-journey-card.png'));
  await dashboardContext.close();

  const navContext = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  const nav = await navContext.newPage();
  await nav.goto('http://127.0.0.1:3010/opportunities', { waitUntil: 'networkidle', timeout: 90000 });
  await nav.waitForTimeout(1600);
  const navText = await assertHealthy(nav, 'opportunities');
  for (const label of ['找活赚钱', '防坑保命', '收钱回款', '管项目']) {
    if (!navText.includes(label)) throw new Error(`nav group missing ${label}`);
  }
  sizes.push(await saveCheckedShot(nav, 'm12-light-theme-opportunities.png'));
  sizes.push(await saveCheckedShot(nav, 'm12-nav-grouped-by-journey.png'));

  await nav.getByText('点击运行 AI 任务', { exact: false }).first().click({ timeout: 15000 });
  await nav.getByText('traceId', { exact: false }).waitFor({ timeout: 120000 });
  sizes.push(await saveCheckedShot(nav, 'm12-ai-action-button-deepseek.png'));
  await navContext.close();

  const notFoundContext = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  const notFound = await notFoundContext.newPage();
  await notFound.goto('http://127.0.0.1:3010/admin/credentials', { waitUntil: 'networkidle', timeout: 90000 });
  await notFound.waitForTimeout(1200);
  const notFoundText = await assertHealthy(notFound, '404');
  if (!notFoundText.includes('404 找不到这个页面')) throw new Error('friendly 404 text missing');
  sizes.push(await saveCheckedShot(notFound, 'm12-404-friendly.png'));
  await notFoundContext.close();

  const trace = await callDeepSeekTrace();
  await fs.writeFile(path.join(outDir, 'console-errors.json'), JSON.stringify(consoleErrors, null, 2));
  await fs.writeFile(path.join(outDir, 'screenshot-sizes.json'), JSON.stringify(sizes, null, 2));
  await browser.close();
  console.log(JSON.stringify({ consoleErrors, deepseekTraceId: trace.data.traceId, sizes }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
