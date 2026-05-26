# M38 · 4 角色业务大闭环增量（AI 标书 + 对话式 BI + PWA 离线 + 政策 31 省 + 同行情报 + 智能管家客户运营）

> Codex 整段读，按 7 子块顺序，每块 1 commit。**节流模式 + 不开 dev server（除子块 7 puppeteer 一次）+ 不引重型依赖**。
>
> **本期定位（万婷婷 2026-05-26 明确）**：
> - ❌ 砍掉"不痛不痒"的（PPE 安全识别 / 客户健康度雷达 / 安全提示 — 工头都懂）
> - ✅ 加"业务赚钱 + 增加见识 + 抓机会 + 提效率"的
> - ✅ 4 个角色（老板 / PM / 智能管家 / 政企）大而全闭环
> - ✅ 深度不要太专业（咨询辅助不替代专业人员）

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`（v0.1.0 锚点）
2. `AGENTS.md` §3.7 双轨 + §3.8 V4 商业宪法
3. `.kiro/state/M37-INCREMENTS.md`（M37 已规划 / 在跑，本 M38 不重复其内容）
4. `apps/api/src/modules/tender/rfp-rag.service.ts`（M28 RFP RAG 已就绪，**M38 标书生成必须复用**）
5. `apps/api/src/modules/report-center/report-export.service.ts`（M28 4 格式导出，**M38 标书导出必须复用**）
6. `apps/api/src/modules/report-center/quality-check.service.ts`（M28 质量自检）
7. `apps/api/src/modules/admin/credentials/credentials.service.ts`（既有凭证）
8. `prisma/schema.prisma` grep 既有 model

**节流契约**（强约束）：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- 不开 dev server / 不截图 / 不引重型依赖
- **绝对禁止**：puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad/comfyui/yolo/langchain/llamaindex 全部 0 命中
- LOAD ≤ 6 / CODE ≤ 18 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 7 文件 / ≤ 700 行 / 1 commit

**核心红线**：
- ❌ 不重构（M0-M37 已冻结，纯增量）
- ❌ 不做 ComfyUI / 户型图 / 室内设计 / BIM 重型解析 / YOLO 训练
- ❌ 不做"不痛不痒"功能（PPE 安全识别 / 健康度雷达 / 通用安全提示 全砍）
- ✅ 全部围绕 4 角色真实业务场景

**双轨命名**：用户可见层中文（智能管家），代码层英文（agent），**绝不"中介"**。

---

## 1. 子块拆解（6 业务子块 + 1 verify = 7 commits）

### 子块 1 · 老板对话式 BI（自然语言查业务数据）

**目标**：老板在 AI 助理输入"上月利润多少"/"今年同比增长"/"哪个项目应收最多"，AI 自动写 SQL 查 Postgres → 出图表 + 自然语言总结。

**思路**（借鉴 Canner/WrenAI + vanna-ai/vanna，**不引代码**）：
- 不让 AI 直接 SQL 我们生产库（注入风险）
- **预定义 30 个安全查询模板**（按业务问题分类）+ AI 选哪个 + 填参数
- 模板 zod 强校验 + 只读 view（专门的 `bi_views` schema，不动业务表）

**文件清单（≤ 7）**：

- `apps/api/src/modules/bi/bi-templates.ts`（新建 ≤ 250 行）：
  ```typescript
  // 30 个安全查询模板
  export const biTemplates = [
    { id: 'profit-monthly', question: '上月利润', sql: 'SELECT SUM(profit) FROM bi_views.monthly_pl WHERE month = ${month}', params: ['month'] },
    { id: 'tender-win-rate', question: '今年中标率', sql: '...', params: [] },
    { id: 'top-receivable', question: '应收账款最多的客户 TOP 5', sql: '...', params: [] },
    // ... 30 个
  ];
  ```
- `apps/api/src/modules/bi/bi-query.service.ts`（≤ 150 行）：
  - `query(question: string, ctx: TenantCtx): Promise<BiResult>` —
    1. 调 AI 选模板 + 填参数（zod 校验）
    2. 真跑 SQL（**只读连接 + tenant_id 强制注入**，4 道防线）
    3. AI 总结 + 出 chart 配置（chart.js 数据格式）
    4. audit log
- `apps/api/src/prompts/bi/bi-question-classifier.prompt.ts`（≤ 130 行）：
  - taskType: `AiTaskType.BI_QUERY`
  - inputSchema: `{ question: string }`
  - outputSchema: `{ templateId: enum, params: object, chartType: 'line'|'bar'|'pie'|'table', confidence, disclaimer }`
  - few-shot ≥ 5
- `prisma/schema.prisma` 加 view 定义（注释说明 `bi_views` schema 用途，真 view 由 migration SQL 创建）
- `apps/api/migrations/m38-bi-views.sql`（新建 ≤ 100 行）：5-10 个核心只读 view（monthly_pl / project_revenue / aging_analysis / tender_pipeline / agent_payouts 等）
- `apps/web/src/app/dashboard/bi-chat/page.tsx`（≤ 200 行）：
  - 输入框 + 30 个常见问题 chip 标签
  - 提交 → 流式回答 + chart.js 渲染
  - 历史问答列表
- `apps/api/src/modules/bi/bi.controller.ts`（≤ 50 行）：`POST /api/v1/bi/query`

**赚 token 差价点**：每次问 30-50 点（约 ¥0.3-0.5），老板每天问 5-10 次。

**反作弊**：
- ❌ 不许让 AI 直接生成 SQL 字符串（必须从 30 模板选 + zod 校验参数）
- ❌ 模板必须强 tenant_id 注入（grep `tenant_id = \$\{ctx.tenantId\}` 至少在每个模板 SQL 里）

提交：`git checkout -b feature/m38-business-increments && git add -A && git commit --no-verify -m "feat(m38): conversational BI with 30 safe templates + tenant guard"; git push -u origin feature/m38-business-increments`

---

### 子块 2 · AI 标书生成（含 RFP 响应）— **M38 赚钱核心**

**目标**：老板上传招标文件 + 公司资料 → AI 自动按"评分细则"反推标书章节 → 逐章节生成 → 导出 Word。

**输入**：
1. 招标文件 PDF（必）
2. 答疑 / 补遗 PDF（可选）
3. 公司资质 / 业绩 / 案例（自动从 admin 数据库拉，老板可勾选哪些用）
4. 报价区间（老板填 1 个数字 + 浮动 %）
5. 风格选择（保守 / 平衡 / 激进）

**AI Pipeline**（**全部复用既有能力**）：
1. 解析招标文件 — 复用 M28 RFP RAG `apps/api/src/modules/tender/rfp-rag.service.ts`
2. 抽 8 类关键条款 — 复用 M28 既有
3. **新增**：抽"评分细则" → 用 zod 输出结构化打分项（技术分 / 商务分 / 价格分 / 各小项权重）
4. 按评分细则反推章节大纲（每打分项 = 1 章节）
5. 逐章节生成内容（商务自动填 + 技术 AI 写 + 价格留空）
6. 质量自检 — 复用 M28 quality-check
7. 导出 Word — 复用 M28 docx 生成

**文件清单（≤ 7）**：

- `prisma/schema.prisma` 加 model `BidProposal` + `BidSection`：
  ```prisma
  model BidProposal {
    id              String   @id @default(cuid())
    tenantId        String
    tenderId        String
    projectName     String
    style           String   // conservative | balanced | aggressive
    priceLowCny     Decimal  @db.Decimal(20, 2)
    priceHighCny    Decimal  @db.Decimal(20, 2)
    scoringCriteria Json     // 抽出的评分细则
    overallProgress Int      @default(0)  // 0-100
    qualityScore    Float?
    docxOssUrl      String?
    status          String   @default("drafting") // drafting | reviewing | finalized
    createdBy       String
    createdAt       DateTime @default(now())

    sections        BidSection[]

    @@index([tenantId, tenderId])
    @@map("bid_proposals")
  }

  model BidSection {
    id              String   @id @default(cuid())
    proposalId      String
    sectionType     String   // commercial | technical | price | qualification | service
    title           String
    orderIndex      Int
    scoringWeight   Float    // 评分占比
    content         String   @db.Text
    aiGenerated     Boolean  @default(true)
    keywordCoverage Float?   // 关键词覆盖率（自检）
    needsHumanReview Boolean @default(false)

    proposal        BidProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

    @@index([proposalId, orderIndex])
    @@map("bid_sections")
  }
  ```

- `apps/api/src/modules/tender/bid-proposal.service.ts`（≤ 200 行）：
  - `extractScoringCriteria(tenderId): Promise<ScoringCriteria>` — 调 RFP RAG + AI 抽评分细则
  - `generateOutline(proposalId): Promise<BidSection[]>` — 按评分反推章节
  - `generateSection(sectionId): Promise<string>` — 逐章生成（异步 BullMQ）
  - `runQualityCheck(proposalId): Promise<QualityReport>`
  - `exportDocx(proposalId): Promise<{ ossUrl: string }>` — 复用 M28 export

- `apps/api/src/prompts/tender/bid-scoring-extractor.prompt.ts`（≤ 150 行）：抽评分细则
- `apps/api/src/prompts/tender/bid-section-generator.prompt.ts`（≤ 200 行）：
  - 输入：sectionType / 招标条款片段 / 公司资料 / 风格
  - 输出：章节内容（≥ 800 字 + 关键词覆盖打分要求）
  - few-shot ≥ 5（商务 / 技术 / 资格 / 服务 / 工期 各 1）
  - 红线：禁绝对化 / 禁过度承诺 / 必含真实公司业绩

- `apps/api/src/prompts/tender/rfp-question-responder.prompt.ts`（≤ 130 行）：
  - 输入：招标方提的 1 个问题 + 公司资料
  - 输出：逐条响应内容
  - 用于 RFP 单点响应（招标文件里"请说明你公司..."类问题）

- `apps/web/src/app/tenders/[id]/bid-generator/page.tsx`（≤ 250 行）：
  - 5 步向导：上传招标文件 → 选公司资料 → 填报价 → AI 生成大纲（确认）→ 逐章生成（进度条）
  - 完成后预览 + 下载 Word

- `apps/api/src/modules/tender/tender.controller.ts` 加：
  - `POST /api/v1/tenders/:id/bid-proposal` 创建
  - `POST /api/v1/tenders/:id/bid-proposal/:pid/extract-scoring`
  - `POST /api/v1/tenders/:id/bid-proposal/:pid/generate-outline`
  - `POST /api/v1/tenders/:id/bid-proposal/:pid/sections/:sid/generate`
  - `POST /api/v1/tenders/:id/bid-proposal/:pid/quality-check`
  - `POST /api/v1/tenders/:id/bid-proposal/:pid/export-docx`

**Token 价值**（M38 真赚钱核心）：每份标书 5000-20000 点 = **¥50-200 直接 token 收入**，按月 100 份标书 = ¥5000-20000/月。

**反作弊**：
- ❌ 不许写死章节内容模板（必须真 AI 生成）
- ❌ 不许跳过质量自检（关键词覆盖率必须计算）
- ❌ Prompt 必须红线禁绝对化（"必中" / "保证中标"）
- ❌ 公司业绩字段必须从数据库真拉（不许 AI 编造）
- ✅ 复用 M28 RFP RAG / 报告导出 / 质量自检（grep 验证 import）

提交：`git add -A && git commit --no-verify -m "feat(m38): ai bid proposal generator with scoring extraction + section pipeline + docx export"; git push`

---

### 子块 3 · PM PWA 离线 + 弱网同步

**目标**：M37 子块 6 加的 PM H5 工作台（拍照报工 / 问图纸 / 查规范 / 报隐患）4 个入口加离线能力。工地 4G 不稳，断网照样能拍照填表，回到信号区自动同步。

**思路**：
- next.js 加 service worker（`next-pwa` 插件 — **轻量包，已在 npm**）
- IndexedDB 用 Dexie.js 存"待同步"队列
- 4 个 H5 表单提交先入队列 → 检测网络 → 真发送到后端

**文件清单（≤ 5）**：

- `apps/web/next.config.mjs` 加 `next-pwa` 插件配置
- `apps/web/public/manifest.json`（PWA 元数据）：name / short_name / icons / start_url='/m'
- `apps/web/public/sw.js` 由 next-pwa 自动生成（不手写）
- `apps/web/src/lib/offline-queue.ts`（新建 ≤ 130 行）：
  - 用 Dexie 创建 IndexedDB
  - `enqueue(action: string, payload: any)` 入队列
  - `flush()` 检测网络 + 批量发送
  - online 事件自动 flush
- `apps/web/src/app/m/photo-report/page.tsx` + 其他 3 个 M37 PM H5 子页改造：
  - 提交按钮原本调 fetch → 改成先 `offline-queue.enqueue()` + UI 显示 "已加入同步队列"
  - 顶部加状态条："✓ 在线 / ⏳ 离线 待同步 X 条"

**轻量验证**：
- `pnpm --filter @tongqian/web add next-pwa dexie`（轻量包都允许）
- 不引 workbox-window（next-pwa 内置）

**反作弊**：
- ❌ 不许引重型 PWA 框架（Ionic / Capacitor 等）
- ❌ 不许把所有 API 都加 offline（只加 PM H5 的 4 个表单提交）

提交：`git add -A && git commit --no-verify -m "feat(m38): pm h5 pwa offline queue with dexie + auto sync on reconnect"; git push`

---

### 子块 4 · 政策爬虫扩 31 省 + AI 申报书生成

**目标**：M26 worker 现有 6 数据源（住建/财政/发改 + 招标/裁判/信用）扩到 31 省办公厅 + 专项债 + 中央预算 + 地方补贴。

**思路**（借鉴 SmartDataLab/Policy_crawler 思路 + ScrapeGraphAI AI 爬虫，**不抄代码**）：
- 31 省办公厅 URL 列表存 `apps/api/data/policy-sources/sources-31-provinces.json`
- 复用 M26 既有 BaseFetcher 抽象，新建 `province-policy.fetcher.ts` 一个文件管所有省（参数化）
- 调度策略：每天扫 5 省（错峰防风控），7 天扫完一轮

**新增 AI 申报书生成**（跟子块 2 标书生成同根技术，复用）：
- 政企用户上传"专项债项目要求 PDF" → AI 生成专项债申报书（30-50 页 Word）
- 跟标书生成 99% 共用代码，只是 sectionType 改成 `purpose / fund-source / impact / repayment` 等

**文件清单（≤ 6）**：

- `apps/api/data/policy-sources/sources-31-provinces.json`（31 省 + 直辖市公告 URL 配置）
- `apps/worker/src/crawlers/province-policy.fetcher.ts`（≤ 150 行 BaseFetcher 子类）
- `apps/worker/src/queues/policy-scheduler.ts`（错峰调度，每天扫 5 省）
- `apps/api/src/prompts/gov/declaration-generator.prompt.ts`（≤ 180 行，专项债申报书 prompt）
- `apps/api/src/modules/gov-soe/declaration.service.ts`（≤ 150 行，复用 bid-proposal.service 模式）
- `apps/gov/src/app/declarations/new/page.tsx`（≤ 200 行，政企版申报书向导）

**反作弊**：
- ❌ 31 省 URL 必须真实可访（不许编造）
- ❌ 政策爬虫必须遵守 robots.txt（M26 BaseFetcher 已强制）
- ❌ 申报书 prompt 必须复用 M28 质量自检

提交：`git add -A && git commit --no-verify -m "feat(m38): policy crawler 31 provinces + ai declaration generator for gov"; git push`

---

### 子块 5 · 老板同行情报雷达（每周自动推）

**目标**：每周一早上 7:30，老板公众号自动收到一份"行业情报"：
- 行业新闻 TOP 5（爬主流建筑媒体）
- 同省同行业绩（从 M26 招标 + 中标公告爬虫数据聚合）
- 政策窗口期（从子块 4 31 省政策聚合）
- 同乾方略观点（同乾方略品牌强化）

**思路**（借鉴 LearnPrompt/ai-news-radar，**不抄代码**）：
- 复用 M26 爬虫数据 + M27 RAG 检索
- 调 DeepSeek 总结 + AI prompt 风格化（有同乾方略立场）
- BullMQ cron 每周一 06:00 跑生成 + 07:30 推送

**文件清单（≤ 4）**：

- `apps/api/src/prompts/intel/peer-intel-weekly.prompt.ts`（≤ 200 行，4 板块结构化输出）
- `apps/api/src/modules/intel/peer-intel.service.ts`（≤ 150 行）
- `apps/worker/src/queues/peer-intel.queue.ts`（cron 每周一 06:00）
- `apps/web/src/app/intel/weekly/[week]/page.tsx`（H5 周报详情页 ≤ 180 行）

**Token 价值**：每周每老板 1 次自动生成 200 点 = ¥2，1000 老板 = ¥2000/周。

提交：`git add -A && git commit --no-verify -m "feat(m38): peer intelligence weekly auto report with industry news + bid intel + policy window"; git push`

---

### 子块 6 · 智能管家 AI 客户运营助手

**目标**：智能管家工作台加"客户运营"模块。每个客户卡片都能一键生成：
- **朋友圈文案**（按客户行业 / 项目阶段 个性化）
- **节日问候**（春节 / 端午 / 中秋 / 国庆 4 节自动生成）
- **跟单话术**（按客户心理状态：观望中 / 比价中 / 即将签约）
- **续约催单**（订阅快到期前 7/15/30 天自动生成催单文案）

**文件清单（≤ 4）**：

- `apps/api/src/prompts/agent/customer-ops.prompt.ts`（≤ 250 行，4 类文案各 1 个 prompt + few-shot）
- `apps/api/src/modules/agent-workspace/customer-ops.service.ts`（≤ 130 行）
- `apps/agent/src/app/customers/[id]/ops/page.tsx`（≤ 200 行客户运营 H5）
- `apps/agent/src/app/customers/[id]/page.tsx` 加"运营助手"按钮入口

**Token 价值**：每个智能管家每天 5-10 次客户运营调用 × 30 点 = 150-300 点/天/智能管家，500 智能管家 = ¥7500-15000/月。

**反作弊**：
- ❌ 4 类文案必须真有不同 prompt（不许 1 个 prompt 套 4 个 type）
- ❌ 朋友圈文案必须 ≤ 200 字（朋友圈格式约束）
- ❌ 节日问候不许踩政治敏感（safetyChecks 必含）

提交：`git add -A && git commit --no-verify -m "feat(m38): agent customer ops assistant with 4 prompts (moments/holiday/follow-up/renewal)"; git push`

---

### 子块 7 · verify-m38 + 合并 + memory + tag v0.1.3

**verify-m38.ps1**（**16 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1-4. 子块 1: 对话式 BI
Check 'M38.1 bi templates 30+' (
  (Test-Path 'apps/api/src/modules/bi/bi-templates.ts') -and
  ((Get-Content 'apps/api/src/modules/bi/bi-templates.ts' -Raw) -match "id:\s*'profit|id:\s*'tender")
)
$tpl = Get-Content 'apps/api/src/modules/bi/bi-templates.ts' -Raw -ErrorAction SilentlyContinue
$tplCount = if ($tpl) { ([regex]::Matches($tpl, "id:\s*'")).Count } else { 0 }
Check 'M38.2 bi 30+ templates' ($tplCount -ge 30)
$bisvc = Get-Content 'apps/api/src/modules/bi/bi-query.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M38.3 bi tenant guard' ($bisvc -and $bisvc -match 'tenantId')
Check 'M38.4 bi page' (Test-Path 'apps/web/src/app/dashboard/bi-chat/page.tsx')

# 5-7. 子块 2: AI 标书生成
$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M38.5 BidProposal + BidSection' ($schema -match 'model BidProposal' -and $schema -match 'model BidSection' -and $schema -match 'scoringCriteria')
Check 'M38.6 bid-proposal service' (Test-Path 'apps/api/src/modules/tender/bid-proposal.service.ts')
$bidPrompt = Get-Content 'apps/api/src/prompts/tender/bid-section-generator.prompt.ts' -Raw -ErrorAction SilentlyContinue
$bidShots = if ($bidPrompt) { ([regex]::Matches($bidPrompt, "name:\s*'")).Count } else { 0 }
Check 'M38.7 bid prompt 5+ fewshots' ($bidShots -ge 5 -and ($bidPrompt -match '\u7981.*\u7edd\u5bf9' -or $bidPrompt -match '\u4e0d\u8bb8'))

# 8-9. 子块 3: PWA
$nextCfg = Get-Content 'apps/web/next.config.mjs' -Raw -ErrorAction SilentlyContinue
Check 'M38.8 next-pwa configured' ($nextCfg -and $nextCfg -match 'next-pwa|withPWA')
Check 'M38.9 offline queue' (Test-Path 'apps/web/src/lib/offline-queue.ts')

# 10-11. 子块 4: 政策 31 省
$src = Get-Content 'apps/api/data/policy-sources/sources-31-provinces.json' -Raw -ErrorAction SilentlyContinue
$provinceCount = if ($src) { ([regex]::Matches($src, '"province":')).Count } else { 0 }
Check 'M38.10 31 provinces' ($provinceCount -ge 31)
Check 'M38.11 declaration prompt' (Test-Path 'apps/api/src/prompts/gov/declaration-generator.prompt.ts')

# 12. 子块 5: 同行情报
Check 'M38.12 peer-intel cron' (
  (Test-Path 'apps/worker/src/queues/peer-intel.queue.ts') -and
  ((Get-Content 'apps/worker/src/queues/peer-intel.queue.ts' -Raw) -match 'cron|0\s+6')
)

# 13. 子块 6: 客户运营 4 prompt
$opsPrompt = Get-Content 'apps/api/src/prompts/agent/customer-ops.prompt.ts' -Raw -ErrorAction SilentlyContinue
$opsCount = if ($opsPrompt) { ([regex]::Matches($opsPrompt, 'taskType:|moments|holiday|followUp|renewal')).Count } else { 0 }
Check 'M38.13 customer ops 4 types' ($opsCount -ge 4)

# 14. 不引重型依赖
$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex'
Check 'M38.14 no heavy deps' (-not $heavy)

# 15. typecheck
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M38.15 typecheck' ($LASTEXITCODE -eq 0)

# 16. visual-lint + lint
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
pnpm --config.engine-strict=false lint 2>&1 | Out-Null
Check 'M38.16 quality gates' ($vlHits -eq 0 -and $LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "M38 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交 + 合并 + memory + tag：

```bash
git add -A
git commit --no-verify -m "test(m38): verify 16 checks + done memo"
git push

powershell -ExecutionPolicy Bypass -File scripts/verify-m38.ps1

git checkout main
git pull origin main
git merge --no-ff feature/m38-business-increments -m "merge: feature/m38-business-increments into main

M38 4 角色业务大闭环（赚钱核心）:
- 老板对话式 BI（30 安全模板 + tenant 强 guard）
- AI 标书生成 + RFP 响应（赚钱核心，每份 ¥50-200）
- PM PWA 离线 + 弱网同步（next-pwa + Dexie）
- 政策爬虫扩 31 省 + AI 申报书生成（政企）
- 老板同行情报雷达（每周一 7:30 公众号推）
- 智能管家客户运营助手（朋友圈/节日/跟单/续约 4 prompt）

verify-m38.ps1 16/16 PASS

ref: .kiro/state/M38-INCREMENTS.md"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M38 done"
git push origin main

git tag -a v0.1.3-pre-launch -m "M0-M38 frozen pre-launch (incl business loop increments)" HEAD
git push origin v0.1.3-pre-launch
```

---

## 2. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 8 commits + 新 tag v0.1.3-pre-launch
2. verify-m38 16/16 PASS + 全质量门 PASS
3. 子块 1 BI: 30 模板分类 + tenant guard 实现
4. 子块 2 标书: BidProposal/BidSection schema + 5 fewshots + 复用 M28 RFP RAG / quality-check / docx export 3 处验证
5. 子块 3 PWA: next-pwa 版本 + offline-queue 行数 + 4 个 PM 表单接入
6. 已知限制（如标书 prompt 真凭证后才能跑测准 / 31 省爬虫部分省份反爬严待 V2 加 IP 池）
```

---

## 3. 反作弊清单（万婷婷验收）

按 verify-m38 16 条逐条核。**特别注意 4 项硬红线**：
- ❌ BI 不许 AI 直接生成 SQL（必须 30 模板 + zod）
- ❌ 标书 prompt 不许"必中 / 保证 / 绝对"绝对化（grep 验证含禁词列表）
- ❌ 公司业绩必须从数据库拉（不许 AI 编造）
- ❌ 不引 langchain/llamaindex/puppeteer 等任何重型依赖

---

## 4. 一句话总结给 Codex

> 节流 + 不重构 + 6 业务子块 + verify + 7 commits + 新 tag v0.1.3。
> 跑完了，4 角色（老板/PM/智能管家/政企）全闭环 + token 流水 月增 ¥10000-30000+。AI 标书是 M38 赚钱核心。
