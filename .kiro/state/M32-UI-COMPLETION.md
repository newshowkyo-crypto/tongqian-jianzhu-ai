# M32 · 全量 UI 完工对齐 stitch（4 端 + M28-M30 新页全部覆盖）

> Codex 一段读完，按 6 子块顺序执行，每块 1 commit。**节流模式 + 不开 dev server + 不截图（除非 tier 5 压测）+ 不引重型依赖**。
> 本期定位：**让所有页面 UI 一致到 stitch 设计稿水准，做完后只缺真实凭证**。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文
2. `design/stitch/tongqian_strategy_ai_design_system/DESIGN.md` 全文（**这是唯一真理来源**）
3. `design/stitch/_1/code.html` 至 `_13/code.html`（13 套设计稿，每套 ≤ 80 行）
4. `.kiro/steering/ui-visual-spec.md` 全文
5. `.kiro/steering/ui-ux-rules.md` 全文
6. `apps/web/src/app/globals.css`（看现有 CSS variable）
7. `packages/ui/tailwind.config.ts` + 4 端各自 tailwind.config.ts
8. `scripts/visual-lint.mjs`（看 R1-R8 规则）

**节流契约**（强约束）：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- **不开 dev server / 不真跑 next build / 不截图（最后子块 6 才截 5 张关键页）**
- 不引任何 UI 库（shadcn/ui + Tailwind 已够，禁 antd/element/mui/chakra）
- LOAD ≤ 6 / CODE ≤ 18 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 8 文件 / ≤ 600 行 / 1 commit

**核心红线**：
- ❌ 不动业务逻辑（service / controller / schema 一律不动）
- ❌ 不删任何既有页面
- ❌ 不引重型依赖（puppeteer 截图除外，只在子块 6 用一次）
- ✅ 只改 className / 加 token / 替换 hex 为 token / 修排版
- ✅ 4 端共用 stitch design system

---

## 1. 总目标

| 项 | M31 后 | M32 目标 |
|---|---|---|
| stitch token 注册 | 部分（CSS variable）| **packages/ui/tokens 完整注册 + 4 端 tailwind.config 共用** |
| 老板端（apps/web）123+ 页 | 部分用 token | 100% 用 token，每页有 PageHeader + EmptyState + LoadingState + ErrorState |
| admin 端 82 页 | 部分用 token | 100% 用 token + 表格密度统一 |
| agent 端 24 页 | 部分用 token | 100% 用 token + 工作台 vibrant（金色徽章为主） |
| gov 端 17 页 | 部分用 token | 100% 用 token + 严肃（深蓝加深 + 移除金色） |
| visual-lint | 0 violations（M31 已修） | 持续 0 |
| 关键 5 页跟 stitch 像素对比 | — | ≥ 90% 一致 |

---

## 2. 子块拆解（6 子块 × 1 commit）

### 子块 1 · packages/ui 注册 stitch design system 完整 token

**目标**：把 stitch 的 50+ 颜色 token + 8 字号 + 8 间距 + 5 圆角 + 3 阴影全部注册到 `packages/ui`，4 端 tailwind.config.ts 共用。

**文件清单（≤ 5）**：

- `packages/ui/src/tokens/stitch-tokens.ts`（新建 ≤ 150 行）：
  - 完整对应 `design/stitch/.../DESIGN.md` 的 colors / typography / spacing / rounded
  - export `stitchColors / stitchTypography / stitchSpacing / stitchRounded`

- `packages/ui/src/tokens/stitch-css.ts`（新建 ≤ 100 行）：
  - 把 stitch token 转成 CSS variable 字符串（`:root { --surface: #f9f9ff; ... }`）
  - 同时输出 `.dark { ... }` 暗色 fallback

- `packages/ui/tailwind.config.ts`：
  - 引入 stitchColors → 注册到 theme.extend.colors
  - 注册 fontSize / spacing / borderRadius

- `apps/web/tailwind.config.ts` + `apps/admin` + `apps/agent` + `apps/gov` 4 个：
  - 全部 import `packages/ui/src/tokens/stitch-tokens.ts` 共用
  - **agent 端**：accent-color 改成 stitch 的 `tertiary-container: #a14800`（暖金，激励调）
  - **gov 端**：移除金色 token，accent 改成 stitch 的 `primary: #00479b`（深蓝加深）

- `apps/web/src/app/globals.css` + 其他 3 端 globals.css：
  - 引入 `@import '../../packages/ui/dist/stitch-css.css'`（或直接 inline 50 行 CSS variable）

**反作弊**：
- ❌ 不许 hardcode 任何 hex
- ❌ 不许在业务页面定义 token

提交：`git checkout -b feature/m32-ui-completion && git add -A && git commit --no-verify -m "feat(m32): register stitch design system tokens to packages/ui + 4 apps"; git push -u origin feature/m32-ui-completion`

---

### 子块 2 · 老板端（apps/web）页面 100% token 化

**目标**：apps/web 全部页面（含 M14-M22 + M28-M30 新加 8 页）改造完。

**改造清单**：

- 用 grep 找 `bg-\[#[0-9a-f]{6}\]` 全部替换成 token
- 用 grep 找 `text-\[#[0-9a-f]{6}\]` 全部替换成 token
- 用 grep 找 `border-\[#[0-9a-f]{6}\]` 全部替换成 token
- 重点改造（M28-M30 新加，已被 M31 部分修过的）：
  - `apps/web/src/app/projects/[id]/schedule/page.tsx`（甘特图）
  - `apps/web/src/app/projects/[id]/tasks/page.tsx`（task 看板）
  - `apps/web/src/app/projects/[id]/changes-claims/page.tsx`（变更签证）
  - `apps/web/src/app/projects/[id]/carbon/page.tsx`（碳排放）
  - `apps/web/src/app/projects/[id]/briefings/page.tsx`（安全交底）
  - `apps/web/src/app/cost-estimates/budget/page.tsx`（概算）
  - `apps/web/src/app/cost-estimates/rough-quantity/page.tsx`（粗算量）
  - `apps/web/src/app/cost-estimates/[id]/historical-compare/page.tsx`（历史对比）
  - `apps/web/src/app/cashflow/ledger/page.tsx`（进度款台账）
  - `apps/web/src/app/customer-dd/page.tsx`（客户尽调）
  - `apps/web/src/app/tenders/[id]/rfp-analysis/page.tsx`（RFP 分析）

- 每个页面强制三件事：
  1. 顶部 `<PageHeader title="..." description="..." breadcrumbs={[...]} actions={...} />`
  2. 列表 / 卡片 用 `<SectionCard>`（packages/ui 既有）
  3. 异步状态有 `<LoadingState />` / `<EmptyState />` / `<ErrorState />`

**反作弊**：
- ❌ visual-lint 必须 0 违规
- ❌ 任何页面顶部必须有 PageHeader（grep 验证）

提交：`git add -A && git commit --no-verify -m "feat(m32): web app 100% stitch token + pageheader/loading/empty/error consistency"; git push`

---

### 子块 3 · admin 端 100% token 化

**目标**：apps/admin 82 页全部改造。

**重点 M24-M30 新加的 admin 页**：

- `apps/admin/src/app/(main)/admin/credentials/page.tsx`（M24）
- `apps/admin/src/app/(main)/admin/onboarding/page.tsx` + 子页（M24）
- `apps/admin/src/app/(main)/admin/legal-corpus/page.tsx` + `[id]/page.tsx`（M27）
- `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx` + `[id]/page.tsx`（M27）
- `apps/admin/src/app/(main)/admin/baseline-cost/page.tsx`（M30，如有）

**admin 特殊要求**（按 stitch design system §"Variants" 的 Conservative 风格）：
- 表格行高 40-48px（密度高）
- 字号 12-14px（信息密度）
- 全 1px 边框 + 无阴影（Level 1）
- hover 才显 shadow-sm

提交：`git add -A && git commit --no-verify -m "feat(m32): admin 82 pages stitch token + conservative density"; git push`

---

### 子块 4 · agent + gov 端 token 化（差异化主题）

**目标**：agent 24 页 + gov 17 页改造。

**agent 端特殊**（激励 + 清爽）：
- 主色不变（primary: #1e5fbf）
- accent 加暖金 `#d99880`（rose-gold）+ 紫色（LV5 钻石管家专属）
- 顶部用 vibrant gradient header（金色 → 深蓝）
- 信誉看板用大字 + 圆环（design/stitch/_8 那种）

**gov 端特殊**（庄重 + 保守）：
- 主色改 stitch 的 `primary: #00479b`（深蓝加深）
- **完全移除金色**（红线，§AGENTS.md §3.7）
- 字号 +1 档（老干部友好：14px → 16px 默认）
- 加红色装饰条（顶部 banner 4px 红线）
- 不用 emoji 不用渐变

**4 端 navigation 共用**：用 stitch design system §Components / Buttons / Cards 标准

提交：`git add -A && git commit --no-verify -m "feat(m32): agent vibrant + gov conservative theme variants"; git push`

---

### 子块 5 · 关键 5 页对齐 stitch 像素级

**目标**：选 5 个最重要页跟 stitch 设计稿做像素对齐。

**5 页对照表**：

| stitch 编号 | 我们的页 | 对齐目标 |
|---|---|---|
| `_1` 老板首页 | `apps/web/src/app/dashboard/page.tsx` | 顶部 4 KPI 卡 + 中部 2 列（机会推送 + 风险红灯）+ AI 助理浮球 |
| `_5` AI 报告 H5 | `apps/web/src/app/reports/[id]/page.tsx` | 总体风险大色块 + 关键发现红黄绿 + 3 CTA + 信心度 + 免责声明 |
| `_8` 智能管家信誉看板 | `apps/agent/src/app/dashboard/page.tsx` | 大圆环进度（0-1000 信誉分）+ LV 徽章 + 加减分明细 |
| `_10` 派单大厅卡片 | `apps/agent/src/app/dispatch/page.tsx` | 派单卡 + 客户头像 + 报价输入框 + 颜色提示 + 接单按钮 |
| `_13` 服务货架 | `apps/web/src/app/services/page.tsx`（如无则新建） | 10 张服务卡片 3 列网格 + 金色价格 + 咨询预约按钮 |

**操作**：

1. 对每页 webFetch / 读 stitch HTML，对照排版 + 间距 + 颜色 + 字号
2. 改我们的对应页面，组件复用 packages/ui
3. 不要求 100% 像素一致（HTML 元素跟 React 组件天然差异），但**视觉感受 ≥ 90% 一致**
4. 改完后用 `node scripts/visual-lint.mjs` 确保 0 违规

提交：`git add -A && git commit --no-verify -m "feat(m32): 5 key pages pixel-align with stitch _1/_5/_8/_10/_13"; git push`

---

### 子块 6 · 全量截图自检 + verify-m32

**目标**：用 puppeteer 跑一次全量截图，跟 stitch 对比，写报告。

**操作**：

- **本子块允许引 puppeteer**（仅这一次截图用，不留生产依赖）：
  ```bash
  pnpm --filter @tongqian/web add -D puppeteer
  ```

- 新建 `scripts/screenshot-all.mjs`（≤ 200 行）：
  - 启动 next dev（**例外**：本子块允许）
  - 用 puppeteer 跑 5 个关键页 → 截图存 `tests/e2e/screenshots/m32/{page-name}.png`
  - 同时拉 stitch html 截图存 `tests/e2e/screenshots/m32/stitch-{n}.png`
  - 生成对比 HTML `tests/e2e/screenshots/m32/comparison.html`
  - 跑完后 `kill` next dev + 删 puppeteer（commit 不留依赖）

- 新建 `scripts/verify-m32.ps1`（**14 条 PASS/FAIL**）：
  ```powershell
  $ErrorActionPreference = 'Stop'
  $pass = 0; $fail = 0
  function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }
  
  # 1. stitch tokens 注册
  $tokens = Get-Content 'packages/ui/src/tokens/stitch-tokens.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M32.1 stitch tokens file' ($tokens -and $tokens -match 'surface-container' -and $tokens -match 'primary-fixed')
  
  # 2. 4 端 tailwind.config import 共用 token
  $count = 0
  foreach ($app in 'web','admin','agent','gov') {
    $cfg = Get-Content "apps/$app/tailwind.config.ts" -Raw -ErrorAction SilentlyContinue
    if ($cfg -and ($cfg -match 'stitch-tokens' -or $cfg -match 'stitchColors')) { $count++ }
  }
  Check 'M32.2 4 apps share tokens' ($count -eq 4)
  
  # 3. visual-lint 持续 0 violations
  $vl = node scripts/visual-lint.mjs 2>&1 | Out-String
  $hits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
  Check 'M32.3 visual-lint 0 violations' ($hits -eq 0)
  
  # 4. 全仓 hex hardcode = 0（业务代码）
  $hex = (Get-ChildItem apps/*/src -Recurse -Include *.tsx,*.ts | Select-String 'bg-\[#|text-\[#|border-\[#').Count
  Check 'M32.4 zero hex hardcode' ($hex -eq 0)
  
  # 5. 4 端关键页面有 PageHeader
  $pageHeaderHits = (Get-ChildItem apps/*/src/app -Recurse -Filter page.tsx | Select-String 'PageHeader' -List).Count
  Check 'M32.5 PageHeader 50+ usage' ($pageHeaderHits -ge 50)
  
  # 6. EmptyState / LoadingState / ErrorState 各 ≥ 5 处使用
  $es = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'EmptyState' -List).Count
  $ls = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'LoadingState|Skeleton' -List).Count
  $err = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'ErrorState' -List).Count
  Check 'M32.6 empty/loading/error states' ($es -ge 5 -and $ls -ge 5 -and $err -ge 3)
  
  # 7. agent 端用 rose-gold accent
  $agentTw = Get-Content 'apps/agent/tailwind.config.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M32.7 agent rose-gold accent' ($agentTw -match 'rose|d99880|d4953a')
  
  # 8. gov 端无金色（红线）
  $govSrc = Get-ChildItem 'apps/gov/src' -Recurse -Include *.tsx | Select-String 'rose-gold|d99880|accent-gold' -List
  Check 'M32.8 gov no gold' ($govSrc.Count -eq 0)
  
  # 9. 5 个对齐截图
  $shots = (Get-ChildItem 'tests/e2e/screenshots/m32' -Filter *.png -ErrorAction SilentlyContinue).Count
  Check 'M32.9 5+ screenshots' ($shots -ge 5)
  
  # 10. comparison.html 存在
  Check 'M32.10 comparison.html' (Test-Path 'tests/e2e/screenshots/m32/comparison.html')
  
  # 11. puppeteer 已删（不留生产依赖）
  $pkg = Get-Content 'apps/web/package.json' -Raw
  Check 'M32.11 puppeteer not in deps' (-not ($pkg -match 'puppeteer'))
  
  # 12. typecheck
  pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
  Check 'M32.12 typecheck' ($LASTEXITCODE -eq 0)
  
  # 13. lint
  pnpm --config.engine-strict=false lint 2>&1 | Out-Null
  Check 'M32.13 lint' ($LASTEXITCODE -eq 0)
  
  # 14. test
  pnpm --config.engine-strict=false test 2>&1 | Out-Null
  Check 'M32.14 test' ($LASTEXITCODE -eq 0)
  
  Write-Host ""
  Write-Host "M32 verify: $pass PASS / $fail FAIL"
  exit $fail
  ```

- `.kiro/state/M32-UI-COMPLETION-DONE.md`：HEAD + verify 输出 + 5 截图链接 + 像素对比相似度评分

提交：

```bash
git add -A
git commit --no-verify -m "test(m32): screenshot-all + verify-m32 + done memo"
git push

# 全套验证
powershell -ExecutionPolicy Bypass -File scripts/verify-m32.ps1
pnpm --config.engine-strict=false typecheck
pnpm --config.engine-strict=false lint
pnpm --config.engine-strict=false test
node scripts/visual-lint.mjs

# 14/14 PASS 才合并
git checkout main
git pull origin main
git merge --no-ff feature/m32-ui-completion -m "merge: feature/m32-ui-completion into main

M32 全量 UI 完工对齐 stitch:
- packages/ui 注册 stitch design system 完整 token（50+ 颜色 / 8 字号 / 8 间距 / 5 圆角）
- 4 端 tailwind.config.ts 共用 token
- apps/web 100% token 化（123+ 页面）
- apps/admin 82 页 conservative 密度风格
- apps/agent vibrant + 金色 + 紫色（钻石管家）
- apps/gov 严肃（深蓝加深 + 移除金色 + 字号 +1 档）
- 5 个关键页（dashboard / report / agent dashboard / dispatch / services）跟 stitch 像素对齐 ≥ 90%
- 截图自检 + comparison.html
- visual-lint 持续 0 violations
- verify-m32.ps1 14/14 PASS

ref: .kiro/state/M32-UI-COMPLETION.md"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M32 done - UI completion to stitch level"
git push origin main
```

---

## 3. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 8 commits
2. verify-m32.ps1 输出（14/14 PASS）+ visual-lint 0 violations + lint/typecheck/test 全过
3. 5 个截图相似度评分（每页跟 stitch 像素对比 ≥ 90%）
4. 4 端主题差异化落地点：web 标准 / admin conservative / agent vibrant / gov 严肃
5. token 化覆盖：apps/web 多少页 / admin 多少页 / agent 多少页 / gov 多少页
6. 已知差距（如 stitch 是 HTML 我们是 React 组件，天然不可能 100% 一致）
```

---

## 4. 反作弊清单 14 条

跟 verify-m32 14 条对应。特别注意：
- ❌ hex hardcode 必须 0（grep `bg-\[#|text-\[#|border-\[#`）
- ❌ gov 端不能有任何金色（红线）
- ❌ puppeteer 必须删（不留生产依赖）
- ❌ visual-lint 必须 0 违规
- ❌ 业务逻辑 service / controller 一行不动
- ❌ 不删任何既有页面

---

## 5. 一句话总结给 Codex

> 节流模式 + 不开 dev server（除子块 6 puppeteer 截图）+ 6 子块 1 commit/块 + verify 14/14 + 6 段文本交付。
> 跑完了，4 端 200+ 页面全部统一到 stitch 设计稿水准，万婷婷打开任何一个页面看着都一致专业。**只缺真实凭证就能上线**。
