# M34 · 端口自动避让（多套系统并存友好）

> Codex 整段读，按 3 子块顺序，每块 1 commit。**节流模式 + 不开 dev server（除 M34 子块 3 真测一次）+ 不引重型依赖**。
> 本期定位：万婷婷电脑同时跑多套系统，3000-3013 经常被占。让 4 端 dev 自动找空闲端口启动。

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`
2. `apps/web/package.json` + `apps/admin` + `apps/agent` + `apps/gov` 4 端 scripts.dev
3. `apps/web/next.config.mjs` + 其他 3 端
4. `infra/docker-compose.prod.yml`（VPS 上仍用固定端口，不能动）

**节流契约**：上下文 ≥ 50% commit + push + 主动结束；单子块 ≤ 4 文件 / ≤ 200 行；不动业务逻辑 / 不动 prod 配置。

---

## 1. 子块拆解

### 子块 1 · port-allocator 工具

新建 `scripts/dev-port-allocator.mjs`（≤ 100 行）：

```javascript
import { createServer } from 'node:net';

const APP_PREFERRED = {
  web: [3000, 3100, 3200, 3300],
  admin: [3010, 3110, 3210, 3310],
  agent: [3011, 3111, 3211, 3311],
  gov: [3012, 3112, 3212, 3312],
  api: [4000, 4100, 4200, 4300],
};

async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

export async function allocatePort(appName) {
  const candidates = APP_PREFERRED[appName] ?? [];
  for (const port of candidates) {
    if (await isPortFree(port)) return port;
  }
  // fallback random
  for (let p = 3500; p < 3999; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(`no free port for ${appName}`);
}

if (process.argv[1].endsWith('dev-port-allocator.mjs')) {
  const app = process.argv[2];
  console.log(await allocatePort(app));
}
```

提交：`git checkout -b feature/m34-port-manager && git add -A && git commit --no-verify -m "feat(m34): port allocator tool with preference fallback"; git push -u origin feature/m34-port-manager`

---

### 子块 2 · 4 端 dev 脚本接 port-allocator

**改 `apps/web/package.json`**（其他 3 端同样）：

```json
{
  "scripts": {
    "dev": "node ../../scripts/run-dev.mjs web",
    "dev:fixed": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  }
}
```

新建 `scripts/run-dev.mjs`（≤ 80 行）：
- 调 allocatePort(appName)
- 输出真实端口
- 设 PORT env + 启动 next dev

`apps/web/next.config.mjs`：确认能读 `PORT` env（next 默认就读，不用改）

提交：`git add -A && git commit --no-verify -m "feat(m34): 4 apps dev scripts route through port allocator"; git push`

---

### 子块 3 · 启动测试 + verify-m34

**真启动一次**（M34 例外允许，因为本身就是测启动）：

- `pnpm --filter @tongqian/web dev`
- 等 30 秒看输出端口
- kill
- 在另一个终端**先手动占用 3000**（`node -e "require('http').createServer(()=>{}).listen(3000)"`）→ 再跑 dev → 应该自动跳到 3100

`scripts/verify-m34.ps1`（**6 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

Check 'M34.1 port-allocator' (Test-Path 'scripts/dev-port-allocator.mjs')
Check 'M34.2 run-dev' (Test-Path 'scripts/run-dev.mjs')
$webPkg = Get-Content 'apps/web/package.json' -Raw
Check 'M34.3 web uses run-dev' ($webPkg -match 'run-dev.mjs')
$prodCompose = Get-Content 'infra/docker-compose.prod.yml' -Raw
Check 'M34.4 prod compose unchanged' ($prodCompose -match '3000:3000' -or $prodCompose -match '4000:4000')
Check 'M34.5 dev:fixed escape' ($webPkg -match 'dev:fixed')
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M34.6 typecheck' ($LASTEXITCODE -eq 0)

Write-Host ""; Write-Host "M34 verify: $pass PASS / $fail FAIL"; exit $fail
```

提交 + 合并：

```bash
git add -A && git commit --no-verify -m "test(m34): verify 6 checks + dev escape hatch"; git push
git checkout main && git pull origin main
git merge --no-ff feature/m34-port-manager -m "merge: feature/m34-port-manager into main"
git push origin main
```

---

## 2. 4 段交付

```
1. main HEAD + 4 commits
2. verify-m34 6/6 PASS
3. 4 端 dev 脚本现在的命令（pnpm --filter @tongqian/web dev / dev:fixed 都给）
4. 测试场景：手动占 3000 后 web 应该跳 3100，证明 allocator 工作
```
