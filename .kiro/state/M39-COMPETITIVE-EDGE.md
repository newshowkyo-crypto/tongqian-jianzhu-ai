# M39 · 5 维度竞争力 + 清账自洽（主动预测 / 任务自动化 / 语音 / 超级输入框 / 协作 / gov 简化）

> Codex 整段读，按 8 子块顺序，每块 1 commit。**节流 + 不开 dev server + 不引重型依赖**。
>
> **本期定位（万婷婷 2026-05-26）**：
> - 砍掉不痛不痒（碳排放粗算 / 复杂甘特图 / 政企采购）
> - **从"工具集"升级到"主动预测系统"**（2026 行业头部一致结论）
> - 5 维度竞争力补齐
> - 4 角色逻辑闭环干净自洽

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`（v0.1.0 + v0.1.2 + 即将的 v0.1.3 锚点）
2. `AGENTS.md` §3.7 双轨 + §3.8 V4 商业宪法
3. `.kiro/state/M37-INCREMENTS.md` + `.kiro/state/M38-INCREMENTS.md`（M37 已合并 / M38 在跑）
4. `apps/web/src/app/dashboard/page.tsx`（既有早报，本期升级）
5. `apps/api/src/modules/chat-hub/tool-registry.service.ts`（M28 17 工具，本期升级到任务自动化）

**节流契约**：
- 上下文 ≥ 50% commit + push + 主动结束
- 不开 dev server / 不截图 / 不引重型依赖
- **绝对禁止**：puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad/comfyui/yolo/langchain/llamaindex
- LOAD ≤ 6 / CODE ≤ 18 / VERIFY ≤ 4 / COMMIT ≤ 6 单子块
- 每子块 ≤ 8 文件 / ≤ 700 行 / 1 commit

**核心红线**：
- ❌ 不重构 M0-M38
- ❌ 不动既有 service / controller 业务逻辑（只增加，不改写）
- ✅ 全部 AI 输出含 AiDisclaimer（M38 子块 1 加的组件）

---

## 1. 子块拆解（7 业务 + 1 verify = 8 commits）

### 子块 1 · 清账自洽（删碳排放 + 简化甘特 + gov 简化为个人办公）

#### 1.1 删碳排放粗算（M30 子块 5）

文件清单：
- 删 `prisma/schema.prisma` 里 `model CarbonFactor` + `model CarbonEstimate`（保留 migration 可逆，写新 migration 删表）
- 删 `apps/api/src/modules/cost-estimate/carbon-estimator.service.ts`
- 删 `apps/api/src/prompts/cost/carbon-reduction.prompt.ts`
- 删 `apps/api/data/carbon-factors/seed/factors.csv`
- 删 `apps/web/src/app/projects/[id]/carbon/page.tsx`
- 改 `apps/web/src/components/sidebar.tsx` 等导航 — 移除"碳排放"入口

#### 1.2 简化数字化甘特图（M29 子块 1 + M30 子块 6 task 看板降级）

- 保留 `ProjectSchedule` + `ScheduleTask` schema（数据有用）
- 改 `apps/web/src/app/projects/[id]/schedule/page.tsx` 为简单列表（删甘特图 SVG / 拖拽 / 关键路径前端）
- 关键路径计算逻辑（`schedule.service.ts computeCriticalPath`）保留（后端 AI 用得到）
- 改 `apps/web/src/app/projects/[id]/tasks/page.tsx` 为简单列表（删 4 列拖拽看板）

#### 1.3 gov 端简化为"个人办公用户"

- 改 `apps/gov/src/app-shell.tsx` 顶部"政企 / 央国企"改"个人办公"
- 删 `apps/gov/src/app/declarations`（M37 政企申报书可在 web 端给老板用）
- 删 `apps/gov/src/app/funds`（资金匹配挪到 web 端老板侧）
- gov 端只保留：
  - 个人 dashboard
  - 个人合同审查（轻量版，去掉政企对公合规）
  - 个人资质（建造师 / 注册证书 / 个人考试政策提醒）
  - 个人 AI 助理
- 移除 `apps/gov/src/styles/globals.css` 里的"红色装饰条"（政企严肃风）改成跟 web 一致

提交：`git checkout -b feature/m39-competitive-edge && git add -A && git commit --no-verify -m "chore(m39): clean account - remove carbon + simplify gantt + gov to individual user"; git push -u origin feature/m39-competitive-edge`

---

### 子块 2 · 主动预测引擎（最大竞争力补齐）

**目标**：每天 7:30 给老板出"未来 1-4 周预警 + 主动建议"，不是被动展示。

**思路**：
- 复用既有数据：M21 现金流 / M16 资质 / M22 项目部 / M19 智能管家
- 新增"预测周期"概念：今天 / 7 天后 / 14 天后 / 30 天后 4 个时间窗
- AI 综合预测 5 件事：现金流缺口 / 资质到期 / 项目超时 / 智能管家失分 / 客户流失风险

**文件清单（≤ 7）**：

- `prisma/schema.prisma` 加 `model PredictiveAlert`：
  ```prisma
  model PredictiveAlert {
    id              String   @id @default(cuid())
    tenantId        String
    userId          String
    category        String   // cashflow_gap | qualification_expire | project_overrun | agent_score_drop | customer_churn
    timeWindow      String   // 7d | 14d | 21d | 30d
    severity        String   // info | warning | critical
    title           String
    prediction      String   @db.Text  // AI 预测内容
    actionSuggestion String  @db.Text  // 主动建议
    confidence      Float
    triggeredAt     DateTime @default(now())
    dismissedAt     DateTime?
    
    @@index([tenantId, userId, triggeredAt])
    @@map("predictive_alerts")
  }
  ```

- `apps/api/src/modules/predictive/predictive-engine.service.ts`（≤ 200 行）：
  - `runDailyPrediction(tenantId, userId)` — 每天 7:00 cron
  - 内部 5 个 predictor（cashflow / qualification / project / agent / customer）
  - 每个 predictor 调既有数据 + AI 综合 → 输出 PredictiveAlert
  - 写 audit log + 推送公众号

- `apps/api/src/prompts/predictive/predict-cashflow-gap.prompt.ts`（≤ 130 行）
- `apps/api/src/prompts/predictive/predict-overrun.prompt.ts`（≤ 130 行）
- `apps/worker/src/queues/predictive-daily.queue.ts`（cron 7:00）
- `apps/web/src/app/dashboard/page.tsx` 加"主动预警"卡（顶部第 1 卡，**优先级最高**）+ AiDisclaimer
- `apps/web/src/app/dashboard/predictions/page.tsx`（详情页，所有 alerts 列表 + 分类 + 时间筛 + AiDisclaimer footer）

**Token 价值**：每老板每天 1 次 500-1000 点 × 1000 老板 = 50-100 万点/天起步。

**反作弊**：
- ❌ 5 类预测必须真齐（grep 5 个 category 字符串）
- ❌ AI 输出禁绝对化（"必然 / 一定" 全禁）
- ❌ 必含信心度 + AiDisclaimer

提交：`git add -A && git commit --no-verify -m "feat(m39): predictive engine - 5 categories x 4 time windows daily forecast"; git push`

---

### 子块 3 · AI 任务自动化（"AI 替你干活"）

**目标**：老板说"帮我催收 90 天以上应收"→ AI 自动跑完整流程：拉名单 → 写催款函 → 多通道发 → 跟踪回款。

**思路**：
- 复用 M28 17 工具 ToolRegistry
- 新增"工作流编排"层：高层意图 → 拆成多 tool 调用 → 串行 / 并行执行 → 输出最终结果
- 不引 LangChain（用既有 ai-gateway + 简单状态机）

**5 个核心工作流**（先做这 5 个，覆盖老板高频场景）：
1. **批量催收**：拉账龄 → 写催款函 → 多通道发 → 写跟踪记录
2. **投标准备**：拉招标 → RFP RAG → 评分抽 → 大纲 → 章节生成 → Word 导出
3. **资质续期**：扫到期 → 列材料清单 → 派智能管家 → 进度跟踪
4. **客户尽调**：查公司 → 扫黑名单 → AI 综合评分 → 决策建议
5. **机会挖掘**：扫今日招标 → 4 维匹配 → AI 推荐 TOP 5 → 一键加入跟进

**文件清单（≤ 7）**：

- `prisma/schema.prisma` 加 `model Workflow` + `WorkflowStep`：
  ```prisma
  model Workflow {
    id              String   @id @default(cuid())
    tenantId        String
    userId          String
    type            String   // bulk_collection | bid_prep | qual_renew | customer_dd | opp_mining
    title           String
    status          String   @default("running")  // running | done | failed | cancelled
    intent          String   @db.Text  // 用户原话
    plan            Json     // 拆分后的步骤
    result          Json?    // 最终结果
    startedAt       DateTime @default(now())
    completedAt     DateTime?
    
    steps           WorkflowStep[]
    
    @@index([tenantId, userId, status])
    @@map("workflows")
  }
  
  model WorkflowStep {
    id              String   @id @default(cuid())
    workflowId      String
    orderIndex      Int
    toolName        String   // M28 17 工具的 name
    params          Json
    output          Json?
    status          String   // pending | running | done | failed
    errorMessage    String?
    startedAt       DateTime?
    completedAt     DateTime?
    
    workflow        Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
    
    @@index([workflowId, orderIndex])
    @@map("workflow_steps")
  }
  ```

- `apps/api/src/modules/workflow/workflow-orchestrator.service.ts`（≤ 220 行）
- `apps/api/src/prompts/workflow/intent-to-plan.prompt.ts`（≤ 150 行，把意图拆成步骤）
- 5 个 workflow template：`apps/api/src/modules/workflow/templates/{bulk-collection,bid-prep,qual-renew,customer-dd,opp-mining}.ts`
- `apps/web/src/app/workflows/page.tsx`（H5 工作流列表 + AiDisclaimer）
- `apps/web/src/app/workflows/[id]/page.tsx`（实时进度 + 步骤详情 + 取消按钮）

**Token 价值**：每次工作流 200-1500 点（看复杂度），老板 5-10 次/周。

**反作弊**：
- ❌ workflow 步骤数必须真执行（不许 mock）
- ❌ 失败必须 graceful（不许整个崩）

提交：`git add -A && git commit --no-verify -m "feat(m39): ai workflow orchestrator - 5 templates intent to multi-tool execution"; git push`

---

### 子块 4 · 语音输入全场景（垂直 AI 真热点）

**目标**：3 个场景加语音输入：
1. 老板对话式 BI（M38 子块 2）→ 加语音输入按钮
2. PM 工地报工（M37 PM H5 photo-report）→ 加语音输入按钮
3. 智能管家客户运营（M38 子块 8）→ 加语音输入按钮

**思路**：
- 浏览器原生 `Web Speech API`（SpeechRecognition）— 0 依赖 0 成本
- iOS Safari 14+ / Android Chrome 都支持
- AI 理解后调对应 prompt

**文件清单（≤ 5）**：

- `packages/ui/src/primitives/voice-input-button.tsx`（≤ 100 行通用语音按钮组件）
- `apps/web/src/app/dashboard/bi-chat/page.tsx` 改造加语音按钮
- `apps/web/src/app/m/photo-report/page.tsx` 改造加语音按钮
- `apps/agent/src/app/customers/[id]/ops/page.tsx` 改造加语音按钮
- `apps/web/src/lib/speech-recognition.ts`（封装 Web Speech API + 中文识别）

**实现注意**：
- 不真做后端语音转文字（浏览器免费做了）
- 不引 whisper / azure speech 等付费服务
- 仅在 onResult 时拿到文本 → 走既有 AI prompt

**Token 价值**：用户说话比打字快 5 倍 → 调用频率 +200%

提交：`git add -A && git commit --no-verify -m "feat(m39): voice input via web speech api in 3 scenarios"; git push`

---

### 子块 5 · 超级输入框（文字 + 图片 + 文档 + 语音 + URL 五合一）

**目标**：老板 AI 助理首页加一个超级输入框，5 种输入合一提交，AI 综合理解。

**文件清单（≤ 4）**：

- `packages/ui/src/feedback/super-input.tsx`（≤ 200 行）：
  - 文字输入区
  - 拖拽 / 粘贴 图片（用既有 OSS 上传）
  - 上传 PDF / Word / Excel
  - 语音按钮（复用子块 4）
  - 输入 URL（自动 fetch + 解析）
  - 显示已添加的多个输入项 chip
  - 一键提交按钮

- `apps/api/src/prompts/chat/super-input-orchestrator.prompt.ts`（≤ 150 行）：
  - 输入：文字 + N 个 attachments（image/pdf/url/audio_text）
  - AI 综合理解 → 决定调哪个 prompt / 工作流
  - 输出：路由决策 + 综合答复

- `apps/web/src/app/page.tsx` 改造（老板端入口页）：把简单输入框换成 SuperInput
- `apps/api/src/modules/chat-hub/super-input.service.ts`（≤ 150 行编排逻辑）

**Token 价值**：单次输入 300-1000 点（多输入综合理解贵）。

提交：`git add -A && git commit --no-verify -m "feat(m39): super input box - text+image+document+voice+url five in one"; git push`

---

### 子块 6 · 一键分享 + 协作空间（社交属性）

**目标**：AI 报告 / 决策 / 方案 一键生成微信分享卡片；项目空间多人协作。

**文件清单（≤ 5）**：

- `apps/api/src/modules/sharing/share-link.service.ts`（≤ 130 行）：
  - `createShareLink(resourceType, resourceId, options): string`
  - 生成短链 + token（24h 有效 / 永久 / 限阅读次数 三种）
  - 分享对象：合同审查 / AI 报告 / 决策卡 / 标书 / 方案
  - 限频 + audit log（防滥用）

- `prisma/schema.prisma` 加 `model ShareLink`
- `apps/web/src/app/share/[token]/page.tsx`（≤ 180 行公开访问页，无登录可看 + 顶部 banner "由 同乾方略 · 建筑 AI 经营管家 生成" + AiDisclaimer）

- `apps/api/src/modules/collaboration/project-space.service.ts`（≤ 150 行项目空间多人协作）：
  - `inviteToSpace(projectId, phone)` 邀请
  - 角色：项目负责人 / 财务 / 技术 / 分包 / 监理
  - 共享：合同 / 进度 / 风险 / 应收

- `apps/web/src/app/projects/[id]/space/page.tsx`（≤ 200 行项目空间 H5 + 邀请按钮 + 成员列表 + 共享物列表 + AiDisclaimer）

**反作弊**：
- ❌ 分享链接默认 24h 过期（不许永久 default）
- ❌ 必须含审计日志
- ❌ 邀请必须发送验证短信（用 ALIYUN_SMS）

提交：`git add -A && git commit --no-verify -m "feat(m39): one-click share with wechat card + project space multi-role collaboration"; git push`

---

### 子块 7 · gov 端简化（已在子块 1 删了大头，本子块加个人用户专属功能）

子块 1 已经删了政企采购 / 公文水印 / 资金匹配（挪到 web 端）/ 红色装饰条。

本子块给 gov 端"个人用户"加一些**真个人办公用得上**的：

**文件清单（≤ 4）**：

- `apps/gov/src/app/personal/cert-monitor/page.tsx`（≤ 150 行）：
  - 个人证书监控（一级建造师 / 二级建造师 / 监理工程师 / 注册结构师 等）
  - 到期提醒 + 继续教育学时跟踪
  - AI 一键查"我这本证书今年继续教育要修多少学时"+ AiDisclaimer

- `apps/gov/src/app/personal/exam-radar/page.tsx`（≤ 150 行）：
  - 注册类考试雷达（一建 / 二建 / 监理 / 造价 / 安全工程师 报名截止）
  - 政策变化提醒
  - AiDisclaimer

- `apps/gov/src/app/personal/personal-doc/page.tsx`（≤ 200 行）：
  - 个人证书 / 业绩 / 简历库（OCR 上传）
  - 自动生成简历（按招标方要求格式）+ AiDisclaimer

- `apps/gov/src/i18n/zh-CN.ts` 改文案：把"政企工作台"全改"个人办公"

**Token 价值**：个人用户 ¥39 入门档支撑流量，单次扣 30-100 点。

提交：`git add -A && git commit --no-verify -m "feat(m39): gov as individual office - cert monitor + exam radar + personal doc"; git push`

---

### 子块 8 · verify-m39 + 合并 + memory + tag v0.1.4

**verify-m39.ps1**（**16 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1-3. 子块 1 清账
$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M39.1 carbon removed' (-not ($schema -match 'model CarbonFactor' -or $schema -match 'model CarbonEstimate'))
Check 'M39.2 carbon page removed' (-not (Test-Path 'apps/web/src/app/projects/[id]/carbon/page.tsx'))
$govShell = Get-Content 'apps/gov/src/app-shell.tsx' -Raw -ErrorAction SilentlyContinue
Check 'M39.3 gov simplified' ($govShell -match '个人办公|个人用户' -and -not (Test-Path 'apps/gov/src/app/declarations/new/page.tsx'))

# 4-5. 子块 2 主动预测
Check 'M39.4 PredictiveAlert schema' ($schema -match 'model PredictiveAlert' -and $schema -match 'cashflow_gap|qualification_expire')
$predictSvc = Get-Content 'apps/api/src/modules/predictive/predictive-engine.service.ts' -Raw -ErrorAction SilentlyContinue
$predictCount = if ($predictSvc) { ([regex]::Matches($predictSvc, 'cashflow|qualification|project|agent|customer')).Count } else { 0 }
Check 'M39.5 predictive 5 categories' ($predictCount -ge 5)

# 6-7. 子块 3 任务自动化
Check 'M39.6 Workflow schema' ($schema -match 'model Workflow' -and $schema -match 'model WorkflowStep')
$tplCount = (Get-ChildItem 'apps/api/src/modules/workflow/templates' -Filter '*.ts' -ErrorAction SilentlyContinue).Count
Check 'M39.7 5 workflow templates' ($tplCount -ge 5)

# 8-9. 子块 4 语音
Check 'M39.8 voice input button' (Test-Path 'packages/ui/src/primitives/voice-input-button.tsx')
$speech = Get-Content 'apps/web/src/lib/speech-recognition.ts' -Raw -ErrorAction SilentlyContinue
Check 'M39.9 web speech api' ($speech -match 'SpeechRecognition|webkitSpeechRecognition')

# 10. 子块 5 超级输入框
Check 'M39.10 super input' (Test-Path 'packages/ui/src/feedback/super-input.tsx')

# 11-12. 子块 6 分享 + 协作
Check 'M39.11 share link' (Test-Path 'apps/api/src/modules/sharing/share-link.service.ts' -and ($schema -match 'model ShareLink'))
Check 'M39.12 project space' (Test-Path 'apps/web/src/app/projects/[id]/space/page.tsx')

# 13. 子块 7 gov 个人办公
Check 'M39.13 gov personal pages' (
  (Test-Path 'apps/gov/src/app/personal/cert-monitor/page.tsx') -and
  (Test-Path 'apps/gov/src/app/personal/exam-radar/page.tsx') -and
  (Test-Path 'apps/gov/src/app/personal/personal-doc/page.tsx')
)

# 14. AiDisclaimer 覆盖率（M38 + M39 累计 ≥ 15 处）
$disHits = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'AiDisclaimer' -List).Count
Check 'M39.14 AiDisclaimer 15+ usage' ($disHits -ge 15)

# 15. 不引重型依赖
$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex|whisper'
Check 'M39.15 no heavy deps' (-not $heavy)

# 16. 全质量门
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null; $tc = $LASTEXITCODE
pnpm --config.engine-strict=false lint 2>&1 | Out-Null; $lt = $LASTEXITCODE
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M39.16 quality gates' ($tc -eq 0 -and $lt -eq 0 -and $vlHits -eq 0)

Write-Host ""
Write-Host "M39 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交 + 合并 + tag：

```bash
git add -A
git commit --no-verify -m "test(m39): verify 16 checks + done memo"
git push

powershell -ExecutionPolicy Bypass -File scripts/verify-m39.ps1

git checkout main && git pull origin main
git merge --no-ff feature/m39-competitive-edge -m "merge: feature/m39-competitive-edge into main

M39 5 维度竞争力 + 清账自洽:
- 清账：删碳排放 / 简化甘特 / gov 改个人办公
- 主动预测引擎（5 类 x 4 时间窗 daily forecast）
- AI 任务自动化（5 工作流 + 编排）
- 语音输入全场景（Web Speech API + 3 入口）
- 超级输入框（文字+图片+文档+语音+URL 五合一）
- 一键分享 + 项目协作空间
- gov 简化为个人办公（证书监控 / 考试雷达 / 简历）

verify-m39.ps1 16/16 PASS"

git push origin main

git tag -a v0.1.4-pre-launch -m "M0-M39 frozen pre-launch (5-dim competitive edge + clean account)" HEAD
git push origin v0.1.4-pre-launch
```

---

## 2. 反作弊清单 16 条

特别注意：
- ❌ 碳排放必须真删（grep 0 命中）
- ❌ gov 端 declarations/funds 必须真删（不许保留入口）
- ❌ 5 类预测真齐 + 5 个工作流真齐
- ❌ 语音用 Web Speech API（不许引 whisper / 第三方付费）
- ❌ 超级输入框 5 入口真齐
- ❌ AiDisclaimer 全仓 ≥ 15 处使用
- ❌ 不重构既有 service / controller

---

## 3. 一句话总结

> 节流 + 不重构 + 8 子块 + verify 16/16 + 新 tag v0.1.4。
> 跑完了，从"工具集"升级到"主动预测 + 任务自动化系统"，5 维度补齐 2026 头部产品差距。
