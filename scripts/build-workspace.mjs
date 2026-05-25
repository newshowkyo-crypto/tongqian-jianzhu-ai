import { spawnSync } from 'node:child_process';

const nonNextFilters = [
  '@tongqian/api',
  '@tongqian/api-client',
  '@tongqian/worker',
  '@tongqian/constants',
  '@tongqian/contracts',
  '@tongqian/errors',
  '@tongqian/permissions',
  '@tongqian/test-fixtures',
  '@tongqian/types',
  '@tongqian/ui',
  '@tongqian/utils',
  '@tongqian/desktop',
];

const nextApps = ['@tongqian/admin', '@tongqian/agent', '@tongqian/gov'];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    env: { ...process.env, ...options.env },
    shell: true,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const pnpm = (...args) => ['--config.engine-strict=false', ...args];

run(
  'pnpm',
  pnpm('--filter', '@tongqian/web', 'build'),
);

run(
  'pnpm',
  pnpm(...nonNextFilters.flatMap((filter) => ['--filter', filter]), 'build'),
);

for (const app of nextApps) {
  run('pnpm', pnpm('--filter', app, 'build'), {
    env: {
      NEXT_STANDALONE: 'false',
    },
  });
}
