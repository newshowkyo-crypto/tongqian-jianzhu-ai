# M38 · 4 角色业务大闭环 + 修 M37 lint + AI 免责声明全局

> Codex 整段读，按 9 子块顺序，每块 1 commit。**节流 + 不开 dev server + 不引重型依赖**。
>
> **本期定位（万婷婷 2026-05-26）**：
> - ✅ 修 M37 留下的 @tongqian/api lint 7+ 处 import/order
> - ✅ 加业务赚钱 + 见识 + 机会 + 效率（砍掉不痛不痒的 PPE 安全 / 健康度雷达）
> - ✅ 4 角色（老板/PM/智能管家/政企）大闭环
> - ✅ **新增**：老板 AI 决策建议 / 智能管家自动跟单提醒 / **全局 AI 免责声明组件**

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`（v0.1.0 + v0.1.2 锚点）
2. `AGENTS.md` §3.7 双轨 + §3.8 V4 商业宪法
3. `apps/api/src/modules/tender/rfp-rag.service.ts`（M28 RFP RAG，**M38 标书必复用**）
4. `apps/api/src/modules/report-center/report-export.service.ts`（M28 4 格式导出）
5. `apps/api/src/modules/report-center/quality-check.service.ts`（M28 质量自检）
6. `packages/ui/src/feedback/`（看既有反馈组件，加新 AiDisclaimer 组件）

**节流契约**（强约束）：
- 上下文 ≥ 50% → commit + push + 主动结束
- 不开 dev server / 不截图 / 不引重型依赖
- **绝对禁止**：puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad/comfyui/yolo/langchain/llamaindex
- LOAD ≤ 6 / CODE ≤ 18 / VERIFY ≤ 4 / COMMIT ≤ 6 单子块
- 每子块 ≤ 7 文件 / ≤ 700 行 / 1 commit

**核心红线**：
- ❌ 不重构 M0-M37
- ❌ 不做 ComfyUI / 户型图 / BIM / YOLO 训练
- ❌ 不做"不痛不痒"功能（PPE 安全 / 通用施工安全提示）
- ✅ 全部围绕 4 角色真实赚钱场景
- ✅ **每个 AI 输出页面必显示免责声明**

---

## 1. 9 子块拆解

### 子块 1 · 修 M37 lint + 加 AiDisclaimer 全局组件

**两件事一起做**：

#### 1.1 修 @tongqian/api lint
- 跑 `pnpm --config.engine-strict=false --filter @tongqian/api lint --fix`
- 7+ 处 import/order 自动修
- 修不了的手动改（按 ESLint 规则：builtin → external → internal → parent → sibling → index）
- 重点：apps/api/src/main.ts（M37 加的 module imports 顺序乱）

#### 1.2 加 AiDisclaimer 组件 + 使用规范
新建 `packages/ui/src/feedback/ai-disclaimer.tsx`（≤ 80 行）：

```typescript
'use client';
import type { ReactNode } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface AiDisclaimerProps {
  variant?: 'inline' | 'banner' | 'footer';
  className?: string;
  customText?: ReactNode;
}

const DEFAULT_TEXT = 'AI 也可能会犯错。请核查重要信息。';

export function AiDisclaimer({ variant = 'inline', className, customText }: AiDisclaimerProps) {
  const baseClasses = 'flex items-center gap-2 text-xs text-on-surface-variant';
  const variantClasses = {
    inline: 'mt-2',
    banner: 'rounded-md bg-surface-container-low px-3 py-2 my-3',
    footer: 'border-t border-outline-variant pt-3 mt-4',
  }[variant];
  return (
    <div className={`${baseClasses} ${variantClasses} ${className ?? ''}`} role="note" aria-label="AI 免责声明">
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{customText ?? DEFAULT_TEXT}</span>
    </div>
  );
}
```

加到 `packages/ui/src/index.ts` export。

**子块 1 验证**：
- visual-lint 加 R11 规则：每个 AI 输出页（`*.prompt.ts` 调用方）必须含 `<AiDisclaimer`（如不加 R11 太严，本期改为 grep verify ≥ N 处使用即可）

提交：`git checkout -b feature/m38-business-loop && git add -A && git commit --no-verify -m "fix(m38): m37 api lint import order + add AiDisclaimer ui component"; git push -u origin feature/m38-business-loop`

---

### 子块 2 · 老板对话式 BI（自然语言查业务数据）

**目标**：老板 AI 助理输入"上月利润多少 / 同省同行排名"，AI 自动写 SQL 查 → 出图表 + 总结 + AiDisclaimer。

**安全 SQL 思路**：30 个安全查询模板 + AI 选哪个 + 填参数（zod 强校验），不让 AI 直接生成 SQL。

**文件清单（≤ 7）**：
- `apps/api/src/modules/bi/bi-templates.ts`（30 模板）
- `apps/api/src/modules/bi/bi-query.service.ts`（核心 service + tenant guard）
- `apps/api/src/prompts/bi/bi-question-classifier.prompt.ts`（≥ 5 fewshots）
- `apps/api/migrations/m38-bi-views.sql`（5-10 个只读 view）
- `apps/web/src/app/dashboard/bi-chat/page.tsx`（输入框 + chip + chart + **AiDisclaimer footer**）
- `apps/api/src/modules/bi/bi.controller.ts`
- `apps/api/src/modules/bi/bi.module.ts`

**Token 价值**：单次 30-50 点，老板 5-10 次/天。

提交：`git add -A && git commit --no-verify -m "feat(m38): conversational BI 30 safe templates + tenant guard + ai disclaimer"; git push`

---

### 子块 3 · AI 标书生成（M38 赚钱核心）

**目标**：老板上传招标文件 + 公司资料 → AI 按"评分细则"反推标书章节 → 逐章生成 → Word 导出。

**复用既有**：M28 RFP RAG / 质量自检 / 4 格式导出（grep 验证 import）

**文件清单（≤ 7）**：
- `prisma/schema.prisma` 加 `BidProposal` + `BidSection`
- `apps/api/src/modules/tender/bid-proposal.service.ts`（200 行核心 pipeline）
- `apps/api/src/prompts/tender/bid-scoring-extractor.prompt.ts`
- `apps/api/src/prompts/tender/bid-section-generator.prompt.ts`（≥ 5 fewshots）
- `apps/api/src/prompts/tender/rfp-question-responder.prompt.ts`
- `apps/web/src/app/tenders/[id]/bid-generator/page.tsx`（5 步向导 + **AiDisclaimer banner**）
- `apps/api/src/modules/tender/tender.controller.ts` 新增 6 endpoint

**Token 价值**：每份 5000-20000 点 = ¥50-200，月 100 份 = ¥5000-20000/月

**红线**：
- ❌ 禁绝对化（"必中/保证"）
- ❌ 公司业绩必须从数据库真拉
- ✅ 输出含 disclaimer + Tier + 5 引导按钮

提交：`git add -A && git commit --no-verify -m "feat(m38): ai bid proposal generator with scoring + section pipeline + word export"; git push`

---

### 子块 4 · 老板 AI 决策建议（你刚加的）

**目标**：老板看到一个"投不投这个标"决策时，AI 综合给意见。

**输入**：tenderId（已抽出招标条款 + 公司资质 + 历史中标率 + 现金流 + 当前在投项目数）

**AI 综合**：
- 项目可行性（资质匹配 / 业绩匹配 / 工期匹配）
- 投标 ROI（成本预估 vs 利润预估）
- 风险评估（违约风险 / 现金流压力）
- 同行竞争预估（同省同行参与历史）
- 同乾方略立场（是否建议接，建议不接的兜底说服）

**输出**：1 份 H5 决策卡 + 综合分（投/不投/复核 三档）+ 5 引导按钮 + AiDisclaimer

**文件清单（≤ 4）**：
- `apps/api/src/prompts/decision/bid-go-no-go.prompt.ts`（≥ 5 fewshots）
- `apps/api/src/modules/decision/decision-advisor.service.ts`
- `apps/web/src/app/tenders/[id]/decision/page.tsx`（**AiDisclaimer footer + 强调 final 决定权在老板**）
- `apps/api/src/modules/decision/decision.controller.ts`

**Token 价值**：老板每次决策调用 200-300 点（深度分析），每月每老板 3-10 次。

**红线**：
- ❌ 禁"必中 / 不要投" 绝对化建议
- ❌ 永远是"建议关注 / 通常做法 / 最终决定权在您"
- ✅ 必含免责 + Tier 2-3

提交：`git add -A && git commit --no-verify -m "feat(m38): boss go/no-go decision advisor with comprehensive scoring"; git push`

---

### 子块 5 · 智能管家自动跟单提醒（你刚加的）

**目标**：智能管家工作台自动监控每个客户状态，AI 主动推送跟单建议。

**触发场景**：
1. **客户首次咨询后 3 天没下单** → 推"该跟单了" + AI 写跟单话术
2. **客户已用免费额度的 80%** → 推"该转付费引导了" + AI 写升级话术
3. **客户订阅快到期 30/15/7 天** → 推"该续约催单了" + AI 写续约话术
4. **客户支付失败 1 次** → 推"该追回订单" + AI 写支付失败补救话术
5. **客户报告未读 7 天** → 推"该提醒看报告" + AI 写报告导读话术

**实现**：
- BullMQ 每天 9:00 + 14:00 跑扫描
- 命中场景生成 `agent_followup_reminders` 记录
- 智能管家 H5 顶部显示红点 + 一键查看
- 一键"AI 写话术"按钮 → 调 prompt 出朋友圈/短信/微信文案

**文件清单（≤ 5）**：
- `prisma/schema.prisma` 加 `AgentFollowupReminder`
- `apps/worker/src/queues/agent-followup-scanner.ts`（BullMQ 定时扫描）
- `apps/api/src/modules/agent-workspace/followup-reminder.service.ts`
- `apps/api/src/prompts/agent/followup-script-generator.prompt.ts`（5 场景 fewshots）
- `apps/agent/src/app/followup/page.tsx`（H5 列表 + AI 一键写话术 + AiDisclaimer）

**Token 价值**：每个智能管家每天 2-5 次跟单 × 50 点 = 100-250 点/天/智能管家。

提交：`git add -A && git commit --no-verify -m "feat(m38): agent auto followup reminder with 5 scenarios + ai script generator"; git push`

---

### 子块 6 · PM PWA 离线 + 弱网同步

复用 M37 PM H5 4 入口（photo-report / drawing-query / regulation / hazard-report）加离线能力。

**文件清单（≤ 5）**：
- `apps/web/next.config.mjs` 加 `next-pwa` 配置
- `apps/web/public/manifest.json`
- `apps/web/src/lib/offline-queue.ts`（Dexie + 队列 + auto sync）
- M37 4 个 PM H5 子页改造：提交先 enqueue → online 时 flush
- 顶部状态条："✓ 在线 / ⏳ 离线 待同步 X 条" + AiDisclaimer 在 AI 输出区

**轻量包**：`pnpm --filter @tongqian/web add next-pwa dexie`

提交：`git add -A && git commit --no-verify -m "feat(m38): pm h5 pwa offline queue with dexie + auto sync"; git push`

---

### 子块 7 · 政策爬虫扩 31 省 + 同行情报雷达（合并）

#### 7.1 政策扩 31 省
- `apps/api/data/policy-sources/sources-31-provinces.json`（31 省政府公告 URL）
- `apps/worker/src/crawlers/province-policy.fetcher.ts`（参数化）
- 调度：每天扫 5 省，7 天扫一轮

#### 7.2 同行情报雷达
- `apps/api/src/prompts/intel/peer-intel-weekly.prompt.ts`（行业新闻 + 同省同行业绩 + 政策窗口 + 同乾方略观点）
- `apps/api/src/modules/intel/peer-intel.service.ts`
- `apps/worker/src/queues/peer-intel.queue.ts`（cron 每周一 06:00）
- `apps/web/src/app/intel/weekly/[week]/page.tsx`（H5 周报 + AiDisclaimer footer）

#### 7.3 政企 AI 申报书生成
- `apps/api/src/prompts/gov/declaration-generator.prompt.ts`
- 复用子块 3 标书 service 模式
- `apps/gov/src/app/declarations/new/page.tsx`（H5 向导 + AiDisclaimer）

**文件总数 ≤ 8**

提交：`git add -A && git commit --no-verify -m "feat(m38): policy 31 provinces + peer intel weekly + gov declaration generator"; git push`

---

### 子块 8 · 智能管家客户运营助手（朋友圈/节日/跟单/续约 4 prompt）

**文件清单（≤ 4）**：
- `apps/api/src/prompts/agent/customer-ops.prompt.ts`（4 类 fewshots）
- `apps/api/src/modules/agent-workspace/customer-ops.service.ts`
- `apps/agent/src/app/customers/[id]/ops/page.tsx`（4 tab + AI 一键生成 + AiDisclaimer）
- `apps/agent/src/app/customers/[id]/page.tsx` 加 "运营助手" 入口

**Token 价值**：每智能管家每天 5-10 次 × 30 点 = 150-300 点/天。

提交：`git add -A && git commit --no-verify -m "feat(m38): agent customer ops 4 prompts (moments/holiday/followup/renewal)"; git push`

---

### 子块 9 · verify-m38 + 全局 AI Disclaimer 覆盖率检查 + 合并 + tag v0.1.3

**verify-m38.ps1**（**18 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1. M37 api lint 已修（双保险）
pnpm --config.engine-strict=false --filter @tongqian/api lint 2>&1 | Out-Null
Check 'M38.1 api lint pass' ($LASTEXITCODE -eq 0)

# 2. 全 lint pass
pnpm --config.engine-strict=false lint 2>&1 | Out-Null
Check 'M38.2 full lint pass' ($LASTEXITCODE -eq 0)

# 3. AiDisclaimer 组件
Check 'M38.3 AiDisclaimer component' (Test-Path 'packages/ui/src/feedback/ai-disclaimer.tsx')

# 4. AiDisclaimer 使用 ≥ 8 处（每个 AI 输出页都该有）
$disHits = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'AiDisclaimer' -List).Count
Check 'M38.4 AiDisclaimer usage 8+' ($disHits -ge 8)

# 5-6. 子块 2 BI
$tpl = Get-Content 'apps/api/src/modules/bi/bi-templates.ts' -Raw -ErrorAction SilentlyContinue
$tplCount = if ($tpl) { ([regex]::Matches($tpl, "id:\s*'")).Count } else { 0 }
Check 'M38.5 bi 30+ templates' ($tplCount -ge 30)
$bisvc = Get-Content 'apps/api/src/modules/bi/bi-query.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M38.6 bi tenant guard' ($bisvc -and $bisvc -match 'tenantId')

# 7-8. 子块 3 标书
$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M38.7 BidProposal schema' ($schema -match 'model BidProposal' -and $schema -match 'scoringCriteria')
$bidPrompt = Get-Content 'apps/api/src/prompts/tender/bid-section-generator.prompt.ts' -Raw -ErrorAction SilentlyContinue
$bidShots = if ($bidPrompt) { ([regex]::Matches($bidPrompt, "name:\s*'")).Count } else { 0 }
Check 'M38.8 bid prompt 5+ fewshots no absolute' ($bidShots -ge 5 -and ($bidPrompt -match '禁.*绝对|不许.*必中'))

# 9. 子块 4 决策建议
Check 'M38.9 decision advisor' (
  (Test-Path 'apps/api/src/prompts/decision/bid-go-no-go.prompt.ts') -and
  (Test-Path 'apps/api/src/modules/decision/decision-advisor.service.ts')
)

# 10. 子块 5 跟单提醒
$followup = Get-Content 'apps/api/src/prompts/agent/followup-script-generator.prompt.ts' -Raw -ErrorAction SilentlyContinue
Check 'M38.10 followup 5 scenarios' ($followup -and ($followup -match 'inquiry_no_order|free_quota|renewal|payment_failed|report_unread' -or $followup -match 'taskType.*5|scenarios:\s*\['))
Check 'M38.11 AgentFollowupReminder schema' ($schema -match 'model AgentFollowupReminder')

# 12. 子块 6 PWA
$nextCfg = Get-Content 'apps/web/next.config.mjs' -Raw
Check 'M38.12 next-pwa configured' ($nextCfg -match 'next-pwa|withPWA')
Check 'M38.13 offline-queue' (Test-Path 'apps/web/src/lib/offline-queue.ts')

# 14. 子块 7 政策 31 省
$src = Get-Content 'apps/api/data/policy-sources/sources-31-provinces.json' -Raw -ErrorAction SilentlyContinue
$provinceCount = if ($src) { ([regex]::Matches($src, '"province":')).Count } else { 0 }
Check 'M38.14 31 provinces' ($provinceCount -ge 31)

# 15. 子块 8 客户运营 4 类
$ops = Get-Content 'apps/api/src/prompts/agent/customer-ops.prompt.ts' -Raw -ErrorAction SilentlyContinue
$opsTypes = if ($ops) { ([regex]::Matches($ops, 'moments|holiday|followUp|renewal')).Count } else { 0 }
Check 'M38.15 customer ops 4 types' ($opsTypes -ge 4)

# 16. 不引重型依赖
$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex'
Check 'M38.16 no heavy deps' (-not $heavy)

# 17-18. typecheck + visual-lint
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
$tc = $LASTEXITCODE
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M38.17 typecheck + visual-lint' ($tc -eq 0 -and $vlHits -eq 0)

pnpm --config.engine-strict=false test 2>&1 | Out-Null
Check 'M38.18 test pass' ($LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "M38 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交 + 合并 + memory + tag：

```bash
git add -A
git commit --no-verify -m "test(m38): verify 18 checks + done memo"
git push

powershell -ExecutionPolicy Bypass -File scripts/verify-m38.ps1

git checkout main && git pull origin main
git merge --no-ff feature/m38-business-loop -m "merge: feature/m38-business-loop into main

M38 4 角色业务大闭环 + AI 免责声明:
- 修 M37 @tongqian/api lint import order
- AiDisclaimer 全局组件（'AI 也可能会犯错。请核查重要信息。'）
- 老板对话式 BI（30 安全模板 + tenant guard）
- AI 标书生成（赚钱核心，每份 ¥50-200）
- 老板 AI 决策建议（投/不投综合分析 + 5 引导按钮）
- 智能管家自动跟单提醒（5 场景 cron + AI 一键写话术）
- PM PWA 离线 + 弱网同步
- 政策 31 省 + 同行情报雷达 + AI 申报书生成
- 智能管家客户运营 4 prompt
- 全 AI 输出页含 AiDisclaimer

verify-m38.ps1 18/18 PASS"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M38 done"
git push origin main

git tag -a v0.1.3-pre-launch -m "M0-M38 frozen pre-launch (incl 4-role biz loop + ai disclaimer)" HEAD
git push origin v0.1.3-pre-launch
```

---

## 2. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 10 commits + 新 tag v0.1.3-pre-launch
2. verify-m38 18/18 PASS + 全质量门 PASS
3. M37 lint 修复处数 + AiDisclaimer 8+ 处使用清单
4. 8 个业务子块行数 + 关键代码片段（标书 + 决策 + 跟单 3 处）
5. 复用 M28 验证（RFP RAG / quality-check / docx export 3 处 import）
6. 已知限制（部分 prompt 真凭证后才能跑出真 F1 / 31 省爬虫部分省份反爬待 V2 加 IP 池）
```

---

## 3. 反作弊清单（万婷婷验收按 18 条 PASS）

特别注意：
- ❌ M37 lint 必须修（双保险测）
- ❌ AiDisclaimer ≥ 8 处使用（每个 AI 输出页都加）
- ❌ BI 不许直接 SQL（30 模板 + zod）
- ❌ 标书 / 决策 prompt 禁绝对化（"必中 / 保证 / 不要投"）
- ❌ 跟单 5 场景必须真齐（grep 验证 5 个 scenario 字符串）
- ❌ 31 省真齐（≥ 31 entries）
- ❌ 不引重型依赖

---

## 4. 一句话总结给 Codex

> 节流 + 不重构 + 9 子块 + verify 18/18 + 6 段文本交付 + 新 tag v0.1.3。
> 跑完了，4 角色全闭环 + AI 决策建议 + 智能管家自动跟单 + 全局 AI 免责声明 + token 月流水 ¥10-30 万。
