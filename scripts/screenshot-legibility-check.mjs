import { spawn, execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const requireFromWeb = createRequire(path.join(process.cwd(), 'apps/web/package.json'));
const puppeteer = requireFromWeb('puppeteer');

const outDir = path.join(process.cwd(), 'tests/e2e/screenshots/m33');
const targets = [
  { app: 'web', file: 'web-dashboard.png', filter: '@tongqian/web', name: 'web-dashboard', port: 3000, route: '/dashboard' },
  { app: 'admin', file: 'admin-home.png', filter: '@tongqian/admin', name: 'admin-home', port: 3010, route: '/dashboard' },
  { app: 'agent', file: 'agent-dashboard.png', filter: '@tongqian/agent', name: 'agent-dashboard', port: 3011, route: '/dashboard' },
  { app: 'gov', file: 'gov-dashboard.png', filter: '@tongqian/gov', name: 'gov-dashboard', port: 3012, route: '/dashboard' },
];

function stopPort(port) {
  try {
    execSync(`powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
  } catch {
    // Ignore: port may be free.
  }
}

async function waitFor(url, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

await mkdir(outDir, { recursive: true });
for (const target of targets) stopPort(target.port);

const children = targets.map((target) => spawn(
  'pnpm',
  ['--config.engine-strict=false', '--filter', target.filter, 'exec', 'next', 'dev', '-p', String(target.port)],
  { cwd: process.cwd(), shell: true, stdio: ['ignore', 'ignore', 'ignore'] },
));

try {
  await Promise.all(targets.map((target) => waitFor(`http://127.0.0.1:${target.port}${target.route}`)));
  const browser = await puppeteer.launch({ headless: true });
  const results = [];
  try {
    for (const target of targets) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
      const url = `http://127.0.0.1:${target.port}${target.route}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45_000 });
      const innerText = await page.evaluate(() => document.body.innerText);
      const hasQuestionMarks = /\?\?\?/.test(innerText);
      const hasMojibake = /[�]|鍚|鏅|绠|涓|鐩|杞|寰|瀹/.test(innerText);
      await page.screenshot({ fullPage: true, path: path.join(outDir, target.file) });
      await page.close();
      results.push({ ...target, hasMojibake, hasQuestionMarks, url });
      console.log(`${hasQuestionMarks || hasMojibake ? 'FAIL' : 'PASS'} ${target.name} questionMarks=${hasQuestionMarks} mojibake=${hasMojibake}`);
    }
  } finally {
    await browser.close();
  }

  const report = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>M33 Legibility Report</title></head><body><h1>M33 Legibility Report</h1><table><thead><tr><th>page</th><th>url</th><th>???</th><th>mojibake</th><th>screenshot</th></tr></thead><tbody>${results.map((item) => `<tr><td>${item.name}</td><td>${item.url}</td><td>${item.hasQuestionMarks}</td><td>${item.hasMojibake}</td><td><img src="./${item.file}" width="320"></td></tr>`).join('')}</tbody></table></body></html>`;
  await writeFile(path.join(outDir, 'legibility-report.html'), report);
  if (results.some((item) => item.hasQuestionMarks || item.hasMojibake)) process.exitCode = 1;
} finally {
  for (const child of children) child.kill();
  for (const target of targets) stopPort(target.port);
}
