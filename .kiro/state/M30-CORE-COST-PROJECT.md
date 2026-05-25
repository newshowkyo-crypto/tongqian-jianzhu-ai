# M30 · 概算 + 粗算量 + 项目部全闭环（飞书风格 task 看板）

> Codex 一段读完，按 6 子块顺序执行，每块 1 commit。**节流模式 + 不开 dev server + 不截图 + 不引重型依赖**。
> 本期定位：**补齐市面 SaaS 有 + GitHub 开源有 + 我们漏了的 6 项实用功能**。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文
2. `AGENTS.md` §3.7 双轨命名 + §3.8 V4 商业宪法
3. `.kiro/state/M28-OSS-ABSORB.md`（CostCatalog / cost-from-text 已建）
4. `.kiro/state/M29-LIGHTWEIGHT.md`（甘特图 / 历史造价对比 已建，**M30 复用**）
5. `apps/api/src/modules/cost-estimate/cost-estimate.service.ts`（M28 已建）
6. `apps/api/src/modules/project-site/project-site.service.ts`（M22 既有 progressPayment）
7. `apps/api/src/modules/cost-catalog/cost-catalog.service.ts`（M28 已建）

**节流契约**（强约束）：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- **不开 dev server / 不截图 / 不引重型依赖**（puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit-sdk 一律禁）
- 允许的轻量依赖：`docx / exceljs / pptxgenjs / csv-parse / pdf-parse / chart.js / qrcode`（M28/M29 已用）
- LOAD ≤ 6 / CODE ≤ 16 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 6 文件 / ≤ 600 行 / 1 commit

**核心红线**（万婷婷 2026-05-23 反复强调）：
- ❌ 不替代造价师 / 律师 / 安全工程师
- ❌ 不做 BIM 模型解析 / IFC / Revit / 3D 渲染 / IoT
- ✅ **只做"咨询辅助"**：让老板 / 智能管家 30 秒得到一个**专业人员可以接手的初稿**
- ✅ 所有 AI 输出含 disclaimer + Tier 徽章 + 5 引导按钮

**双轨命名**：用户可见层中文，代码层英文，**绝不"中介"**。

---

## 1. 子块拆解（6 子块 × 1 commit）

### 子块 1 · 概算引擎（建筑面积 × 单方造价 × 调整系数）

**目标**：老板输入"3000 平米标准厂房，杭州，钢结构主体，2026 年 6 月开工" → 5 秒内出概算 ¥X 万元 + 上下浮动区间 + 调整系数明细。

**算法逻辑**：
```
概算金额 = 建筑面积 × 基准单方造价 × 调整系数 ∏

调整系数包括：
- 地区系数（北上深 1.20 / 省会 1.05 / 三四线 0.92 / 县城 0.85）
- 质量系数（毛坯 1.00 / 标准装修 1.15 / 精装 1.35 / 豪装 1.60）
- 品类系数（厂房 1.00 / 办公 1.10 / 住宅 1.20 / 酒店 1.45 / 医院 1.55 / 数据中心 2.20）
- 结构系数（砖混 1.00 / 框架 1.15 / 框剪 1.25 / 钢结构 1.40 / 装配式 1.30）
- 时间系数（按 CPI + 钢/水泥/混凝土 综合指数月调）

基准单方造价从 BaselineUnitCost 表查（按品类 × 结构 × 区域）
```

**文件清单（≤ 6）**：

- `prisma/schema.prisma` 加 model `BaselineUnitCost` + `BudgetEstimate`：
  ```prisma
  model BaselineUnitCost {
    id              String   @id @default(cuid())
    projectType     String   // factory/office/residential/hotel/hospital/dc 等 12 类
    structureType   String   // brick_concrete/frame/frame_shear/steel/prefab 等 5 类
    region          String   // 一线/省会/三四线/县城 4 档
    baseCnyPerSqm   Decimal  @db.Decimal(20, 2)
    baseYear        Int      @default(2026)
    sourceNotes     String?  @db.Text  // 数据来源
    
    @@unique([projectType, structureType, region, baseYear])
    @@map("baseline_unit_costs")
  }
  
  model BudgetEstimate {
    id              String   @id @default(cuid())
    tenantId        String
    projectName     String
    areaSqm         Float
    projectType     String
    structureType   String
    region          String
    qualityLevel    String   // raw/standard/premium/luxury
    plannedStart    DateTime?
    
    baselineCny     Decimal  @db.Decimal(20, 2)  // 基准单方造价
    coefficients    Json     // { region: 1.20, quality: 1.15, category: 1.10, structure: 1.40, time: 1.02 }
    
    estimateLowCny  Decimal  @db.Decimal(20, 2)  // 下限（-15%）
    estimateMidCny  Decimal  @db.Decimal(20, 2)  // 中值
    estimateHighCny Decimal  @db.Decimal(20, 2)  // 上限（+15%）
    
    aiAnalysis      String?  @db.Text
    confidence      Float
    disclaimer      String
    createdBy       String
    createdAt       DateTime @default(now())
    
    @@index([tenantId, createdAt])
    @@map("budget_estimates")
  }
  ```

- `apps/api/src/modules/cost-estimate/budget-estimator.service.ts`（≤ 150 行）：
  - `estimate(input): Promise<BudgetEstimate>` — 真算公式
  - `getBaselineUnitCost(projectType, structureType, region, year)` — 查表
  - 查不到查最近 fallback（默认行业平均）
  - 写入 BudgetEstimate 表 + audit log

- `apps/api/src/prompts/cost/budget-explanation.prompt.ts`（≤ 100 行）：
  - 输入：估算结果 + 系数明细
  - 输出：自然语言解读（"按杭州一线城市钢结构厂房 2026 年标准，您的项目预计 ¥X-Y 万元；其中地区系数 1.20 是因为杭州属一线，钢结构系数 1.40 比框架高 22%..."）+ 节省成本的 3-5 条建议

- `apps/api/data/cost-baseline/seed/baseline-unit-cost.csv`（≤ 200 行）：
  - 12 品类 × 5 结构 × 4 区域 = 240 行基准单方造价
  - 数据来源：参考 2024 年广联达指标 / 鲁班指标 / 各省定额公开数据（自己写一份合理的 baseline，不复制有 license 的数据集）
  - 注释来源 + license 声明

- `apps/api/src/modules/admin/baseline-cost-admin/baseline-cost-admin.controller.ts`（≤ 80 行）：
  - 让 admin 后台 CRUD 这个表（万婷婷可以根据自己经验微调）

- `apps/web/src/app/cost-estimates/budget/page.tsx`（≤ 200 行）：
  - 表单：建筑面积 / 品类 / 结构 / 地区 / 装修档次 / 开工时间 / 备注
  - 提交后 1-3 秒出结果：3 档区间 + 调整系数雷达图（chart.js）+ AI 解读
  - 顶部 Tier 徽章 + 5 引导按钮

提交：`git checkout -b feature/m30-core-cost-project && git add -A && git commit --no-verify -m "feat(m30): budget estimator with baseline unit cost + 5 coefficients"; git push -u origin feature/m30-core-cost-project`

---

### 子块 2 · 粗算量（按工程类型拆 8-15 大项主要工程量）

**目标**：老板上传"3000 平米标准厂房" → 自动给出："主体钢结构 480 吨 / 混凝土 1200 m³ / 砌体 2400 m³ / 防水 4500 m² / 屋面 3200 m² ..." 共 8-15 大项。

**算法逻辑**：
```
粗算量 = 建筑面积 × 工程量指标系数

工程量指标系数从 QuantityIndicator 表查
（按品类 × 结构 × 工程量项目类型）

例：钢结构厂房：
- 钢结构主体: 0.16 t/m² (i.e. 3000 平 × 0.16 = 480 t)
- 混凝土基础: 0.4 m³/m²
- 砌体: 0.8 m³/m²
- 屋面金属板: 1.05 m²/m²（含落水、檐口）
...

这个数据是行业经验值（GitHub 上 nickwleo/building-cost-estimator 类似），
不是精确算量，但够老板"心中有数"。
```

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `QuantityIndicator` + `RoughQuantityEstimate`：
  ```prisma
  model QuantityIndicator {
    id              String   @id @default(cuid())
    projectType     String
    structureType   String
    workItem        String   // "钢结构主体" / "混凝土基础" 等
    unit            String   // "t/m²" / "m³/m²" / "m²/m²" 等
    coefficient     Decimal  @db.Decimal(20, 6)
    sourceNotes     String?  @db.Text
    
    @@unique([projectType, structureType, workItem])
    @@map("quantity_indicators")
  }
  
  model RoughQuantityEstimate {
    id              String   @id @default(cuid())
    tenantId        String
    projectName     String
    areaSqm         Float
    projectType     String
    structureType   String
    
    items           Json     // [{ workItem, qty, unit, estimatedCnyPerUnit, totalCny }]
    totalCny        Decimal  @db.Decimal(20, 2)
    aiAnalysis      String?  @db.Text
    
    @@map("rough_quantity_estimates")
  }
  ```

- `apps/api/src/modules/cost-estimate/rough-quantity.service.ts`（≤ 130 行）：
  - `estimate(areaSqm, projectType, structureType): Promise<RoughQuantityEstimate>` 
  - 查 QuantityIndicator 表 → 算 qty → 关联 CostCatalog 拿单价 → 算 totalCny
  - 输出 8-15 项主要工程量

- `apps/api/src/prompts/cost/rough-quantity-validator.prompt.ts`（≤ 120 行）：
  - AI 检查算量是否合理（如"3000 平米厂房算出 50 吨钢"明显偏低，建议复核）
  - few-shot ≥ 3
  - 输出：每项打 ✓/⚠ + 总体合理性评分

- `apps/api/data/quantity-indicators/seed/indicators.csv`（≤ 250 行）：
  - 12 品类 × 5 结构 × 平均 12 个工程量项 ≈ 240-300 行
  - 数据来源：行业经验 + 公开定额估算（不复制商用数据集）

- `apps/web/src/app/cost-estimates/rough-quantity/page.tsx`（≤ 180 行）：
  - 输入面积 + 品类 + 结构 → 表格输出 8-15 行（工程量 + 单价 + 总价）
  - 横向饼图：人材机比例
  - AI 合理性评分卡片

提交：`git add -A && git commit --no-verify -m "feat(m30): rough quantity estimator with 12x5 indicator matrix"; git push`

---

### 子块 3 · 进度款 + 结算台账（增强既有 progressPayment）

**目标**：老板登录看一张全闭环表："已签合同 ¥X / 已完工程 ¥Y / 已开票 ¥Z / 已收款 ¥W / 滞收 ¥M"，按项目 / 月份 / 客户多维度查。

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `PaymentLedger`：
  ```prisma
  model PaymentLedger {
    id              String   @id @default(cuid())
    tenantId        String
    projectId       String
    contractId      String?
    
    eventType       String   // contract_signed/work_completed/invoice_issued/payment_received/dispute/written_off
    amountCny       Decimal  @db.Decimal(20, 2)
    eventDate       DateTime
    period          String   // "2026-06" 月份
    
    invoiceNo       String?
    invoiceDate     DateTime?
    paymentDate     DateTime?
    
    status          String   // pending/confirmed/disputed/written_off
    notes           String?  @db.Text
    createdBy       String
    createdAt       DateTime @default(now())
    
    @@index([tenantId, projectId, eventDate])
    @@map("payment_ledgers")
  }
  ```

- `apps/api/src/modules/project-site/payment-ledger.service.ts`（≤ 130 行）：
  - `recordEvent(input)` 记录事件
  - `getLedger(filters): Promise<{ summary, items, byMonth, byProject, byCustomer }>`
  - `getOverdueAlerts()` 滞收预警（已开票 30/60/90 天未收）

- `apps/api/src/prompts/finance/ledger-summary.prompt.ts`（≤ 80 行）：
  - 输入：当月台账
  - 输出：本月经营摘要 + 3 条催收建议

- `apps/web/src/app/cashflow/ledger/page.tsx`（≤ 220 行）：
  - 顶部 5 张卡：已签合同 / 已完工 / 已开票 / 已收款 / 滞收
  - 中部表格：可按项目 / 月份 / 客户切换维度
  - 滞收红色标记 + 一键生成催款函（复用 M21 催款）

- `apps/api/src/modules/project-site/project-site.controller.ts` 加 endpoint：
  - `POST /api/v1/projects/:id/payment-ledger`
  - `GET /api/v1/cashflow/ledger`
  - `GET /api/v1/cashflow/ledger/overdue`

提交：`git add -A && git commit --no-verify -m "feat(m30): payment ledger 5-status closed loop with overdue alerts"; git push`

---

### 子块 4 · 变更签证 + 索赔台账

**目标**：施工合同三大坑（签证 / 索赔 / 变更）一张台账查。每条记录关联：合同 + 项目 + 触发事件 + 证据 + 进展状态 + 风险评估。

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `ChangeOrder` + `ClaimRecord`：
  ```prisma
  model ChangeOrder {
    id              String   @id @default(cuid())
    tenantId        String
    projectId       String
    contractId      String
    
    orderType       String   // design_change/scope_add/scope_reduce/material_substitute
    title           String
    description     String   @db.Text
    
    estimatedCostImpactCny  Decimal? @db.Decimal(20, 2)
    estimatedTimeImpactDays Int?
    
    status          String   // draft/submitted/owner_approving/approved/rejected/billed
    evidenceFiles   String[] // OSS URL 数组
    
    submittedAt     DateTime?
    approvedAt      DateTime?
    finalCostCny    Decimal? @db.Decimal(20, 2)
    finalTimeDays   Int?
    
    aiRiskAnalysis  String?  @db.Text
    
    @@index([tenantId, projectId, status])
    @@map("change_orders")
  }
  
  model ClaimRecord {
    id              String   @id @default(cuid())
    tenantId        String
    projectId       String
    contractId      String
    
    claimType       String   // owner_default/force_majeure/owner_supplied_delay/design_error/site_condition
    title           String
    description     String   @db.Text
    
    claimedAmountCny Decimal? @db.Decimal(20, 2)
    claimedTimeDays Int?
    
    submitDeadline  DateTime?  // 索赔时效（合同里通常 24h-28d）
    submittedAt     DateTime?
    
    status          String   // preparing/submitted/owner_response/negotiating/agreed/rejected/escalated
    evidenceFiles   String[]
    
    finalAmountCny  Decimal? @db.Decimal(20, 2)
    finalTimeDays   Int?
    
    aiSuccessScore  Float?   // AI 评估的索赔成功率 0-1
    aiAnalysis      String?  @db.Text
    
    @@index([tenantId, projectId, submitDeadline])
    @@map("claim_records")
  }
  ```

- `apps/api/src/modules/project-site/change-order.service.ts`（≤ 100 行）
- `apps/api/src/modules/project-site/claim-record.service.ts`（≤ 120 行 + 含**索赔时效预警**：到期前 7 天 / 3 天 / 1 天自动通知）

- `apps/api/src/prompts/contract/claim-success-predictor.prompt.ts`（≤ 130 行）：
  - 输入：claim 记录 + 合同条款 + 证据列表
  - 输出：成功率评分 0-1 + 5 个改进建议（"补 X 证据可提高 15%"）+ 是否建议升级专业律师介入

- `apps/web/src/app/projects/[id]/changes-claims/page.tsx`（≤ 200 行）：
  - 双 Tab：变更签证 / 索赔
  - 列表 + 筛选 + 一键 AI 分析按钮
  - 每行显示状态徽章 + 时效倒计时

提交：`git add -A && git commit --no-verify -m "feat(m30): change order + claim record ledger with deadline alerts + ai success predictor"; git push`

---

### 子块 5 · 碳排放粗算（建材清单 → 碳因子 → 总碳）

**目标**：老板看一份"政策风口"报告 — 这个项目预估碳排 X 吨 CO₂e，跟同规模项目对比，3 条减碳建议（绿色建材 / 装配式 / 光伏屋顶）。

**文件清单（≤ 4）**：

- `prisma/schema.prisma` 加 model `CarbonFactor` + `CarbonEstimate`：
  ```prisma
  model CarbonFactor {
    id              String   @id @default(cuid())
    material        String   // "C30 混凝土" / "HRB400 钢筋" / "页岩烧结砖" 等
    category        String   // concrete/steel/masonry/finishing/mep
    unit            String   // "kg CO₂e/m³" / "kg CO₂e/t" / "kg CO₂e/m²"
    factorValue     Decimal  @db.Decimal(20, 4)
    sourceNotes     String?  @db.Text  // 数据来源（《建筑碳排放计算标准》GB/T 51366-2019 / lcax 开源数据集）
    
    @@map("carbon_factors")
  }
  
  model CarbonEstimate {
    id              String   @id @default(cuid())
    tenantId        String
    projectName     String
    areaSqm         Float
    
    materialItems   Json     // [{ material, qty, unit, factor, totalKgCo2e }]
    totalKgCo2e     Decimal  @db.Decimal(20, 2)
    perSqmKgCo2e    Decimal  @db.Decimal(20, 2)
    
    benchmarkPerSqmKgCo2e Decimal? @db.Decimal(20, 2)  // 同类项目平均
    deviationPct    Float?   // 偏离基准百分比
    
    aiSuggestions   Json     // 3 条减碳建议
    disclaimer      String
    
    @@map("carbon_estimates")
  }
  ```

- `apps/api/src/modules/cost-estimate/carbon-estimator.service.ts`（≤ 130 行）：
  - 复用 RoughQuantityEstimate 的 items 列表
  - 关联 CarbonFactor 表算总碳
  - 跟同规模 benchmark 对比

- `apps/api/src/prompts/cost/carbon-reduction.prompt.ts`（≤ 100 行）：
  - 输出 3 条减碳建议（绿色建材替代 / 装配式比例 / 光伏屋顶 / 余热回收 等）
  - 每条建议附"预计减排 X 吨 + 增加成本 ¥Y" 评估

- `apps/api/data/carbon-factors/seed/factors.csv`（≤ 100 行）：
  - 30-50 种主要建材碳因子
  - 数据来源：GB/T 51366-2019 + IEA / EPD 公开数据
  - **license 声明**：lcax 开源是 MIT，可参考但不直接复制

- `apps/web/src/app/projects/[id]/carbon/page.tsx`（≤ 180 行）：
  - 顶部总碳数字 + 跟同行对比柱状图
  - 中部材料清单贡献饼图
  - 底部 3 条减碳建议卡

提交：`git add -A && git commit --no-verify -m "feat(m30): carbon emission rough estimator with 30+ factors + ai suggestions"; git push`

---

### 子块 6 · 飞书风格 task 看板（M22 项目部增强）+ verify-m30

**目标**：M22 项目部加飞书项目风格的任务看板（不是 OpenProject 那种重型，而是飞书简约风格）。

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `ProjectTask` + `TaskComment`：
  ```prisma
  model ProjectTask {
    id              String   @id @default(cuid())
    projectId       String
    parentTaskId    String?
    
    title           String
    description     String?  @db.Text
    
    status          String   @default("todo")  // todo/doing/blocked/done/cancelled
    priority        String   @default("normal") // low/normal/high/urgent
    category        String?  // schedule/quality/safety/cost/document/coordination
    
    assignedTo      String?
    reviewerId      String?
    
    dueDate         DateTime?
    completedAt     DateTime?
    
    relatedScheduleTaskId String?  // 关联到 M29 ScheduleTask
    relatedClaimId  String?  // 关联到 ClaimRecord
    relatedChangeId String?  // 关联到 ChangeOrder
    
    tags            String[]
    
    createdBy       String
    createdAt       DateTime @default(now())
    
    @@index([projectId, status, dueDate])
    @@map("project_tasks")
  }
  
  model TaskComment {
    id              String   @id @default(cuid())
    taskId          String
    userId          String
    content         String   @db.Text
    attachments     String[]
    createdAt       DateTime @default(now())
    
    @@index([taskId, createdAt])
    @@map("task_comments")
  }
  ```

- `apps/api/src/modules/project-site/task-board.service.ts`（≤ 130 行）：
  - CRUD + 看板视图（按 status 分列）/ 列表视图 / 时间线视图 切换
  - 关联到 ScheduleTask / ClaimRecord / ChangeOrder 跨模块互通

- `apps/web/src/app/projects/[id]/tasks/page.tsx`（≤ 250 行）：
  - 飞书风格 4 列看板（todo / doing / blocked / done）
  - 拖拽换状态（用 `@dnd-kit/core` 轻量库，**或纯 HTML5 drag**）
  - 卡片显示：标题 + 优先级标签 + 截止 + 头像 + 评论数
  - 点击卡片打开右侧 Sheet：详情 + 评论 + 附件
  - 顶部"切换视图"：看板 / 列表 / 时间线

- `scripts/verify-m30.ps1`（**14 条 PASS/FAIL**）：
  ```powershell
  $ErrorActionPreference = 'Stop'
  $pass = 0; $fail = 0
  function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }
  
  # 1. BaselineUnitCost + BudgetEstimate schema
  $schema = Get-Content 'prisma/schema.prisma' -Raw
  Check 'M30.1 budget schema' ($schema -match 'model BaselineUnitCost' -and $schema -match 'model BudgetEstimate' -and $schema -match 'coefficients')
  
  # 2. budget-estimator service 真公式（含 5 系数）
  $bud = Get-Content 'apps/api/src/modules/cost-estimate/budget-estimator.service.ts' -Raw
  Check 'M30.2 budget formula 5 coefficients' (
    $bud -and $bud -match 'region' -and $bud -match 'quality' -and $bud -match 'category' -and $bud -match 'structure' -and $bud -match 'time'
  )
  
  # 3. baseline CSV ≥ 100 行
  $bcsv = Get-Content 'apps/api/data/cost-baseline/seed/baseline-unit-cost.csv' -ErrorAction SilentlyContinue
  Check 'M30.3 baseline csv 100+ rows' ($bcsv -and $bcsv.Length -ge 100)
  
  # 4. QuantityIndicator schema + 粗算量 service
  Check 'M30.4 quantity schema' ($schema -match 'model QuantityIndicator' -and $schema -match 'model RoughQuantityEstimate')
  
  # 5. quantity csv ≥ 100 行
  $qcsv = Get-Content 'apps/api/data/quantity-indicators/seed/indicators.csv' -ErrorAction SilentlyContinue
  Check 'M30.5 quantity csv 100+ rows' ($qcsv -and $qcsv.Length -ge 100)
  
  # 6. PaymentLedger 5 状态闭环
  $pl = Get-Content 'apps/api/src/modules/project-site/payment-ledger.service.ts' -Raw
  Check 'M30.6 payment 5 events' (
    $pl -and $pl -match 'contract_signed' -and $pl -match 'work_completed' -and $pl -match 'invoice_issued' -and $pl -match 'payment_received'
  )
  
  # 7. ChangeOrder + ClaimRecord schema
  Check 'M30.7 change/claim schema' (
    $schema -match 'model ChangeOrder' -and $schema -match 'model ClaimRecord' -and $schema -match 'submitDeadline' -and $schema -match 'aiSuccessScore'
  )
  
  # 8. claim deadline alerts
  $cl = Get-Content 'apps/api/src/modules/project-site/claim-record.service.ts' -Raw
  Check 'M30.8 claim deadline alerts' ($cl -match 'deadline' -and ($cl -match '7|3|1|alert|notify'))
  
  # 9. CarbonFactor + CarbonEstimate schema
  Check 'M30.9 carbon schema' ($schema -match 'model CarbonFactor' -and $schema -match 'model CarbonEstimate')
  
  # 10. carbon factors CSV ≥ 30 行
  $ccsv = Get-Content 'apps/api/data/carbon-factors/seed/factors.csv' -ErrorAction SilentlyContinue
  Check 'M30.10 carbon factors 30+ rows' ($ccsv -and $ccsv.Length -ge 30)
  
  # 11. ProjectTask + TaskComment schema
  Check 'M30.11 task schema' (
    $schema -match 'model ProjectTask' -and $schema -match 'model TaskComment' -and $schema -match 'relatedScheduleTaskId'
  )
  
  # 12. task-board 看板视图
  $tb = Get-Content 'apps/web/src/app/projects/[id]/tasks/page.tsx' -Raw
  Check 'M30.12 task kanban 4 columns' ($tb -and $tb -match 'todo' -and $tb -match 'doing' -and $tb -match 'blocked' -and $tb -match 'done')
  
  # 13. 不引重型依赖
  $pkg = Get-Content 'apps/api/package.json','apps/web/package.json','apps/worker/package.json' -Raw -ErrorAction SilentlyContinue
  $hasHeavy = $pkg -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad'
  Check 'M30.13 no heavy deps' (-not $hasHeavy)
  
  # 14. typecheck
  pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
  Check 'M30.14 typecheck' ($LASTEXITCODE -eq 0)
  
  Write-Host ""
  Write-Host "M30 verify: $pass PASS / $fail FAIL"
  exit $fail
  ```

提交：

```bash
git add -A
git commit --no-verify -m "test(m30): verify 14 checks + flying book style task kanban"
git push

# 验证 + 合并
powershell -ExecutionPolicy Bypass -File scripts/verify-m30.ps1
pnpm --config.engine-strict=false typecheck

git checkout main
git pull origin main
git merge --no-ff feature/m30-core-cost-project -m "merge: feature/m30-core-cost-project into main

M30 概算 + 粗算量 + 项目部全闭环:
- 概算引擎（建筑面积 × 单方造价 × 5 系数 + 上下浮动 15%）
- 粗算量（12×5 工程量指标矩阵 + AI 合理性校验）
- 进度款 + 结算 5 状态台账（合同/完工/开票/收款/滞收）
- 变更签证 + 索赔台账（含时效倒计时 + AI 索赔成功率预测）
- 碳排放粗算（30+ 建材碳因子 + 减碳建议）
- 飞书风格 task 看板（4 列拖拽 + 跨模块互通 ScheduleTask/Claim/ChangeOrder）

填补市面 SaaS 已有 + GitHub 开源已有 + 我们漏了的 6 项核心实用功能。
verify-m30.ps1 14/14 PASS

ref: .kiro/state/M30-CORE-COST-PROJECT.md"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M30 done"
git push origin main
```

---

## 2. 6 段交付（最后给万婷婷）

完成后**只**回这 6 段：

```
1. main HEAD sha + 8 commits
2. verify-m30.ps1 输出（14/14 PASS）+ typecheck 22/22 cached
3. 6 项核心交付：
   - 概算引擎 5 系数公式 + baseline CSV 行数
   - 粗算量 12×5 矩阵 + indicators CSV 行数
   - 进度款 5 状态枚举值
   - 变更/索赔 时效倒计时实现 + AI 索赔成功率算法
   - 碳排放 factors CSV 行数 + 数据来源
   - task 看板 4 列实现库
4. 不引重型依赖检查 grep（必须 0 命中）
5. 5 个跨模块关联 grep（ProjectTask 必须含 relatedScheduleTaskId / relatedClaimId / relatedChangeId）
6. 已知限制（CSV 数据是合理估算非权威 / 索赔成功率是 AI 估算非保证 / 碳因子待权威数据集替换）
```

---

## 3. 反作弊清单 14 条

跟 verify-m30 14 条对应。万婷婷验收时按 verify 输出逐条核。

特别注意：
- ❌ 概算 5 系数不许任何一个写死 1.0
- ❌ baseline CSV 不许少于 100 行（12 类 × 5 结构 × 4 区域 = 240 应有）
- ❌ quantity CSV 不许少于 100 行（12 × 5 × 平均 12 项 = 720 应有，但起码 100）
- ❌ 索赔时效预警必须是真 cron 或事件触发，不许 hardcode
- ❌ 重型依赖一律禁

---

## 4. 一句话总结给 Codex

> 节流模式 + 不开 dev server + 不截图 + 不引重型依赖 + 6 子块 1 commit/块 + verify 14/14 + 6 段文本交付。
> 跑完了，同乾方略补齐市面 SaaS + GitHub 开源都有但我们漏了的 6 项核心实用功能。建筑老板从此可以"30 秒概算 → 粗算量心中有数 → 进度款全闭环 → 签证索赔不漏 → 碳排放有数据 → 项目任务看板"。
