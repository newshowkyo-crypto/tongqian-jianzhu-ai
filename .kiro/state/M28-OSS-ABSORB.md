# M28 · 吸收 GitHub 热门建筑 AI 项目（DDC + OpenConstructionERP + RFP + Legal Skill）

> Codex 一段读完，按 6 子块顺序执行，每块 1 commit。**节流模式 + 不开 dev server + 不截图 + 不真复制 AGPL 代码**。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文（**§A 永久事实必看**：VPS / DeepSeek 付费 / ICP 审核中尾声）
2. `.kiro/state/GITHUB-CONSTRUCTION-AI-SCAN-2026-05-23.md`（M27 已扫描的报告）
3. `AGENTS.md` 仅 §3.7 双轨命名 + §3.8 V4 商业宪法
4. `.kiro/steering/security-rules.md` §10 数据出境
5. `.kiro/state/M27-LEGAL-CORPUS-RULE-GEN.md`（M27 spec，本期是 M27 的延续）
6. `apps/api/src/prompts/` 目录树（既有 prompt 库结构）
7. `apps/api/src/modules/cost-estimate/cost-estimate.service.ts`（既有造价模块）
8. `apps/api/src/modules/tender/tender.service.ts`（既有招标模块）

**节流契约（强约束）**：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- **不开 dev server / 不真跑 docker / 不截图**
- **不真下载 OpenConstructionERP 源码（AGPL-3.0，会污染我们仓库）**
- **不真下载 CWICR 55,719 个 work items（数据集 5GB+，先做 schema + 数据加载机制，数据让万婷婷晚点单独导）**
- **只看公开 README + 文档结构**，所有借鉴都是"自己重写一遍"，不复制粘贴
- LOAD ≤ 6 / CODE ≤ 16 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 6 文件 / ≤ 600 行 / 1 commit
- SHALL NOT 询问用户；SHALL NOT 写 BLOCKED.md

**双轨命名**：用户可见层中文，代码层英文 `cost-catalog / takeoff / clause-checker / rfp-rag`，**绝不出现"中介"**。

**License 红线**：
- ❌ 不得复制 AGPL-3.0 代码（OpenConstructionERP）— 否则我们闭源 SaaS 必须开源
- ❌ 不得复制无 license 仓库的代码
- ✅ 可以借鉴架构思路 / 字段定义 / 流程设计（这些不是 license 保护范围）
- ✅ CC BY 4.0 数据可以引用 + 标注来源（CWICR 数据集是这个 license）

---

## 1. 同乾方略 17 大功能 vs GitHub 项目对位（决定吸收什么）

| # | 同乾方略功能 | 现状 | 吸收对象 | 吸收什么 | 不吸收什么 |
|---|---|---|---|---|---|
| 1 | 合同审查 | M14 完成基础闭环 + M27 法律语料抽规则 | evolsb/claude-legal-skill | red flag scan checklist + market benchmark 思路 | 不抄 Skill 代码 |
| 2 | 招标中心 | M15 闭环 | aws-samples/aws-genai-rfpassistant | RFP 多文件 RAG 检索结构（向量库 + 多文档对比） | 不上 Bedrock（继续 DeepSeek） |
| 3 | 资质护航 | M16 闭环 | — | 无直接对位 | — |
| 4 | 机会雷达 | M17 闭环 + M26 全网爬虫 | — | 无直接对位 | — |
| 5 | 报告中心 | M18 闭环 | DDC `4_DDC_Curated`（PDF/Excel/DOCX/PPTX 模板） | 报告导出多格式 + 质量自检 checklist | 不抄具体模板 |
| 6 | 派单大厅 | M19 闭环 | — | 无直接对位 | — |
| 7 | AI 聊天枢纽 | M20 闭环 | OpenConstructionERP "Floating chat" 17 数据库工具 | 聊天面板调 17 业务 tool 的 tool-calling 思路 | 不重构 ai-gateway |
| 8 | 现金流财务 | M21 闭环 | — | 无直接对位 | — |
| 9 | 项目部 | M22 闭环 + 项目站点 | OpenConstructionERP 4D/5D + Critical Path | 进度计划甘特图 + 关键路径分析 | 不抄 Cesium 3D 地图（V2 再说） |
| 10 | **造价粗估** | 现状只是占位骨架，**最大空白** | **DDC CWICR + OpenConstructionERP** | **CWICR 数据 schema（85 字段）+ 文本/照片/CAD 三种估价路径 + AI 估价 disclaimer** | 不抄 Revit/IFC 解析（V2 再说） |
| 11 | 图纸识别 | 占位 | OpenConstructionERP IFC→Excel + DWG→Excel | 思路：先抽出可结构化数据再 AI 分析 | 不抄实现（要 CAD SDK） |
| 12 | 知识系统 | M8 + M27 完成法律语料 | OpenConstructionERP "Semantic search across all modules" | 全模块语义搜索 + 11 语言 collections | 暂只做中文 |
| 13 | 规则引擎 | M27 完成 1000 条骨架 | DDC `n8n` workflow | n8n 工作流编排思路（M30+ 再做） | 不引 n8n 依赖 |
| 14 | 智能管家工作台 | M19 + 智能管家全闭环 | — | 无直接对位 | — |
| 15 | 政企工作台 | apps/gov 已建 | — | 无直接对位 | — |
| 16 | 平台后台 | apps/admin 已建 | OpenConstructionERP "10 dashboard widgets" | dashboard widget 服务端布局持久化 | 暂不抄（已用 useQuery） |
| 17 | AI 老板助理 | M20 闭环 | DDC `1_DDC_Toolkit` | KPI 分析 + 数据透视技能 | — |
| 附 | 安全巡检 | M22 项目部子模块 | safetyAI/ChatSafetyAI | 施工安全知识 prompt | — |

**结论**：M28 重点吸收 **5 项**：
1. **CWICR 工程造价数据 schema + 加载机制**（最大空白，造价模块）
2. **RFP 多文件 RAG 检索**（招标中心增强）
3. **法律 Skill red flag scan checklist**（合同审查增强）
4. **Floating chat 17 工具调用模式**（AI 老板助理工具增强）
5. **报告多格式导出 + 质量自检**（报告中心增强）

---

## 2. 子块拆解（6 子块 × 1 commit）

### 子块 1 · 工程造价数据 schema + CSV 导入器（commit 1）

**目标**：在我们的 schema 加 `CostCatalog` 表，对齐 CWICR 85 字段标准；写一个 CSV 导入器，让万婷婷后期可一键导入 CWICR 中文 collection（`ddc_cn_*`）。**本期只做 schema + 导入器，不真导数据**。

**文件清单（≤ 6）**：

- `prisma/schema.prisma` 加 model `CostCatalog`：
  ```prisma
  model CostCatalog {
    id              String   @id @default(cuid())
    catalogCode     String   @unique  // ddc_cn_shanghai / GB50500-2024-bj 等
    region          String   // 省/市
    language        String   @default("zh-CN")
    sourceLicense   String   // CC-BY-4.0 / proprietary 等
    sourceUrl       String?
    importedAt      DateTime?
    itemCount       Int      @default(0)
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    
    items           CostItem[]
    
    @@map("cost_catalogs")
  }
  
  model CostItem {
    id              String   @id @default(cuid())
    catalogId       String
    classCode       String   // 分类编码（GB/T 50500 编码）
    workCode        String   // 项目编码
    description     String   @db.Text
    descriptionEn   String?  @db.Text  // 英文对照（CWICR 多语言）
    unit            String   // m³ / m² / 套 / 台班
    laborCost       Decimal? @db.Decimal(20, 4)
    materialCost    Decimal? @db.Decimal(20, 4)
    machineryCost   Decimal? @db.Decimal(20, 4)
    overheadCost    Decimal? @db.Decimal(20, 4)
    totalUnitPrice  Decimal? @db.Decimal(20, 4)
    laborHours      Decimal? @db.Decimal(20, 4)
    keywords        String[] // 用于全文搜索
    embedding       Bytes?   // 后续可灌向量
    
    catalog         CostCatalog @relation(fields: [catalogId], references: [id], onDelete: Cascade)
    
    @@index([catalogId, classCode])
    @@index([workCode])
    @@map("cost_items")
  }
  ```
  生成 migration: `pnpm --config.engine-strict=false --filter @tongqian/prisma migrate-dev --name add_cost_catalog`

- `apps/api/src/modules/cost-catalog/cost-catalog.module.ts`（新建）
- `apps/api/src/modules/cost-catalog/cost-catalog.service.ts`（新建 ≤ 130 行）：
  - `importFromCsv(catalogCode, csvPath, options): Promise<{ imported: number, errors: string[] }>` — 真用 `csv-parse` 流式读取 + Prisma batch insert（每 500 条一批）
  - `searchByKeyword(keyword, region?, limit=20): Promise<CostItem[]>` — 关键词搜索
  - `searchByDescription(description: string): Promise<CostItem[]>` — 用 trigram 模糊匹配（pg `pg_trgm` extension，数据库未启时 fallback 到 LIKE）
- `apps/api/src/modules/admin/cost-catalog-admin/cost-catalog-admin.controller.ts`：
  - `GET /api/v1/admin/cost-catalogs` 列表
  - `POST /api/v1/admin/cost-catalogs/import` body `{ catalogCode, region, csvUrl, sourceLicense }` → 异步 BullMQ Job 跑导入
  - `GET /api/v1/admin/cost-catalogs/:catalogCode/items?keyword=` 搜索
- `apps/api/data/cost-catalog/seed/README.md`：写明 CWICR `ddc_cn_*` collection 下载链接 + 字段映射表（85 字段 → 我们 12 字段的对应关系）

**反作弊**：
- ❌ 不许 hardcode CostCatalog 数据（必须真从 CSV 读）
- ❌ 不许复制 OpenConstructionERP 任何代码（AGPL）
- ✅ schema 字段必须对齐 CWICR 公开规范（README 标的字段）
- ✅ importFromCsv 必须流式（防 OOM），每批 ≤ 500 条

提交：`git checkout -b feature/m28-oss-absorb && git add -A && git commit --no-verify -m "feat(m28): cost catalog schema + csv importer aligned to CWICR" && git push -u origin feature/m28-oss-absorb`

---

### 子块 2 · 造价 AI 三路径估价（文本 / 照片 / CAD-占位）（commit 2）

**目标**：在 `apps/api/src/modules/cost-estimate/` 加三种估价方式入口（文本描述 / 照片 / CAD 占位），全部走 AI Gateway。

**文件清单（≤ 5）**：

- `apps/api/src/prompts/cost/cost-from-text.prompt.ts`（新建 ≤ 180 行）：
  - taskType: `AiTaskType.COST_FROM_TEXT`
  - inputSchema: `{ description: string, region: string, area?: number, projectType: string }`
  - outputSchema: `{ items: Array<{ workCode, description, qty, unit, unitPrice, totalPrice, source: 'cwicr' | 'ai_estimate' }>, totalCny: number, confidence, disclaimer }`
  - systemPrompt 中文：建筑造价师角色 + 必须先调 cost-catalog 查匹配（tool-calling 结构）+ 红线禁绝对化 + 必须含 disclaimer "本估算仅作参考，最终造价以正式预算书为准"
  - fewShotExamples ≥ 3（小工程 / 中工程 / 大工程）

- `apps/api/src/prompts/cost/cost-from-photo.prompt.ts`（新建 ≤ 150 行）：
  - taskType: `AiTaskType.COST_FROM_PHOTO`
  - inputSchema: `{ photoUrls: string[], region, projectStage: 'rough_in' | 'finishing' | 'mep' }`
  - 用多模态模型（DeepSeek-VL 或 Qwen-VL，看 ai-gateway provider 注册）
  - outputSchema: 同上 + `extractedScope: string[]`（识别出的工作内容）

- `apps/api/src/prompts/cost/cost-from-cad.prompt.ts`（新建 ≤ 120 行）：
  - taskType: `AiTaskType.COST_FROM_CAD`
  - **占位**：当前 inputSchema 是 `{ extractedBoq: Array<{...}> }`（假设外部已抽出 BOQ），不真做 CAD 解析
  - fallbackText: "CAD 解析能力建设中，请先用 IFC→Excel 工具导出 BOQ 后用本接口"

- `apps/api/src/modules/cost-estimate/cost-estimate.service.ts` 加 3 个方法：
  - `estimateFromText(input): Promise<EstimateView>`
  - `estimateFromPhoto(input): Promise<EstimateView>`
  - `estimateFromCadBoq(input): Promise<EstimateView>`
  - 每个方法都先调 `costCatalogService.searchByKeyword()` 拉相关候选，再丢给 AI 让它选 + 算量

- `apps/api/src/modules/cost-estimate/cost-estimate.controller.ts` 加 3 endpoint：
  - `POST /api/v1/cost/estimate/from-text`
  - `POST /api/v1/cost/estimate/from-photo`
  - `POST /api/v1/cost/estimate/from-cad-boq`

**反作弊**：
- ❌ AI 输出必须含 disclaimer
- ❌ items[].source 必须区分 'cwicr'（命中数据库）vs 'ai_estimate'（AI 估算）— 让用户知道哪些是查的、哪些是猜的
- ❌ 不能写死价格（必须先 query catalog 后 AI 计算）

提交：`git add -A && git commit --no-verify -m "feat(m28): cost estimate 3 paths (text/photo/cad-stub) with cwicr lookup"; git push`

---

### 子块 3 · 招标 RFP 多文件 RAG 检索（commit 3）

**目标**：M15 招标中心增强 — 用户上传招标文件 + 答疑 + 补遗 多个 PDF，AI 跨文件检索关键条款（评分办法 / 废标条件 / 资格要求 / 工期 / 付款）。

**文件清单（≤ 5）**：

- `apps/api/src/modules/tender/rfp-rag.service.ts`（新建 ≤ 150 行）：
  - `ingestRfpDocs(tenderId, docs: Array<{name, ossUrl}>)` — 下载 → OCR/解析 → 切段（每段 ≤ 800 字 + 重叠 200 字）→ 写入 `rfp_chunks` 表（用既有 storage 模块）
  - `searchAcrossRfp(tenderId, query, topK=8)` — 跨所有文档的语义检索（**先用关键词 + trigram 简单 RAG，向量库 V2 再上 DashVector**）
  - `compareDocs(tenderId)` — 找答疑/补遗对原文的修改（diff）

- `apps/api/src/prompts/tender/rfp-key-clauses.prompt.ts`（新建 ≤ 130 行）：
  - taskType: `AiTaskType.RFP_KEY_CLAUSES`
  - 自动找 8 类关键条款：评分办法 / 废标条件 / 资格预审 / 投标保证金 / 工期要求 / 付款方式 / 履约保证金 / 不平衡报价限制
  - 每类输出：condition / risk / suggestion / 引用页码

- `apps/api/src/modules/tender/tender.controller.ts` 加：
  - `POST /api/v1/tender/projects/:id/rfp-ingest` 上传多 PDF 后自动跑 RAG
  - `POST /api/v1/tender/projects/:id/rfp-search` body `{query}` 跨文件搜索
  - `GET /api/v1/tender/projects/:id/key-clauses` 8 类关键条款一键自动抽出

- `apps/web/src/app/tenders/[id]/rfp-analysis/page.tsx`（新建 ≤ 200 行）：
  - 左：上传的多个 PDF 列表（含答疑 / 补遗），点击切换查看
  - 中：8 类关键条款卡片（红黄绿 + 引用页码）
  - 右：自由问答框（"投标保证金多少？" → AI 答 + 给原文片段）

- `prisma/schema.prisma` 加 model `RfpChunk`（≤ 30 行）：
  ```prisma
  model RfpChunk {
    id              String   @id @default(cuid())
    tenderId        String
    docName         String
    pageNumber      Int?
    content         String   @db.Text
    keywords        String[]
    embedding       Bytes?
    
    @@index([tenderId])
    @@map("rfp_chunks")
  }
  ```

提交：`git add -A && git commit --no-verify -m "feat(m28): rfp multi-doc rag for tender key clauses extraction"; git push`

---

### 子块 4 · 合同审查 red flag scan checklist 增强（commit 4）

**目标**：M14 合同审查在既有"AI 抽风险点"基础上加一个"38 项 red flag 强制扫描"checklist，借鉴 evolsb/claude-legal-skill 思路。

**文件清单（≤ 4）**：

- `apps/api/data/contract-red-flags/zh-CN-construction.json`（新建，≤ 300 行 JSON）：
  - 38 项强制扫描（按 GF-2017-0201 高频风险归纳）
  - 每项：`{ id, category, title, regex/keywords, riskLevel, defaultBenchmark, suggestion }`
  - category 分 8 类：付款 / 工期 / 违约 / 担保 / 索赔 / 不可抗力 / 知识产权 / 争议解决
  - 例如 "无限连带担保" / "总价合同变 LSTK 无调价" / "完工结算无审计期限" 等

- `apps/api/src/modules/risk-review/red-flag-scan.service.ts`（新建 ≤ 130 行）：
  - `scan(contractText): Promise<{ flags: Array<{ id, hit: boolean, location?, evidence?, suggestion }> }>` — 38 项遍历
  - 不全用 AI（节省 token）：先 regex/keywords 命中候选 → 命中的才丢给 AI 二次确认
  - 输出 + audit log

- `apps/api/src/modules/risk-review/risk-review.service.ts` 加 `scanWithRedFlags(contractText)` 集成方法（既有抽风险 + 新 red flag scan 合并输出）

- `apps/web/src/app/contracts/[id]/page.tsx` 加 "38 项强制扫描" 标签页（顶部 Tab + 列表显示命中/未命中 + 一键全选未命中导出补救建议）

提交：`git add -A && git commit --no-verify -m "feat(m28): contract red flag scan with 38 mandatory checklist"; git push`

---

### 子块 5 · AI 老板助理 17 工具 tool-calling 增强（commit 5）

**目标**：M20 AI 老板助理在既有自由对话基础上，让 AI 能直接调用 17 个内部业务 tool（不用用户敲命令）。

**文件清单（≤ 4）**：

- `apps/api/src/modules/chat-hub/tool-registry.service.ts`（新建 ≤ 200 行）：
  - 注册 17 个 tool（function-calling 风格）：
    1. `list_my_tenders` 我的在投项目
    2. `list_my_contracts_by_status` 按状态查合同
    3. `query_qualification` 查资质有效期 / 即将到期
    4. `query_cashflow_overview` 现金流概览
    5. `query_aging_analysis` 应收账龄
    6. `query_top_risks` 当前 top10 风险
    7. `query_ai_reports_recent` 最近 AI 报告
    8. `query_dispatch_orders` 派单大厅状态
    9. `query_agent_payouts` 智能管家分润
    10. `query_credit_balance` 点数余额
    11. `search_rules` 查规则库
    12. `search_cost_catalog` 查造价子目
    13. `search_rfp_chunks` 查招标文件片段
    14. `query_project_progress` 项目进度
    15. `query_kpi_dashboard` 老板 KPI
    16. `query_red_flags_pending` 待审 red flag
    17. `query_credentials_status` 凭证健康
  - 每个 tool: `{ name, description, parameters (zod), handler: async (params, ctx) => result }`

- `apps/api/src/prompts/chat/boss-assistant-with-tools.prompt.ts`（新建 ≤ 150 行）：
  - systemPrompt: 老板助理 + tool-calling instructions（什么时候用什么 tool）
  - 复用现有 chat 流，不重构 ai-gateway

- `apps/api/src/modules/chat-hub/chat-hub.service.ts` 加 tool-calling 流：
  - DeepSeek 返回 tool_calls → 调 tool-registry 执行 → 结果回灌 → DeepSeek 二次生成最终回答
  - 全程 audit log + traceId

- 集成测试 1 个：模拟用户问"我有几个合同到期"→ 期望 AI 调用 `list_my_contracts_by_status` → 返回真实数

提交：`git add -A && git commit --no-verify -m "feat(m28): boss assistant 17-tool calling pattern from openconstructionerp"; git push`

---

### 子块 6 · 报告中心多格式导出 + 质量自检 + verify-m28（commit 6）

**目标**：M18 报告中心增强 4 格式导出 + 自动质量自检；写 verify-m28.ps1。

**文件清单（≤ 5）**：

- `apps/api/src/modules/report-center/report-export.service.ts`（新建 ≤ 200 行）：
  - `exportPdf(reportId)` 用 puppeteer headless 渲染既有 H5 → PDF（**不真跑 puppeteer 上量**，留 stub + TODO）
  - `exportDocx(reportId)` 用 `docx` npm 包生成 Word（真实现）
  - `exportXlsx(reportId)` 用 `exceljs` 生成 Excel（真实现）
  - `exportPptx(reportId)` 用 `pptxgenjs` 生成 PPT（真实现）
  - 4 个 export 都写 audit log

- `apps/api/src/modules/report-center/quality-check.service.ts`（新建 ≤ 100 行）：
  - 每份生成的报告自动跑 5 项质量检查：
    1. 是否含 disclaimer
    2. 是否含 Tier 徽章（V4 §3.8 要求）
    3. 是否含 AI 信心度
    4. 是否含 5 引导按钮
    5. 是否所有数字带千分位 + 单位
  - 5 项任一失败 → 标 `qualityIssues: [...]`，admin 后台显示警告

- `apps/api/src/modules/report-center/report-center.controller.ts` 加：
  - `POST /api/v1/reports/:id/export?format=pdf|docx|xlsx|pptx`
  - `GET /api/v1/reports/:id/quality-check`

- `scripts/verify-m28.ps1`（**12 条 PASS/FAIL**）：
  ```powershell
  $ErrorActionPreference = 'Stop'
  $pass = 0; $fail = 0
  function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }

  # 1. CostCatalog + CostItem schema
  $schema = Get-Content 'prisma/schema.prisma' -Raw
  Check 'M28.1 CostCatalog + CostItem' ($schema -match 'model CostCatalog' -and $schema -match 'model CostItem')

  # 2. CSV 导入器真存在
  $svc = Get-Content 'apps/api/src/modules/cost-catalog/cost-catalog.service.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M28.2 cost-catalog importFromCsv stream' ($svc -and $svc -match 'importFromCsv' -and $svc -match 'csv-parse')

  # 3. 3 个估价 Prompt
  Check 'M28.3 cost prompts text/photo/cad' (
    (Test-Path 'apps/api/src/prompts/cost/cost-from-text.prompt.ts') -and
    (Test-Path 'apps/api/src/prompts/cost/cost-from-photo.prompt.ts') -and
    (Test-Path 'apps/api/src/prompts/cost/cost-from-cad.prompt.ts')
  )

  # 4. 估价输出含 disclaimer
  $textPrompt = Get-Content 'apps/api/src/prompts/cost/cost-from-text.prompt.ts' -Raw
  Check 'M28.4 cost prompt has disclaimer + cwicr source flag' ($textPrompt -match 'disclaimer' -and $textPrompt -match 'cwicr|ai_estimate')

  # 5. RFP RAG service
  $rfp = Get-Content 'apps/api/src/modules/tender/rfp-rag.service.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M28.5 rfp-rag service' ($rfp -and $rfp -match 'searchAcrossRfp' -and $rfp -match 'ingestRfpDocs')

  # 6. RfpChunk schema
  Check 'M28.6 RfpChunk schema' ($schema -match 'model RfpChunk')

  # 7. 38 项 red flag JSON
  $rf = Get-Content 'apps/api/data/contract-red-flags/zh-CN-construction.json' -Raw -ErrorAction SilentlyContinue
  $count = if ($rf) { ([regex]::Matches($rf, '"id"')).Count } else { 0 }
  Check 'M28.7 red flag 38 items' ($count -ge 38)

  # 8. red-flag-scan service
  $rfs = Get-Content 'apps/api/src/modules/risk-review/red-flag-scan.service.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M28.8 red-flag-scan service' ($rfs -and $rfs -match 'scan' -and $rfs -match 'regex|keywords')

  # 9. tool-registry 17 tools
  $tools = Get-Content 'apps/api/src/modules/chat-hub/tool-registry.service.ts' -Raw -ErrorAction SilentlyContinue
  $toolCount = if ($tools) { ([regex]::Matches($tools, "name:\s*'(list|query|search)_")).Count } else { 0 }
  Check 'M28.9 17 tools registered' ($toolCount -ge 17)

  # 10. 4 export formats
  $exp = Get-Content 'apps/api/src/modules/report-center/report-export.service.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M28.10 4 export formats' ($exp -and $exp -match 'exportPdf' -and $exp -match 'exportDocx' -and $exp -match 'exportXlsx' -and $exp -match 'exportPptx')

  # 11. quality-check 5 项
  $qc = Get-Content 'apps/api/src/modules/report-center/quality-check.service.ts' -Raw -ErrorAction SilentlyContinue
  Check 'M28.11 quality-check 5 items' ($qc -and $qc -match 'disclaimer' -and $qc -match 'tier' -and $qc -match 'confidence')

  # 12. typecheck
  $tc = pnpm --config.engine-strict=false typecheck 2>&1
  Check 'M28.12 typecheck' ($LASTEXITCODE -eq 0)

  Write-Host ""
  Write-Host "M28 verify: $pass PASS / $fail FAIL"
  exit $fail
  ```

- `.kiro/state/M28-OSS-ABSORB-DONE.md`：HEAD + verify 输出 + 5 项吸收实际落地点 + License 合规声明

提交：

```bash
git add -A
git commit --no-verify -m "test(m28): verify 12 checks + done memo"
git push

# 全套验证
powershell -ExecutionPolicy Bypass -File scripts/verify-m28.ps1
pnpm --config.engine-strict=false typecheck

# 12/12 PASS + typecheck 22/22 才合并
git checkout main
git pull origin main
git merge --no-ff feature/m28-oss-absorb -m "merge: feature/m28-oss-absorb into main

M28 吸收 GitHub 热门建筑 AI:
- CostCatalog + CostItem schema 对齐 CWICR 85 字段
- 造价 3 路径估价（text/photo/cad-stub）走 cost-catalog 查 + AI 计算 + disclaimer
- 招标 RFP 多文件 RAG（8 类关键条款自动抽）
- 合同 38 项 red flag 强制扫描 checklist
- AI 老板助理 17 工具 tool-calling
- 报告 4 格式导出 + 5 项质量自检
- verify-m28.ps1 12/12 PASS

License 声明: 不复制 AGPL 代码，只借鉴 schema/思路；CC BY 4.0 数据待万婷婷晚点导

ref: .kiro/state/M28-OSS-ABSORB.md"

git push origin main

# 更新 memory
# 改 PROJECT-MEMORY-2026-05-23.md §1 加一行 M28 完成
git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M28 done"
git push origin main
```

---

## 3. 6 段交付（最后给万婷婷）

完成后**只**回这 6 段：

```
1. main HEAD sha + 8 个 commit message（6 子块 + merge + memory）
2. verify-m28.ps1 输出（12/12 PASS）+ typecheck 22/22 cached
3. 5 项吸收落地点：
   - CostCatalog 字段数 / CWICR 85 字段映射多少 / 待万婷婷导多少 catalog
   - 招标 RFP RAG 8 类关键条款名字
   - 合同 38 项 red flag 8 大类各几条
   - AI 助理 17 工具列表
   - 4 格式导出真实现 vs 占位（puppeteer PDF 是占位）
4. License 合规声明（grep 仓库无 AGPL 代码块 + CWICR 数据待导）
5. 3 个估价 Prompt 关键代码片段（每个 ≤ 8 行）— 证明 disclaimer + source 字段都在
6. 已知限制（CSV 导入未真跑 / 向量库 V2 上 / CAD 解析占位 / puppeteer 占位）
```

---

## 4. 反作弊清单（万婷婷验收）

1. ✅ 7-8 commits（6 子块 + merge + memory）
2. ✅ verify 12/12 PASS
3. ✅ CostCatalog + CostItem schema 对齐 CWICR 字段
4. ✅ importFromCsv 必须含 csv-parse 流式（grep 验证）
5. ✅ 3 个估价 Prompt 都含 disclaimer + source 字段
6. ✅ 38 项 red flag JSON 行数 ≥ 38 项 id
7. ✅ tool-registry 17 个 tool 真注册（grep 计数）
8. ✅ 4 格式导出方法都存在
9. ✅ License 合规：grep 仓库无 OpenConstructionERP 代码片段（用 grep "OpenConstructionERP" 仅在 comment / docs 出现，不在 .ts/.tsx 业务代码）
10. ✅ typecheck 22/22 cached pass
11. ✅ RFP RAG 不依赖 DashVector（V1 用 trigram + 关键词 + AI rerank）
12. ✅ 不真跑 puppeteer / 不真导 CWICR 5GB 数据（占位 + TODO）

---

## 5. 一句话总结给 Codex

> 节流模式 + 不开 dev server + 不截图 + 不真复制 AGPL + 不真导大数据 + 6 子块 1 commit/块 + verify 12/12 + 6 段文本交付。
> 跑完了，万婷婷拥有：完整造价数据库骨架（待导）+ RFP 跨文件 AI 检索 + 38 项合同 red flag 扫描 + AI 助理 17 工具自动调用 + 报告 4 格式导出。从 M14 合同审查到 M28 全栈吸收，同乾方略业务密度上一个量级。
