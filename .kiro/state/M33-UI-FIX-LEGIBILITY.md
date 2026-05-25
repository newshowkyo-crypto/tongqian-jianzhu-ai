# M33 · 紧急修复 UI 可读性 + agent 端乱码

> Codex 整段读，按 4 子块顺序执行，每子块 1 commit。**节流 + 不开 dev server（除子块 4 截图自检）+ 不引重型依赖**。
>
> **本期是紧急修复**，万婷婷反馈截图发现 2 大问题：
> 1. 老板端顶栏 Logo / 搜索框 / 右上租户切换 字色对比度太低看不清
> 2. **智能管家端整页 ???? 乱码**（最严重，估计是 M32 主题切换破坏 i18n 或字体加载）

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文
2. `.kiro/state/M32-UI-COMPLETION.md`（M32 spec，看子块 4 怎么改的 agent 端）
3. `apps/agent/src/i18n/zh-CN.ts`（i18n 文案）
4. `apps/agent/src/app/layout.tsx`（root layout 看字体加载）
5. `apps/agent/src/app-shell.tsx`（顶栏组件）
6. `packages/ui/src/cyber/cyber-shell.tsx` 或 `packages/ui/src/layout/`（共用顶栏）
7. `apps/web/src/app/layout.tsx` + `apps/web/src/app/globals.css`
8. `packages/ui/src/tokens/stitch-tokens.ts`（M32 加的）

**节流契约**：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- LOAD ≤ 6 / CODE ≤ 14 / VERIFY ≤ 4 / COMMIT ≤ 5
- 每子块 ≤ 6 文件 / ≤ 400 行 / 1 commit
- **不动业务逻辑 / 不动 schema / 不删任何页面**

---

## 1. 子块拆解（4 子块 × 1 commit）

### 子块 1 · 修 agent 端乱码（最关键）

**问题描述**：agent 3002 端整页 ???? 乱码（截图 2 显示）

**3 个可能原因 + 排查顺序**：

#### 排查 1：i18n key 丢失

```bash
# 查 zh-CN.ts 是否含 dashboard / dispatch / reputation / earnings 等关键 key
grep -E "dashboard|dispatch|reputation|earnings" apps/agent/src/i18n/zh-CN.ts
```

如果 zh-CN.ts 缺 key，是 M32 子块 4 改主题时不小心删的 → **从 web 端 zh-CN.ts 比对补全**

#### 排查 2：字体加载失败（最可能！）

agent 端 layout.tsx 可能用了 next/font 但 google font CDN 在中国大陆访问不稳，回退到一个不支持中文的字体 → 中文都成 ????

**修法**：
- 改 `apps/agent/src/app/layout.tsx`：移除 `next/font/google` 的 Inter 依赖（如有），或加 fallback
- 加 CSS `font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", Inter, Arial, sans-serif;`
- 系统优先用本地字体（PingFang SC / 微软雅黑），找不到才 fallback Inter
- 这样**永远不会 ????**（系统自带中文字体一定渲染得出来）

#### 排查 3：UTF-8 编码问题（M32 改文件时编码丢失）

```bash
# 检查 zh-CN.ts 是否还是 UTF-8
file apps/agent/src/i18n/zh-CN.ts
```

如果是 GBK / latin1 → 用 PowerShell 重新写一遍：

```powershell
$content = Get-Content apps/agent/src/i18n/zh-CN.ts -Encoding UTF8
$content | Out-File apps/agent/src/i18n/zh-CN.ts -Encoding UTF8 -NoNewline
```

**修复操作清单**（≤ 6 文件）：

1. `apps/agent/src/app/layout.tsx`：用系统字体栈 fallback Inter，**绝对不能依赖 google fonts CDN**
2. `apps/agent/src/app/globals.css`：注入字体栈
   ```css
   :root {
     --font-sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei",
                  "Hiragino Sans GB", "Inter", "Helvetica Neue", Arial, sans-serif;
   }
   html, body { font-family: var(--font-sans); }
   ```
3. `apps/agent/src/i18n/zh-CN.ts`：补全缺失的 key（参考 apps/web/src/i18n/zh-CN.ts 的结构）
4. `packages/ui/src/cyber/cyber-shell.tsx` 或顶栏组件：确保所有文案走 i18n
5. **同样检查** `apps/gov/src/app/layout.tsx` + `apps/admin` 字体栈
6. **同样检查** `apps/web/src/app/layout.tsx`（虽然 web 端没乱码，但预防 google font 不稳）

提交：`git checkout -b feature/m33-ui-fix-legibility && git add -A && git commit --no-verify -m "fix(m33): agent gibberish caused by missing i18n keys + google font fallback"; git push -u origin feature/m33-ui-fix-legibility`

---

### 子块 2 · 修 4 端顶栏 Logo + 搜索框对比度

**问题描述**：
- 截图 1 老板端 顶栏 Logo "同乾方略 / 建筑 AI 经营管家" 几乎看不清（白底白字）
- 搜索框 placeholder 灰得太淡看不清
- 右上租户切换文字色对比度低

**修法**：

1. 找到共用顶栏组件 `packages/ui/src/cyber/cyber-shell.tsx` 或 `packages/ui/src/layout/page-header.tsx`：
   - Logo 区背景：当前可能是 `bg-primary-fixed` 或 `bg-primary-container` 浅蓝
   - Logo 字色：必须 `text-on-primary-container` 或 `text-primary` 深蓝
   - 标语字色：`text-on-surface-variant` 中等灰，**WCAG 4.5:1 对比度**
   - **绝对禁止白底白字**（M32 之前也没出过这问题，是子块 4 改坏的）

2. 搜索框（截图里那个一看像空白的）：
   - placeholder 字色：`placeholder:text-on-surface-variant`（不是 `text-neutral-300`）
   - 边框：`border-outline-variant`（不是 `border-transparent`）
   - 背景：`bg-surface-container-low`（不是纯白，淡淡的灰底跟主区分开）
   - 高度：`h-10` 至少（保证 placeholder 可读）

3. 右上租户切换 + 主题按钮：
   - 字色：`text-on-surface`
   - hover 显示 `bg-surface-container-high`

**WCAG 自检公式**：
```
对比度 = (L1 + 0.05) / (L2 + 0.05)
其中 L1 是较亮颜色相对亮度，L2 是较暗颜色相对亮度
正文要求 ≥ 4.5:1
大字 (≥18px bold 或 ≥24px) 要求 ≥ 3:1
```

**操作**（≤ 5 文件）：

1. `packages/ui/src/cyber/cyber-shell.tsx`（顶栏总组件）
2. `packages/ui/src/layout/page-header.tsx`
3. `packages/ui/src/primitives/input.tsx`（搜索框基础组件）
4. `packages/ui/src/primitives/button.tsx`（顶栏按钮）
5. `apps/web/src/app-shell.tsx` + `apps/admin/src/app-shell.tsx` + `apps/agent/src/app-shell.tsx` + `apps/gov/src/app-shell.tsx`（如这些文件存在）

提交：`git add -A && git commit --no-verify -m "fix(m33): top bar logo/search/tenant contrast + wcag 4.5:1"; git push`

---

### 子块 3 · 全局字体栈 + visual-lint 加 R9 对比度规则

**目标**：彻底杜绝"白底白字"或"浅灰小字"再发生。给 visual-lint 加新规则 R9：检测低对比度组合。

**新增 visual-lint R9 规则**：

改 `scripts/visual-lint.mjs`：

```javascript
// R9: forbid low-contrast combos (white on light bg, light gray text on white)
const LOW_CONTRAST_PATTERNS = [
  // 白底白字 / 白底极浅字
  /\bbg-white\b[^"]*?\btext-white\b/,
  /\bbg-surface\b[^"]*?\btext-(?:white|surface|on-surface-variant\/30)\b/,
  // 浅灰小字（< 4.5:1）
  /\btext-(?:neutral-200|neutral-300|gray-200|gray-300)\b/,
  /\btext-white\/[0-3]0\b/, // text-white/10/20/30
  /\btext-(?:on-surface-variant)\/[0-3]0\b/,
];

for (const pattern of LOW_CONTRAST_PATTERNS) {
  // ... 标 R9 violation
}
```

**全局字体栈统一**：

`packages/ui/src/tokens/stitch-tokens.ts` 加：

```typescript
export const stitchFontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", Inter, "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", "Source Code Pro", Menlo, Consolas, monospace',
  serif: 'Georgia, "Times New Roman", "Source Han Serif", serif',
};
```

4 端 globals.css 全部 import 这个：

```css
@import '../../packages/ui/dist/stitch-fonts.css';
/* 或者直接 inline */
html, body { font-family: var(--font-sans); }
code, pre { font-family: var(--font-mono); }
```

**字体加载策略**：
- ❌ **禁用 next/font/google**（中国大陆 CDN 不稳）
- ✅ **优先用系统中文字体**（PingFang SC / Microsoft YaHei 都是系统自带）
- ✅ Inter 作为英文/数字 fallback（已通过 packages/ui 本地引入则可，否则用系统字体）

提交：`git add -A && git commit --no-verify -m "feat(m33): unified font stack + visual-lint R9 contrast rule"; git push`

---

### 子块 4 · 真截图自检（puppeteer + 4 端 dev server）+ verify-m33

**目标**：跟 M32 子块 6 不同，本子块**真跑 puppeteer 截 4 端 dashboard**，肉眼能看到没乱码 + Logo 清晰。

**操作**：

1. 装 puppeteer（仅本子块用）：
   ```bash
   pnpm --filter @tongqian/web add -D puppeteer
   ```

2. 写 `scripts/screenshot-legibility-check.mjs`（≤ 200 行）：
   - 启动 4 端 dev server（web:3000, admin:3010, agent:3011, gov:3012）
   - 等 30 秒就绪
   - 用 puppeteer headless 截 4 张：
     - `tests/e2e/screenshots/m33/web-dashboard.png`
     - `tests/e2e/screenshots/m33/admin-home.png`
     - `tests/e2e/screenshots/m33/agent-dashboard.png`
     - `tests/e2e/screenshots/m33/gov-dashboard.png`
   - 自动用 OCR 或简单 regex 检测截图标题区是否含 `???` 字样（puppeteer evaluate 拿到 DOM `document.body.innerText`）
   - 如有 ??? → 输出 FAIL + 哪个页
   - 写 `tests/e2e/screenshots/m33/legibility-report.html`：4 张图 + 是否含乱码 + Logo / 搜索框是否可见

3. 跑完 `kill` dev server + 删 puppeteer

4. `scripts/verify-m33.ps1`（**10 条**）：

```powershell
$ErrorActionPreference = 'Stop'
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }

# 1. 4 端 layout.tsx 字体栈含 PingFang SC + Microsoft YaHei
$count = 0
foreach ($app in 'web','admin','agent','gov') {
  $glob = Get-Content "apps/$app/src/app/globals.css" -Raw -ErrorAction SilentlyContinue
  if ($glob -and $glob -match 'PingFang SC|Microsoft YaHei') { $count++ }
}
Check 'M33.1 4 apps system font stack' ($count -eq 4)

# 2. 4 端 layout.tsx 不依赖 google font
$gf = 0
foreach ($app in 'web','admin','agent','gov') {
  $lay = Get-Content "apps/$app/src/app/layout.tsx" -Raw -ErrorAction SilentlyContinue
  if ($lay -and ($lay -match "next/font/google" -or $lay -match "fonts.googleapis.com")) { $gf++ }
}
Check 'M33.2 no google font dep' ($gf -eq 0)

# 3. agent zh-CN.ts 含 dashboard / dispatch / reputation 关键 key
$agentI18n = Get-Content 'apps/agent/src/i18n/zh-CN.ts' -Raw
Check 'M33.3 agent i18n complete' ($agentI18n -match 'dashboard' -and $agentI18n -match 'dispatch' -and $agentI18n -match 'reputation')

# 4. visual-lint R9 规则已加
$vl = Get-Content 'scripts/visual-lint.mjs' -Raw
Check 'M33.4 R9 contrast rule' ($vl -match 'R9' -and $vl -match 'low-contrast|LOW_CONTRAST')

# 5. visual-lint 0 violations
$vlOut = node scripts/visual-lint.mjs 2>&1 | Out-String
$hits = ($vlOut -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M33.5 visual-lint 0 violations' ($hits -eq 0)

# 6. 4 张截图存在
$shots = (Get-ChildItem 'tests/e2e/screenshots/m33' -Filter *.png -ErrorAction SilentlyContinue).Count
Check 'M33.6 4 screenshots' ($shots -ge 4)

# 7. legibility-report.html 存在
Check 'M33.7 legibility report' (Test-Path 'tests/e2e/screenshots/m33/legibility-report.html')

# 8. puppeteer 已删
$pkg = Get-Content 'apps/web/package.json' -Raw
Check 'M33.8 puppeteer removed' (-not ($pkg -match 'puppeteer'))

# 9. typecheck
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M33.9 typecheck' ($LASTEXITCODE -eq 0)

# 10. lint
pnpm --config.engine-strict=false lint 2>&1 | Out-Null
Check 'M33.10 lint' ($LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "M33 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交：

```bash
git add -A
git commit --no-verify -m "test(m33): real screenshot + verify-m33 + done memo"
git push

# 验证 + 合并
powershell -ExecutionPolicy Bypass -File scripts/verify-m33.ps1
pnpm --config.engine-strict=false typecheck
pnpm --config.engine-strict=false lint

git checkout main
git pull origin main
git merge --no-ff feature/m33-ui-fix-legibility -m "merge: feature/m33-ui-fix-legibility into main

M33 紧急修复 UI 可读性:
- 修 agent 端整页乱码（i18n + 系统字体栈 fallback）
- 修 4 端顶栏 Logo + 搜索框 + 租户切换对比度（WCAG 4.5:1）
- 全局字体栈优先 PingFang SC / Microsoft YaHei 系统字体
- 移除 google font CDN 依赖（中国大陆不稳）
- visual-lint 加 R9 低对比度规则
- 4 端真 puppeteer 截图自检 + legibility-report.html

verify-m33.ps1 10/10 PASS

ref: .kiro/state/M33-UI-FIX-LEGIBILITY.md"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M33 done - legibility fix complete"
git push origin main
```

---

## 2. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 6 commits
2. verify-m33.ps1 输出（10/10 PASS）+ visual-lint 0
3. agent 端乱码根因（i18n missing / google font CDN / 字体栈不全 三选一+具体行号）
4. 4 端顶栏 WCAG 对比度数字（每端 logo / search / tenant 各自 contrast ratio）
5. 4 张真截图地址 + legibility-report.html 内容（DOM 是否含 ??? 字样的检测结果）
6. 已知限制（如本机跑 dev server 起不来时怎么 fallback）
```

---

## 3. 反作弊清单 10 条

跟 verify-m33 对应。特别注意：
- ❌ 不许把字体栈写死在某一端（必须 4 端共用 packages/ui）
- ❌ 不许保留 next/font/google（中国大陆访问不稳）
- ❌ visual-lint R9 不许写完不启用
- ❌ 4 张截图必须真 puppeteer 截（不许假图）
- ❌ legibility-report.html 必须真检测 DOM 含 ???（不许 hardcode "PASS"）

---

## 4. 一句话总结给 Codex

> 节流模式 + 不开 dev server（除子块 4 puppeteer 一次性用）+ 4 子块 1 commit/块 + verify 10/10 + 6 段文本交付。
> 跑完了，万婷婷打开 4 端 dashboard 都能看清字 + 没乱码 + 顶栏对比度专业。
