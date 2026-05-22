import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const roots = ['apps/web/src', 'apps/agent/src', 'apps/gov/src', 'apps/admin/src'];
const files = execSync(`git ls-files ${roots.join(' ')}`, { encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter((file) => /\.(tsx|ts)$/.test(file));

const replacements = [
  [/\btext-6xl\b/g, 'text-3xl'],
  [/\btext-5xl\b/g, 'text-3xl'],
  [/\btext-4xl\b/g, 'text-3xl'],
  [/text-\[15px\]/g, 'text-base'],
  [/text-\[18px\]/g, 'text-lg'],
  [/text-\[19px\]/g, 'text-lg'],
  [/\bp-3\b/g, 'p-4'],
  [/\bp-5\b/g, 'p-6'],
  [/\bp-7\b/g, 'p-8'],
  [/\bgap-3\b/g, 'gap-4'],
  [/\bgap-5\b/g, 'gap-6'],
  [/\bgap-7\b/g, 'gap-8'],
  [/\bspace-y-3\b/g, 'space-y-4'],
  [/\bspace-y-5\b/g, 'space-y-6'],
  [/\brounded-2xl\b/g, 'rounded-xl'],
  [/\brounded-3xl\b/g, 'rounded-xl'],
  [/rounded-\[(24|28|32)px\]/g, 'rounded-xl'],
  [/\bshadow-2xl\b/g, 'shadow-md'],
  [/\bshadow-xl\b/g, 'shadow-md'],
];

let changedFiles = 0;
let replacementsCount = 0;

for (const file of files) {
  const full = join(process.cwd(), file);
  let source = readFileSync(full, 'utf8');
  let next = source;
  for (const [pattern, replacement] of replacements) {
    const hits = next.match(pattern)?.length ?? 0;
    if (hits > 0) replacementsCount += hits;
    next = next.replace(pattern, replacement);
  }
  if (next !== source) {
    writeFileSync(full, next);
    changedFiles += 1;
  }
}

console.log(`m9-typography-codemod replacements=${replacementsCount} files=${changedFiles}`);
