import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['apps/web/src', 'apps/agent/src', 'apps/gov/src', 'apps/admin/src', 'packages/ui/src'];
const files = execSync(`git ls-files ${roots.join(' ')}`, { encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter((file) => /\.(tsx|ts)$/.test(file));

const replacements = [
  [/text-\[#0a1d3d\]/g, 'text-navy-deepest'],
  [/text-\[#d8dde5\]/g, 'text-silver-light'],
  [/text-\[#b5bcc8\]/g, 'text-silver-main'],
  [/text-\[#d99880\]/g, 'text-rose-main'],
  [/text-\[#8f4f3f\]/g, 'text-rose-deep'],
  [/bg-\[#0a1d3d\]/g, 'bg-navy-deepest'],
  [/bg-\[#d99880\]/g, 'bg-rose-main'],
  [/bg-\[#d99880\]\/10/g, 'bg-rose-main/10'],
  [/border-\[#d99880\]/g, 'border-rose-main'],
  [/border-\[#d99880\]\/40/g, 'border-rose-main/40'],
  [/border-\[#d8dde5\]/g, 'border-silver-light'],
  [/border-\[#b5bcc8\]/g, 'border-silver-main'],
  [/border-l-\[#d99880\]/g, 'border-l-rose-main'],
  [/bg-\[linear-gradient\(135deg,#0a1d3d,#142a52\)\]/g, 'bg-[var(--gradient-navy-hero)]'],
  [/bg-\[linear-gradient\(135deg,#0a1d3d,#1e3a6f\)\]/g, 'bg-[var(--gradient-navy-hero)]'],
  [/bg-\[linear-gradient\(135deg,#0a1d3d,#1e3a6f\)\]/g, 'bg-[var(--gradient-navy-hero)]'],
  [/bg-\[linear-gradient\(135deg,#0a1d3d,#142a52_58%,#1e3a6f\)\]/g, 'bg-[var(--gradient-navy-hero)]'],
  [/from-\[#0a1d3d\]/g, 'from-navy-deepest'],
  [/via-\[#1e3a6f\]/g, 'via-navy-mid'],
  [/via-\[#142a52\]/g, 'via-navy-deep'],
  [/to-\[#d99880\]/g, 'to-rose-main'],
  [/to-\[#4a8eff\]/g, 'to-cyber-blue'],
  [/from-\[#142a52\]/g, 'from-navy-deep'],
  [/via-\[#4a8eff\]/g, 'via-cyber-blue'],
  [/#d4953a/g, '#d99880'],
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

console.log(`m9-color-codemod replacements=${replacementsCount} files=${changedFiles}`);
