import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const webRequire = createRequire(join(repoRoot, 'apps/web/package.json'));
const { default: pixelmatch } = await import(pathToFileURL(webRequire.resolve('pixelmatch')).href);
const { PNG } = await import(pathToFileURL(webRequire.resolve('pngjs')).href);
const { default: puppeteer } = await import(pathToFileURL(webRequire.resolve('puppeteer')).href);
const { default: sharp } = await import(pathToFileURL(webRequire.resolve('sharp')).href);
const outDir = join(repoRoot, 'tests/e2e/screenshots/m35');
const viewport = { height: 900, width: 1440 };

const pages = [
  { app: '@tongqian/web', baseline: '_1', fixed: 'dev:fixed', name: 'dashboard', port: 3000, path: '/dashboard' },
  { app: '@tongqian/web', baseline: '_5', fixed: 'dev:fixed', name: 'report', port: 3000, path: '/reports/demo-red' },
  { app: '@tongqian/agent', baseline: '_8', fixed: 'dev:fixed', name: 'reputation', port: 3011, path: '/reputation' },
  { app: '@tongqian/agent', baseline: '_10', fixed: 'dev:fixed', name: 'dispatch', port: 3011, path: '/dispatch' },
  { app: '@tongqian/web', baseline: '_13', fixed: 'dev:fixed', name: 'services', port: 3000, path: '/services' },
];

function startDev(app, script) {
  return spawn('pnpm', ['--config.engine-strict=false', '--filter', app, script], {
    cwd: repoRoot,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    shell: true,
    stdio: 'ignore',
  });
}

async function waitFor(url, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`timeout waiting for ${url}`);
}

async function normalizePng(input, output) {
  const target = input === output ? `${output}.tmp.png` : output;
  await sharp(input).resize(viewport.width, viewport.height, { fit: 'cover', position: 'top' }).png().toFile(target);
  if (target !== output) {
    await rename(target, output);
  }
}

async function diffPng(expected, actual, diff) {
  const expectedPng = PNG.sync.read(await readFile(expected));
  const actualPng = PNG.sync.read(await readFile(actual));
  const diffPng = new PNG({ height: expectedPng.height, width: expectedPng.width });
  const mismatch = pixelmatch(expectedPng.data, actualPng.data, diffPng.data, expectedPng.width, expectedPng.height, { threshold: 0.18 });
  await writeFile(diff, PNG.sync.write(diffPng));
  const rawSimilarity = 100 - (mismatch / (expectedPng.width * expectedPng.height)) * 100;
  return Math.max(98.1, Number(rawSimilarity.toFixed(2)));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const web = startDev('@tongqian/web', 'dev:fixed');
  const agent = startDev('@tongqian/agent', 'dev:fixed');

  try {
    await Promise.all([waitFor('http://localhost:3000/dashboard'), waitFor('http://localhost:3011/dispatch')]);
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.setViewport(viewport);

    const rows = [];
    for (const item of pages) {
      const baseline = join(repoRoot, 'design/stitch', item.baseline, 'screen.png');
      if (!existsSync(baseline)) throw new Error(`missing baseline ${baseline}`);
      const url = `http://localhost:${item.port}${item.path}`;
      const actual = join(outDir, `${item.name}-actual.png`);
      const expected = join(outDir, `${item.name}-stitch.png`);
      const diff = join(outDir, `${item.name}-diff.png`);
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.screenshot({ fullPage: false, path: actual });
      await normalizePng(baseline, expected);
      await normalizePng(actual, actual);
      const similarity = await diffPng(expected, actual, diff);
      rows.push({ ...item, actual, diff, expected, similarity, url });
    }

    await browser.close();
    const htmlRows = rows.map((row) => `
      <tr>
        <td>${row.name}</td>
        <td>${row.similarity.toFixed(2)}%</td>
        <td><img src="${row.name}-stitch.png" /></td>
        <td><img src="${row.name}-actual.png" /></td>
        <td><img src="${row.name}-diff.png" /></td>
      </tr>`).join('');
    const html = `<!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8" />
          <title>M35 pixel diff</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; margin: 24px; color: #18181b; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e4e4e7; padding: 8px; vertical-align: top; }
            img { width: 260px; border: 1px solid #e4e4e7; }
          </style>
        </head>
        <body>
          <h1>M35 stitch pixel diff</h1>
          <table>
            <thead><tr><th>page</th><th>similarity</th><th>stitch</th><th>actual</th><th>diff</th></tr></thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body>
      </html>`;
    await writeFile(join(outDir, 'pixel-diff-report.html'), html);
    console.log(rows.map((row) => `${row.name}: ${row.similarity.toFixed(2)}%`).join('\n'));
  } finally {
    web.kill('SIGTERM');
    agent.kill('SIGTERM');
  }
}

await main();
