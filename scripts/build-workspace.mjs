import { spawnSync } from 'node:child_process';

const nonNextFilters = [
  '@tongqian/api',
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

const nextApps = ['@tongqian/web', '@tongqian/admin', '@tongqian/agent', '@tongqian/gov'];

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

run(
  'pnpm',
  nonNextFilters.flatMap((filter) => ['--filter', filter]).concat('build'),
);

for (const app of nextApps) {
  run('pnpm', ['--filter', app, 'build'], {
    env: {
      NEXT_STANDALONE: 'false',
    },
  });
}
