import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, '..');
const repoRoot = resolve(desktopDir, '../..');
const webDir = join(repoRoot, 'apps/web');
const nextDir = join(webDir, '.next');
const standaloneSource = join(nextDir, 'standalone');
const staticSource = join(nextDir, 'static');
const publicSource = join(webDir, 'public');
const indexSource = join(nextDir, 'server/app/index.html');
const distDir = join(desktopDir, 'dist');
const standaloneTarget = join(distDir, 'web-standalone');
const staticTarget = join(distDir, 'web-static');

for (const requiredPath of [standaloneSource, staticSource]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Missing Next.js standalone artifact: ${requiredPath}`);
  }
}

rmSync(standaloneTarget, { recursive: true, force: true });
rmSync(staticTarget, { recursive: true, force: true });
mkdirSync(staticTarget, { recursive: true });

cpSync(standaloneSource, standaloneTarget, {
  recursive: true,
  filter: (source) => {
    const rel = relative(standaloneSource, source);
    return rel === '' || !rel.split(/[\\/]/).includes('node_modules');
  },
});
cpSync(staticSource, join(staticTarget, '_next/static'), { recursive: true });
cpSync(staticSource, join(standaloneTarget, 'apps/web/.next/static'), { recursive: true });

if (existsSync(publicSource)) {
  cpSync(publicSource, staticTarget, { recursive: true });
  cpSync(publicSource, join(standaloneTarget, 'apps/web/public'), { recursive: true });
}

if (existsSync(indexSource)) {
  cpSync(indexSource, join(staticTarget, 'index.html'));
} else {
  writeFileSync(
    join(staticTarget, 'index.html'),
    '<!doctype html><html><body><div id="__next"></div></body></html>',
  );
}

console.log('Prepared desktop web artifacts.');
