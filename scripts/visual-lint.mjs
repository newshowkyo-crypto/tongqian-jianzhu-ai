import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execSync('git ls-files apps', { encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter((file) => /\.(tsx|ts)$/.test(file) && !file.includes('/.next/') && !file.includes('/node_modules/'));

const rules = [
  { id: 'R1', label: 'hardcode hex', pattern: /(text|bg|border|from|via|to|stroke|fill|border-l)-\[#(?:[0-9a-fA-F]{3,8})\]/ },
  { id: 'R2', label: 'oversized typography', pattern: /\btext-(4xl|5xl|6xl)\b|text-\[1[3-9]px\]/ },
  { id: 'R3', label: 'odd spacing', pattern: /\b(?:p|gap|space-y)-(3|5|7)\b/ },
  { id: 'R4', label: 'oversized radius', pattern: /\brounded-(?:2|3)xl\b|rounded-\[\d+px\]/ },
  { id: 'R5', label: 'oversized shadow', pattern: /\bshadow-(?:xl|2xl)\b/ },
  { id: 'R9', label: 'low-contrast white on light bg', pattern: /\bbg-white(?:\s|["'`])[^"`']*?\btext-white\b/ },
  { id: 'R9', label: 'low-contrast gray text', pattern: /\btext-(?:neutral-200|neutral-300|gray-200|gray-300)\b/ },
  { id: 'R9', label: 'low-contrast translucent text', pattern: /\btext-(?:white|on-surface-variant)\/[0-3]0\b/ },
  { id: 'R8', label: 'inline color style', pattern: /style=\{\{[^}]*\b(?:color|background)\b/ },
];

const hits = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        hits.push(`${rule.id} ${rule.label} ${file}:${index + 1}: ${line.trim().slice(0, 180)}`);
      }
    }
    if (file.includes('apps/admin/src/app/admin/data-center') && /Search|All|Golden|Pending|Archived|Interface-first|Upload CSV|Wenshu CSV importer|case field/.test(line)) {
      hits.push(`R6 data-center English ${file}:${index + 1}: ${line.trim().slice(0, 180)}`);
    }
    if (/\.tsx$/.test(file) && /(✅|⚠️|❌|✒️|🐛)/u.test(line)) {
      hits.push(`R7 functional emoji ${file}:${index + 1}: ${line.trim().slice(0, 180)}`);
    }
  });
}

if (hits.length > 0) {
  console.error(hits.join('\n'));
  process.exit(1);
}

console.log('PASS visual-lint R1-R9: no violations');
