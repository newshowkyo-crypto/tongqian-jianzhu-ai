import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allocatePort } from './dev-port-allocator.mjs';

const appName = process.argv[2];

if (!appName) {
  console.error('usage: node scripts/run-dev.mjs <app>');
  process.exit(1);
}

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const appDir = join(repoRoot, 'apps', appName);
const port = await allocatePort(appName);

console.log(`[m34] ${appName} dev server -> http://localhost:${port}`);

const child = spawn('pnpm', ['--config.engine-strict=false', 'exec', 'next', 'dev', '-p', String(port)], {
  cwd: appDir,
  env: { ...process.env, PORT: String(port) },
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
