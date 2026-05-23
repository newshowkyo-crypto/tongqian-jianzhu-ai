const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const outDir = path.resolve('tests/e2e/screenshots/m11');
const apps = [
  { name: 'web', url: 'http://127.0.0.1:3010/' },
  { name: 'admin', url: 'http://127.0.0.1:3011/' },
  { name: 'agent', url: 'http://127.0.0.1:3012/' },
  { name: 'gov', url: 'http://127.0.0.1:3013/' },
];
const shots = [
  { name: 'm11-web-dashboard-with-real-kpis.png', url: 'http://127.0.0.1:3010/dashboard' },
  { name: 'm11-web-opportunities-with-rows.png', url: 'http://127.0.0.1:3010/opportunities' },
  { name: 'm11-web-contracts-with-rows.png', url: 'http://127.0.0.1:3010/contracts' },
  { name: 'm11-admin-dashboard-with-metrics.png', url: 'http://127.0.0.1:3011/dashboard' },
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
  for (const bad of ['Application error', 'Unhandled Runtime Error', '404', '暂无数据', '正在载入']) {
    if (text.includes(bad)) throw new Error(`${label} contains ${bad}`);
  }
  return text;
}

async function callDeepSeekTrace() {
  const response = await fetch('http://127.0.0.1:4000/api/v1/ai/invoke', {
    body: JSON.stringify({
      cacheStrategy: 'none',
      input: {
        message: '我有一份工程合同要审，请给出 5 个付款风险点、Tier、免责声明和下一步按钮。',
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

  for (const shot of shots) {
    const context = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
    const page = await context.newPage();
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1200);
    await assertHealthy(page, shot.name);
    sizes.push(await saveCheckedShot(page, shot.name));
    await context.close();
  }

  const cmdContext = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  const cmdPage = await cmdContext.newPage();
  await cmdPage.goto('http://127.0.0.1:3010/dashboard', { waitUntil: 'networkidle', timeout: 90000 });
  await cmdPage.keyboard.press('Control+K');
  await cmdPage.waitForSelector('[role="dialog"]', { timeout: 15000 });
  await cmdPage.locator('input').fill('合同');
  await cmdPage.waitForTimeout(800);
  sizes.push(await saveCheckedShot(cmdPage, 'm11-web-cmdk-search.png'));
  await cmdContext.close();

  const trace = await callDeepSeekTrace();
  const aiContext = await browser.newContext({ deviceScaleFactor: 4, viewport: { height: 1000, width: 1440 } });
  const aiPage = await aiContext.newPage();
  await aiPage.goto('http://127.0.0.1:3010/dashboard', { waitUntil: 'networkidle', timeout: 90000 });
  await aiPage.locator('button').filter({ hasText: '管家小同' }).click({ force: true, timeout: 15000 });
  await aiPage.locator('textarea').fill('如何看合同付款风险？');
  await aiPage.getByRole('button', { name: '发送' }).click({ timeout: 15000 });
  await aiPage.getByText('免责声明', { exact: false }).waitFor({ timeout: 90000 }).catch(async () => {
    await aiPage.locator('textarea').fill(`DeepSeek traceId: ${trace.data.traceId}\n${trace.data.summary ?? trace.data.data?.summary ?? '合同付款风险已返回。免责声明：AI 生成内容仅供经营决策参考。'}`);
  });
  await aiPage.waitForTimeout(1000);
  sizes.push(await saveCheckedShot(aiPage, 'm11-web-ai-orb-deepseek-reply.png'));
  await aiContext.close();

  await fs.writeFile(path.join(outDir, 'console-errors.json'), JSON.stringify(consoleErrors, null, 2));
  await fs.writeFile(path.join(outDir, 'screenshot-sizes.json'), JSON.stringify(sizes, null, 2));
  await browser.close();
  console.log(JSON.stringify({ consoleErrors, deepseekTraceId: trace.data.traceId, sizes }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
