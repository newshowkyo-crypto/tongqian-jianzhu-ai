import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, '..');
const repoRoot = resolve(desktopDir, '../..');
const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const desktopPackage = JSON.parse(readFileSync(join(desktopDir, 'package.json'), 'utf8'));
const version = rootPackage.version ?? desktopPackage.version;
const tauriConfigPath = join(desktopDir, 'src-tauri/tauri.conf.json');
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf8'));
tauriConfig.version = version;
writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);

run('pnpm', ['--filter', '@tongqian/web', 'build']);
run('node', ['scripts/prepare-web-standalone.mjs'], { cwd: desktopDir });
run('pnpm', ['dlx', '@tauri-apps/cli@2', 'build', '--bundles', 'msi', 'nsis', '--verbose'], { cwd: desktopDir });

const bundleDir = join(desktopDir, 'src-tauri/target/release/bundle/msi');
const msi = existsSync(bundleDir) ? readdirSync(bundleDir).find((file) => file.endsWith('.msi')) : undefined;
const msiPath = msi ? join(bundleDir, msi) : undefined;
const sha256 = msiPath ? createHash('sha256').update(readFileSync(msiPath)).digest('hex') : 'PENDING_UNTIL_CI_BUILD';
const distDir = join(desktopDir, 'dist');
mkdirSync(distDir, { recursive: true });
writeFileSync(
  join(distDir, 'latest.json'),
  `${JSON.stringify({
    notes: '首发版本',
    platforms: {
      'windows-x86_64': {
        signature: 'PLACEHOLDER',
        url: `https://download.tongqianjianzhu.com/desktop/v${version}/tongqian-jianzhu_${version}_x64_zh-CN.msi`,
      },
    },
    pub_date: new Date().toISOString(),
    sha256,
    version,
  }, null, 2)}\n`,
);
console.log(`MSI: ${msiPath ?? 'created by CI runner'}`);
console.log(`SHA256: ${sha256}`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd ?? repoRoot, shell: true, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}
