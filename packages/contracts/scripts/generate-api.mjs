import { spawnSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const openapiPath = resolve(packageRoot, 'openapi.yaml');
const generatedRoot = resolve(packageRoot, 'generated');

await rm(generatedRoot, { recursive: true, force: true });
await mkdir(resolve(generatedRoot, 'zod'), { recursive: true });

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run('openapi', [
  '--input',
  openapiPath,
  '--output',
  resolve(generatedRoot, 'client'),
  '--client',
  'fetch',
  '--useOptions',
  '--useUnionTypes',
]);

run('openapi-zod-client', [
  openapiPath,
  '--output',
  resolve(generatedRoot, 'zod', 'schemas.ts'),
  '--base-url',
  '/api/v1',
  '--export-schemas',
  '--export-types',
  '--strict-objects',
]);
