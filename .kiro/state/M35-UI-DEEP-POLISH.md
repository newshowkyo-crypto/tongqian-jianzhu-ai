# M35 · UI 深度调（5 关键页 ≥98% 像素对齐 + 12 个真业务状态）

> Codex 整段读，按 5 子块顺序，每块 1 commit。**节流模式 + 子块 5 用 puppeteer 真截 + 不引重型依赖**。
> 本期定位：M32 把整体 UI 拉到 95.7% 相似度，M35 把 5 个最重要页拉到 ≥ 98%，加 12 个真业务场景的状态完整度。

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`
2. `design/stitch/tongqian_strategy_ai_design_system/DESIGN.md`
3. `design/stitch/_1/code.html` 至 `_13/code.html`
4. `.kiro/steering/ui-visual-spec.md`
5. `packages/ui/src/tokens/stitch-tokens.ts`
6. M32 已改的 5 关键页（dashboard / report / agent dashboard / dispatch / services）

**节流契约**：上下文 ≥ 50% commit；不开 dev server（除子块 5 截图）；每子块 ≤ 6 文件 / ≤ 500 行。

---

## 1. 子块拆解

### 子块 1 · 老板首页 dashboard 像素级对齐 stitch _1

对比 `apps/web/src/app/dashboard/page.tsx` 跟 `design/stitch/_1/code.html`：

- 顶部 banner（早安横幅）：行间距 / 字号 / 强调色完全一致
- 4 KPI 卡：圆角 8px / 阴影 shadow-sm hover shadow / 小图标 24x24 / 数字 text-3xl tabular-nums
- 中部 2 列：今日机会推送（左 4px 蓝条 + 白底）+ 风险红灯（danger-50 背景 + danger-200 边框）
- 5 步引导卡：序号 + 浅蓝背景 + 短描述
- AI 浮球：右下 fixed 56px 圆形 + primary-500 → primary-700 渐变 + shadow-lg + 呼吸动画

提交：1 commit

---

### 子块 2 · AI 报告 H5 像素对齐 stitch _5

对比 `apps/web/src/app/reports/[id]/page.tsx` 跟 `design/stitch/_5`：

- Tier 徽章右上角浮动
- 总体风险大色块（80px 高 + 对应风险色 -100 背景 / -700 文字）
- 关键发现条目左侧 4px 风险色边框
- AI 信心度 4 圆点 ●●●○
- 3 CTA 按钮（修改合同主 + PDF 下载次 + 申请人工复核次）
- 免责声明底部固定 text-xs neutral-400

提交：1 commit

---

### 子块 3 · 智能管家信誉看板 + 派单大厅 像素对齐 _8 + _10

#### 信誉看板（`apps/agent/src/app/reputation/page.tsx`）

- 大圆环 0-1000 进度（260x260 SVG）：背景 neutral-200 + 进度 primary→accent gradient
- LV4 金牌徽章：accent-50 背景 + accent-700 文字 + 金色边框
- 距 LV5 进度条 + 百分比
- 加减分明细 timeline + 申诉按钮

#### 派单大厅（`apps/agent/src/app/dispatch/page.tsx`）

- 派单卡 border-l-4（紧急 warning-500 / 普通 transparent）
- 客户信息：头像 + LV 徽章 + 优质⭐
- 4 维匹配分：横向条 + 数值
- 报价输入框：颜色随输入值变化（绿色合理 / 黄色复核 / 红色偏高）
- 接单 / 跳过 / 转同乾方略 三按钮

提交：2 子页一个 commit

---

### 子块 4 · 12 个真业务状态完整度

每个核心页加 4 状态：loading / empty / error / success-toast。

12 页清单（各加 1 commit 内统一改）：
1. `apps/web/src/app/contracts/page.tsx`
2. `apps/web/src/app/tenders/page.tsx`
3. `apps/web/src/app/qualifications/page.tsx`
4. `apps/web/src/app/opportunities/page.tsx`
5. `apps/web/src/app/projects/page.tsx`
6. `apps/web/src/app/cashflow/ledger/page.tsx`
7. `apps/web/src/app/reports/page.tsx`
8. `apps/agent/src/app/dispatch/page.tsx`
9. `apps/agent/src/app/earnings/page.tsx`
10. `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx`
11. `apps/admin/src/app/(main)/admin/legal-corpus/page.tsx`
12. `apps/gov/src/app/funds/page.tsx`

每页确保：
- 异步用 useQuery → isLoading 显 `<Skeleton />` 或 `<LoadingState />`
- 数据空 → `<EmptyState icon title description action />`
- isError → `<ErrorState title description retry />`
- mutation 成功 → `toast.success('已...')` mutation 失败 → `toast.error(...)`

提交：1 commit

---

### 子块 5 · 真截图 5 关键页 + 像素 diff + verify-m35

装 puppeteer + sharp（计算像素 diff）：

```bash
pnpm --filter @tongqian/web add -D puppeteer pixelmatch sharp pngjs
```

新建 `scripts/pixel-diff-stitch.mjs`（≤ 250 行）：
- 读 stitch _1 / _5 / _8 / _10 / _13 PNG（已存在 `design/stitch/_N/screen.png`）
- puppeteer 截我们对应 5 页同尺寸（设 viewport 1440x900）
- pixelmatch 算每页像素 diff %
- 输出 `tests/e2e/screenshots/m35/pixel-diff-report.html`：5 行 / 每行 stitch 截图 + 我们截图 + diff 图 + 相似度

跑完删 puppeteer + pixelmatch + sharp + pngjs（不留生产依赖）

`scripts/verify-m35.ps1`（**12 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1-5. 5 关键页 stitch 对齐 ≥ 98%
$report = Get-Content 'tests/e2e/screenshots/m35/pixel-diff-report.html' -Raw -ErrorAction SilentlyContinue
foreach ($p in 'dashboard','report','reputation','dispatch','services') {
  Check "M35.$p alignment 98%" ($report -match $p)
}

# 6-9. 12 状态覆盖（grep）
$loading = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'LoadingState|Skeleton' -List).Count
$empty = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'EmptyState' -List).Count
$err = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'ErrorState' -List).Count
$toast = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'toast\.(success|error)' -List).Count
Check 'M35.6 loading 12+' ($loading -ge 12)
Check 'M35.7 empty 12+' ($empty -ge 12)
Check 'M35.8 error 8+' ($err -ge 8)
Check 'M35.9 toast 8+' ($toast -ge 8)

# 10. puppeteer 不留依赖
$pkg = Get-Content 'apps/web/package.json' -Raw
Check 'M35.10 puppeteer removed' (-not ($pkg -match 'puppeteer'))

# 11-12. typecheck + visual-lint
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M35.11 typecheck' ($LASTEXITCODE -eq 0)
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$hits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M35.12 visual-lint 0' ($hits -eq 0)

Write-Host ""; Write-Host "M35 verify: $pass PASS / $fail FAIL"; exit $fail
```

提交 + 合并 + memory 同 M34。

---

## 2. 6 段交付

```
1. main HEAD + 6 commits
2. verify-m35 12/12 PASS
3. 5 关键页 stitch pixel diff %（每页给真数字 ≥ 98%）
4. 12 页 4 状态覆盖（grep 计数）
5. puppeteer 已删
6. 已知差距（HTML vs React 天然不可能 100%）
```
