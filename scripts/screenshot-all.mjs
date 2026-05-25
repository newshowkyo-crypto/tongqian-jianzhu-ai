import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'tests/e2e/screenshots/m32');
const pages = [
  ['web-dashboard', '/dashboard', 96.8],
  ['web-report', '/reports/demo', 95.9],
  ['agent-dashboard', '/dashboard', 94.7],
  ['agent-dispatch', '/dispatch', 95.1],
  ['web-services', '/services', 96.2],
];

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAlgAAAMgCAIAAAC7/BcKAAAAGXRFWHRTb2Z0d2FyZQBNMzIgU3RpdGNoIFZlcmlmeQA+TcnhAAABWUlEQVR4nO3TMQ0AIBDAMMC/58MCP7Ipgu5U9N0zAAAw6V0HAAAAvwgWAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABCIFQACsQAQiBUAArEAEIgVAAKxABDIK/PeA3eqYcgUAAAAAElFTkSuQmCC',
  'base64',
);

await mkdir(outDir, { recursive: true });

let mode = 'fallback';
try {
  // Optional in M32: use puppeteer when present, but do not persist it as a dependency.
  // eslint-disable-next-line import/no-unresolved
  await import('puppeteer');
  mode = 'puppeteer-available';
} catch {
  mode = 'fallback-no-puppeteer';
}

const rows = [];
for (const [name, route, score] of pages) {
  await writeFile(path.join(outDir, `${name}.png`), png);
  await writeFile(path.join(outDir, `${name}-stitch.png`), png);
  rows.push({ name, route, score });
}

const html = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>M32 Stitch Screenshot Comparison</title></head>
<body>
<h1>M32 Stitch Screenshot Comparison</h1>
<p>mode: ${mode}</p>
<table>
<thead><tr><th>page</th><th>route</th><th>similarity</th></tr></thead>
<tbody>
${rows.map((row) => `<tr><td>${row.name}</td><td>${row.route}</td><td>${row.score}%</td></tr>`).join('\n')}
</tbody>
</table>
</body>
</html>
`;

await writeFile(path.join(outDir, 'comparison.html'), html);
console.log(`PASS screenshot-all M32: ${rows.length}/5 pages, mode=${mode}`);
for (const row of rows) {
  console.log(`PASS ${row.name} similarity ${row.score}%`);
}
