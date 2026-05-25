# M29 · 轻量辅助功能扩展（DDC Skills + 闭源 SaaS 对标）

> Codex 整段读，按 6 子块顺序执行，每块 1 commit。**节流模式 + 不开 dev server + 不截图 + 不引入重型依赖**。
> 本期定位：**辅助咨询，不做专业工具**。所有功能必须满足"轻量 + 不替代专业人员 + AI 增强而不是 AI 替代"。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文（**§A 永久事实必看**）
2. `.kiro/state/GITHUB-CONSTRUCTION-AI-SCAN-2026-05-23.md`（M27 扫描报告）
3. `.kiro/state/M28-OSS-ABSORB.md`（M28 已规划的吸收）
4. `AGENTS.md` §3.7 双轨命名 + §3.8 V4 商业宪法
5. `apps/api/src/prompts/` 目录树看既有 prompt 库

**节流契约（强约束）**：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- **不开 dev server / 不真跑 docker / 不截图**
- **绝对禁止引入这些重型依赖**（违反即重做）：
  - puppeteer / playwright（headless 浏览器，启动慢 + 内存炸）
  - tensorflow / pytorch / opencv（机器学习库，Node 装不动）
  - cesium / three.js / forge-viewer（3D 引擎，前端炸）
  - revit-sdk / autocad-api / forge-design-automation（CAD SDK，要 license）
  - n8n / temporal / airflow（工作流引擎，太重）
- ✅ 允许的轻量依赖：`docx` / `exceljs` / `pptxgenjs` / `csv-parse` / `pdf-parse`（仅文本抽取）/ `chart.js`（前端）
- LOAD ≤ 6 / CODE ≤ 16 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 6 文件 / ≤ 600 行 / 1 commit

**核心红线**（万婷婷 2026-05-23 明确指令）：
- ❌ 不做专业工具（不替代造价师 / 律师 / 安全工程师）
- ❌ 不做太深入的专业分析（如 BIM 模型解析、CAD 真识别、3D 渲染）
- ✅ 只做**咨询辅助**：让老板 / 智能管家 / 政企用户在 30 秒内得到一个**专业人员可以用的初稿 / 检查清单 / 风险提示**
- ✅ 所有功能必须含 disclaimer + Tier 徽章 + 5 引导按钮（V4 §3.8）

**双轨命名**：用户可见层中文，代码层英文，**绝不"中介"**。

---

## 1. DDC 221 个 Skill 中挑出的 30 个轻量对位

我把 DDC 5 个分类下的 221 个 Skill 跟同乾方略业务 + 国内闭源 SaaS（广联达 / 鲁班 / 品茗 / 飞书 / 钉钉 / 企查查 等）对比，挑出 **30 个真正轻量 + 真正辅助 + 真正能落地的**：

| # | 来源 | DDC Skill 名 | 同乾方略落地点 | 轻量等级 | 闭源 SaaS 对标 |
|---|---|---|---|---|---|
| 1 | DDC Toolkit | semantic-search-cwicr | 造价子目语义查询（M28 已纳） | 轻 | 广联达计价云 |
| 2 | DDC Toolkit | estimate-builder | 造价从模板生成（M28 已纳） | 轻 | 广联达 |
| 3 | DDC Insights | n8n-daily-report | 日报自动汇总（**M29 新加**） | 轻（不引 n8n） | 钉钉智能日报 |
| 4 | DDC Insights | n8n-photo-report | 现场照片智能分组（**M29 新加**） | 中（用既有 OCR） | 品茗安全 |
| 5 | DDC Curated | pdf-pptx-generation | 报告 4 格式导出（M28 已纳） | 轻 | 广联达汇报 |
| 6 | DDC Curated | quality-checks | 报告自检（M28 已纳） | 轻 | — |
| 7 | DDC Book | data-silo-detection | 客户数据健康度自检（**M29 新加**） | 轻 | — |
| 8 | DDC Book | kpi-dashboard | 老板 KPI 看板（已有 + 增强） | 轻 | 飞书 |
| 9 | DDC Innovative | risk-assessment | 项目级综合风险评分（**M29 新加**） | 中 | 鲁班造价风险 |
| 10 | DDC Innovative | defect-detection | 验收/质量缺陷照片提示（**M29 新加**） | 中（DeepSeek-VL） | 品茗安全 |

**剩余 191 个 Skill 不抄**：BIM 解析 / IFC 转换 / 3D 渲染 / 数字孪生 / IoT 传感器 / Revit 插件 等都太专业 + 太重，**违反万婷婷"只做咨询辅助"红线**。

---

## 2. 闭源 SaaS 调研补充（同乾方略可吸收的轻量功能）

| 闭源 SaaS | 我们没有的功能 | M29 是否纳 | 理由 |
|---|---|---|---|
| 广联达 BIM5D | 进度计划甘特图 + 关键路径 | ✅ 子块 1 | M22 项目部增强，纯前端 chart.js 实现 |
| 鲁班造价 | 历史项目造价对比 | ✅ 子块 2 | 复用 CostCatalog（M28），加历史项目维度 |
| 品茗安全 | 安全交底自动生成 | ✅ 子块 3 | M22 项目部加 prompt，纯文本生成 |
| 飞书项目 | 周报模板 + AI 总结 | ✅ 子块 4 | 钩子 12.6 灵感卡的延伸 |
| 钉钉智能日报 | 日报自动汇总 | ✅ 子块 4 | 同上 |
| 企查查 | 客户尽调一键查 | ✅ 子块 5 | 复用 TIANYANCHA_API_KEY 凭证（admin 已有） |
| 法大大 | 合同 e 签 webhook | ❌ 不纳 | 涉及电子签名合规，**专业工具**红线 |
| 工程造价数据中心 | 信息价 / 市场价对比 | ❌ 不纳 | 数据采购成本太高，V2 |
| Procore | BIM 协同 | ❌ 不纳 | **专业工具**红线 |
| Autodesk Construction Cloud | 图纸版本管理 | ❌ 不纳 | 太重，V2 |

**结论**：M29 加 **5 个轻量辅助功能**：
1. 进度计划甘特图（前端 chart.js + 关键路径标记）
2. 历史项目造价对比（基于 CostCatalog）
3. 安全交底 / 技术交底自动生成（prompt + 模板）
4. 日报 / 周报 / 月报 AI 总结
5. 客户尽调一键查（接 TIANYANCHA + AI 解读 + 风险标记）

---

## 3. 子块拆解（6 子块 × 1 commit）

### 子块 1 · 进度计划甘特图 + 关键路径（commit 1）

**目标**：M22 项目部加进度计划页，让老板看到工期 / 关键节点 / 滞后预警。

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `ProjectSchedule` + `ScheduleTask`：
  ```prisma
  model ProjectSchedule {
    id              String   @id @default(cuid())
    projectId       String
    title           String   @default("主进度计划 v1")
    version         Int      @default(1)
    startDate       DateTime
    endDate         DateTime
    status          String   @default("active") // active | archived
    tenantId        String
    createdAt       DateTime @default(now())
    
    tasks           ScheduleTask[]
    
    @@index([projectId])
    @@map("project_schedules")
  }
  
  model ScheduleTask {
    id              String   @id @default(cuid())
    scheduleId      String
    parentId        String?
    name            String
    plannedStart    DateTime
    plannedEnd      DateTime
    actualStart     DateTime?
    actualEnd       DateTime?
    progressPct     Int      @default(0)  // 0-100
    isCriticalPath  Boolean  @default(false)
    dependencies    String[] // 前置任务 ID 数组
    
    schedule        ProjectSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
    parent          ScheduleTask? @relation("TaskHierarchy", fields: [parentId], references: [id])
    children        ScheduleTask[] @relation("TaskHierarchy")
    
    @@index([scheduleId])
    @@map("schedule_tasks")
  }
  ```

- `apps/api/src/modules/project-site/schedule.service.ts`（新建 ≤ 150 行）：
  - `createSchedule(input)` / `addTask(scheduleId, task)` / `updateProgress(taskId, pct, actualStart?, actualEnd?)`
  - `computeCriticalPath(scheduleId)`：纯 JS 实现 CPM 算法（前向/后向计算，≤ 60 行），标记 `isCriticalPath`
  - `getDelayReport(scheduleId)`：返回滞后任务列表 + 影响关键路径的预警

- `apps/api/src/prompts/project/schedule-risk-advisor.prompt.ts`（≤ 100 行）：
  - 输入：滞后任务清单 + 关键路径
  - 输出：3-5 条建议（如"任务 A 滞后 5 天，建议加快 B、C 工序，否则总工期推迟 8 天"）+ disclaimer

- `apps/web/src/app/projects/[id]/schedule/page.tsx`（≤ 200 行）：
  - 用 `chart.js` 或纯 SVG 画甘特图（**禁止引 gantt-task-react 等重型库**）
  - 关键路径用红色高亮
  - 点击任务弹 drawer 编辑实际进度
  - 顶部"AI 风险提示"按钮 → 调 schedule-risk-advisor

- `apps/api/src/modules/project-site/project-site.controller.ts` 加 5 个 endpoint：
  - `POST /api/v1/projects/:id/schedules`
  - `POST /api/v1/projects/:id/schedules/:scheduleId/tasks`
  - `PATCH /api/v1/projects/:id/schedules/:scheduleId/tasks/:taskId/progress`
  - `GET /api/v1/projects/:id/schedules/:scheduleId/critical-path`
  - `POST /api/v1/projects/:id/schedules/:scheduleId/risk-advisor`

提交：`git checkout -b feature/m29-lightweight && git add -A && git commit --no-verify -m "feat(m29): project schedule gantt + critical path + ai risk advisor"; git push -u origin feature/m29-lightweight`

---

### 子块 2 · 历史项目造价对比（commit 2）

**目标**：在 M28 CostCatalog 基础上加"历史项目维度"，让老板上传新项目预估时能跟自己历史项目对比。

**文件清单（≤ 4）**：

- `prisma/schema.prisma` 加 model `HistoricalProjectCost`：
  ```prisma
  model HistoricalProjectCost {
    id              String   @id @default(cuid())
    tenantId        String
    projectName     String
    projectType     String   // 房建 / 市政 / 装饰 / 安装 / 其他
    region          String
    areaSqm         Float
    totalCostCny    Decimal  @db.Decimal(20, 2)
    unitCostCnyPerSqm Decimal @db.Decimal(20, 2)
    breakdown       Json     // { labor, material, machinery, overhead, profit, tax } 比例
    completedAt     DateTime
    notes           String?  @db.Text
    
    @@index([tenantId, projectType, region])
    @@map("historical_project_costs")
  }
  ```

- `apps/api/src/modules/cost-estimate/historical-cost.service.ts`（新建 ≤ 100 行）：
  - `addHistoricalProject(input)` 录入
  - `compareWithHistorical(input: { projectType, region, areaSqm, totalCostCny }): Promise<{ similar: HistoricalProjectCost[], deviation: { lowest, median, highest, current_vs_median }, riskLevel }>` 找同类型同地区项目对比，算偏离度
  - 偏离度 < -20% 标"明显低于历史"（红 — 可能漏项）；> +20% 标"明显高于历史"（黄 — 可能虚报）

- `apps/api/src/prompts/cost/cost-vs-historical.prompt.ts`（≤ 80 行）：
  - AI 分析偏离原因（人材机比例 / 地区差 / 时间差），给改进建议

- `apps/web/src/app/cost-estimates/[id]/historical-compare/page.tsx`（≤ 150 行）：
  - 当前项目 vs 历史项目散点图
  - 高亮相似项目 + 偏离度文字
  - 点击"AI 解读"按钮调 prompt

提交：`git add -A && git commit --no-verify -m "feat(m29): historical project cost comparison with deviation flag"; git push`

---

### 子块 3 · 安全交底 / 技术交底自动生成（commit 3）

**目标**：M22 项目部加交底文档生成器，工人现场扫码看视频版（V2 加视频）。

**文件清单（≤ 4）**：

- `apps/api/src/prompts/safety/safety-briefing.prompt.ts`（≤ 200 行）：
  - taskType: `AiTaskType.SAFETY_BRIEFING`
  - inputSchema: `{ workType: string, // 高处作业 / 用电 / 起重 / 焊接 / 脚手架 / 模板 / 钢筋 / 混凝土 / 砌筑 / 防水 等 20 类
                    siteCondition: string,
                    weather?: string,
                    seasonalRisk?: 'rainy' | 'spring' | 'winter' | 'summer' }`
  - outputSchema: `{ title, applicableScope, riskPoints: Array<{level, point, prevention}>, requiredPpe, emergencyContacts, signOffSlot, regulationRefs, disclaimer }`
  - few-shot ≥ 3（高处 / 用电 / 焊接）
  - 必须引用 GB 50870 / GB 50202 等安全规范条款号
  - 红线：禁绝对化（"必须 / 一定 / 绝对"），用"应当 / 建议 / 通常做法"

- `apps/api/src/prompts/technical/technical-briefing.prompt.ts`（≤ 150 行）：
  - 类似结构但侧重工艺参数（混凝土养护 / 钢筋绑扎 / 模板支设 等）
  - 引用 GB 50204 / GB 50203 等施工规范

- `apps/api/src/modules/project-site/briefing.service.ts`（≤ 100 行）：
  - `generateSafetyBriefing(input)` / `generateTechnicalBriefing(input)`
  - 自动写入 `construction_logs` 表（既有 M22 schema）
  - 生成签到二维码（用 `qrcode` 轻量包，已在 package.json 不引新）
  - 工人扫码进 H5 → 看交底 → 电子签名

- `apps/web/src/app/projects/[id]/briefings/page.tsx`（≤ 200 行）：
  - 列表：交底类型 + 适用工序 + 已签到/总人数
  - 顶部"生成新交底"按钮 → 选 workType → AI 生成 → 二维码 + PDF 导出

提交：`git add -A && git commit --no-verify -m "feat(m29): safety + technical briefing auto generator with qrcode signoff"; git push`

---

### 子块 4 · 日报 / 周报 / 月报 AI 总结（commit 4）

**目标**：飞书项目 / 钉钉智能日报 对位。从既有数据自动汇总成可读报告。

**文件清单（≤ 4）**：

- `apps/api/src/prompts/report/daily-summary.prompt.ts`（≤ 150 行）：
  - 输入：`{ tenantId, projectId, date, dataPoints: { tendersWon, tendersLost, contractsSigned, riskAlerts, payments, attendance, weather } }`
  - 输出：`{ headline, highlights: string[], lowlights: string[], todayActions: string[], tomorrowFocus: string[], confidence, disclaimer }`
  - 风格：克制、信息密度高（参考 ui-visual-spec.md 飞书风格）

- `apps/api/src/prompts/report/weekly-summary.prompt.ts`（≤ 150 行，类似）：
  - 输入更多周期性指标 + 趋势对比
  - 输出含 5 引导按钮（继续 / 部分完成 / 调整目标 / 升级求助 / 暂停）

- `apps/api/src/prompts/report/monthly-summary.prompt.ts`（≤ 180 行）：
  - 含同行 PK + 上月对比 + 下月展望

- `apps/api/src/modules/report-center/auto-summary.service.ts`（≤ 150 行）：
  - 3 个生成方法，自动从既有 service（dashboard / tender / contract / cashflow）拉数据
  - 每天 06:30 cron 自动生成日报推送公众号（复用 M27 通知通道）
  - 每周一 07:00 周报；每月 1 日 08:00 月报

- 新增 endpoint：
  - `GET /api/v1/reports/auto/daily?date=YYYY-MM-DD`
  - `GET /api/v1/reports/auto/weekly?week=YYYY-WW`
  - `GET /api/v1/reports/auto/monthly?month=YYYY-MM`

提交：`git add -A && git commit --no-verify -m "feat(m29): auto daily/weekly/monthly summary with cron push"; git push`

---

### 子块 5 · 客户尽调一键查（commit 5）

**目标**：企查查对位。智能管家 / 老板新接客户前 1 分钟尽调。

**文件清单（≤ 4）**：

- `apps/api/src/modules/customer-due-diligence/due-diligence.service.ts`（新建 ≤ 130 行）：
  - `dueDiligence(input: { companyName: string }): Promise<DueDiligenceReport>`
  - 内部串行调：
    1. tianyancha API（凭证已在 admin/credentials） — 拉公司基本信息 / 法人 / 注册资本 / 经营状态
    2. creditchina（M26 已抓数据，本地查） — 失信被执行人 / 行政处罚
    3. 内部库 — 是否同行黑名单（platform 维度）
  - 调 `due-diligence.prompt.ts` AI 综合解读 + 风险评分
  - 输出 `DueDiligenceReport`：基本信息 + 失信记录 + 处罚记录 + 综合风险等级（红/黄/绿）+ 是否建议合作

- `apps/api/src/prompts/customer/due-diligence.prompt.ts`（≤ 150 行）：
  - 输入：tianyancha 数据 + creditchina 数据 + 内部黑名单
  - 输出：综合分析 + 5 条建议（如"建议要求 50% 预付款 / 建议要求银行履约保函 / 建议公司层亲自把关合同"）+ Tier 徽章 + 5 引导按钮

- `apps/api/src/modules/customer-due-diligence/due-diligence.controller.ts`（≤ 60 行）：
  - `POST /api/v1/customer-dd` body `{companyName}` → 走 5 点扣点（V4 §3.8 商业宪法 ¥0.05 成本，每次 5 点）→ 返回报告

- `apps/web/src/app/customer-dd/page.tsx`（≤ 150 行）：
  - 输入框 + "查"按钮
  - 结果卡片：5 块（基本信息 / 失信 / 处罚 / 综合评分 / AI 建议）
  - 顶部 Tier 徽章 + 信心度

提交：`git add -A && git commit --no-verify -m "feat(m29): customer due diligence with tianyancha + creditchina + ai"; git push`

---

### 子块 6 · 现场照片智能分组 + verify-m29（commit 6）

**目标**：DDC `n8n-photo-report` 对位 + 品茗安全对位。工人上传照片，AI 自动分组（基础 / 主体 / 装饰 / 安装 / 安全隐患）+ 缺陷检测。

**文件清单（≤ 5）**：

- `prisma/schema.prisma` 加 model `SitePhoto`：
  ```prisma
  model SitePhoto {
    id              String   @id @default(cuid())
    projectId       String
    ossUrl          String
    uploadedBy      String
    uploadedAt      DateTime @default(now())
    category        String?  // foundation/structure/finishing/mep/safety/quality_defect/other
    aiTags          String[] // AI 抽出的标签
    aiSummary       String?  @db.Text
    defectFound     Boolean  @default(false)
    defectLevel     String?  // low/mid/high
    geoLat          Float?
    geoLng          Float?
    
    @@index([projectId, category])
    @@map("site_photos")
  }
  ```

- `apps/api/src/prompts/site/photo-classifier.prompt.ts`（≤ 130 行）：
  - 多模态 prompt（DeepSeek-VL 或 Qwen-VL）
  - 输入：照片 URL
  - 输出：`{ category, aiTags, aiSummary, defectFound, defectLevel?, defectDetail? }`
  - few-shot ≥ 3（含一个缺陷照片）

- `apps/api/src/modules/project-site/photo.service.ts`（≤ 100 行）：
  - `uploadAndClassify(input)` 上传 + 异步触发 AI 分类
  - `dailyPhotoSummary(projectId, date)` 当天照片汇总
  - 自动写入 `construction_logs`

- `apps/api/src/modules/project-site/project-site.controller.ts` 加：
  - `POST /api/v1/projects/:id/photos`（multipart）
  - `GET /api/v1/projects/:id/photos?category=` 列表
  - `GET /api/v1/projects/:id/photos/daily-summary?date=`

- `scripts/verify-m29.ps1`（**12 条 PASS/FAIL**）：
  ```powershell
  $ErrorActionPreference = 'Stop'
  $pass = 0; $fail = 0
  function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }

  # 1. ProjectSchedule + ScheduleTask schema
  $schema = Get-Content 'prisma/schema.prisma' -Raw
  Check 'M29.1 schedule schema' ($schema -match 'model ProjectSchedule' -and $schema -match 'model ScheduleTask' -and $schema -match 'isCriticalPath')

  # 2. CPM 算法真实现（不只是赋默认值）
  $sched = Get-Content 'apps/api/src/modules/project-site/schedule.service.ts' -Raw
  Check 'M29.2 CPM algorithm' ($sched -match 'computeCriticalPath' -and $sched -match 'forward|backward|earliest|latest' -and ($sched -match 'dependencies'))

  # 3. 历史项目对比 schema
  Check 'M29.3 HistoricalProjectCost' ($schema -match 'model HistoricalProjectCost' -and $schema -match 'unitCostCnyPerSqm')

  # 4. 偏离度计算
  $hist = Get-Content 'apps/api/src/modules/cost-estimate/historical-cost.service.ts' -Raw
  Check 'M29.4 deviation logic' ($hist -match 'deviation' -and $hist -match '0\.2|20')

  # 5. 安全交底 + 技术交底 prompt
  Check 'M29.5 briefings prompts' (
    (Test-Path 'apps/api/src/prompts/safety/safety-briefing.prompt.ts') -and
    (Test-Path 'apps/api/src/prompts/technical/technical-briefing.prompt.ts')
  )

  # 6. 安全交底 ≥ 3 fewshots + 引用 GB 规范
  $sb = Get-Content 'apps/api/src/prompts/safety/safety-briefing.prompt.ts' -Raw
  $sbShots = ([regex]::Matches($sb, "name:\s*'")).Count
  Check 'M29.6 safety briefing 3+ shots + GB ref' ($sbShots -ge 3 -and $sb -match 'GB\s*\d+')

  # 7. 日 / 周 / 月报 prompt
  Check 'M29.7 daily/weekly/monthly prompts' (
    (Test-Path 'apps/api/src/prompts/report/daily-summary.prompt.ts') -and
    (Test-Path 'apps/api/src/prompts/report/weekly-summary.prompt.ts') -and
    (Test-Path 'apps/api/src/prompts/report/monthly-summary.prompt.ts')
  )

  # 8. auto-summary cron 注册
  $auto = Get-Content 'apps/api/src/modules/report-center/auto-summary.service.ts' -Raw
  Check 'M29.8 auto-summary cron' ($auto -and $auto -match 'cron|@Cron|06:30|07:00')

  # 9. 客户尽调 service 真接 tianyancha
  $dd = Get-Content 'apps/api/src/modules/customer-due-diligence/due-diligence.service.ts' -Raw
  Check 'M29.9 due-diligence inject tianyancha + creditchina' ($dd -and $dd -match 'tianyancha' -and $dd -match 'creditchina')

  # 10. SitePhoto + 多模态 prompt
  Check 'M29.10 site photo + multimodal' (
    ($schema -match 'model SitePhoto' -and $schema -match 'defectFound') -and
    (Test-Path 'apps/api/src/prompts/site/photo-classifier.prompt.ts')
  )

  # 11. 不引重型依赖
  $pkg = Get-Content 'apps/api/package.json','apps/web/package.json','apps/worker/package.json' -Raw -ErrorAction SilentlyContinue
  $hasHeavy = $pkg -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n'
  Check 'M29.11 no heavy deps' (-not $hasHeavy)

  # 12. typecheck
  pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
  Check 'M29.12 typecheck' ($LASTEXITCODE -eq 0)

  Write-Host ""
  Write-Host "M29 verify: $pass PASS / $fail FAIL"
  exit $fail
  ```

- `.kiro/state/M29-LIGHTWEIGHT-DONE.md`：HEAD + verify 输出 + 6 个新功能落地点 + 没纳入的功能列表（说明为何）

提交：

```bash
git add -A
git commit --no-verify -m "test(m29): verify 12 checks + photo classifier + done memo"
git push

# 全套验证
powershell -ExecutionPolicy Bypass -File scripts/verify-m29.ps1
pnpm --config.engine-strict=false typecheck

# 12/12 PASS + typecheck 22/22 才合并
git checkout main
git pull origin main
git merge --no-ff feature/m29-lightweight -m "merge: feature/m29-lightweight into main

M29 轻量辅助功能扩展:
- 进度计划甘特图 + CPM 关键路径 + AI 风险预警
- 历史项目造价对比 + 偏离度自动标记
- 安全交底 / 技术交底 AI 生成 + 二维码签到
- 日 / 周 / 月报 AI 自动总结 + cron 推送
- 客户尽调（tianyancha + creditchina + AI 综合评分）
- 现场照片 AI 分类 + 缺陷检测

不纳入: BIM 解析 / IFC / Cesium 3D / Revit / IoT / 数字孪生（违反万婷婷'只做咨询辅助'红线）
verify-m29.ps1 12/12 PASS

ref: .kiro/state/M29-LIGHTWEIGHT.md"

git push origin main

# 更新 memory §1 + §5 加 M29
git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M29 done"
git push origin main
```

---

## 4. 6 段交付（最后给万婷婷）

完成后**只**回这 6 段：

```
1. main HEAD sha + 8 个 commit message（6 子块 + merge + memory）
2. verify-m29.ps1 输出（12/12 PASS）+ typecheck 22/22 cached
3. 6 个新功能落地点：
   - 进度甘特图前端用什么库实现 / CPM 算法行数
   - 历史项目对比偏离度阈值 / 散点图实现
   - 安全 + 技术交底各引用几条 GB 规范
   - 日 / 周 / 月报 cron 时间 + 数据源
   - 客户尽调串行调几个外部接口 / 单次扣多少点
   - 照片分类 + 缺陷检测用哪个多模态模型
4. 不纳入清单（≥ 8 项专业重型功能 + 各自不纳入理由）
5. 重型依赖检查 grep 结果（必须 0 命中 puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n）
6. 5 引导按钮 + Tier 徽章 + disclaimer 在 6 个新 prompt 中的覆盖率（必须 100%）
```

---

## 5. 反作弊清单（万婷婷验收）

1. ✅ 7-8 commits（6 子块 + merge + memory）
2. ✅ verify 12/12 PASS + typecheck 22/22 cached
3. ✅ CPM 算法真实现（grep 含 forward/backward/earliest/latest 至少 1 个关键词）
4. ✅ 偏离度阈值 ±20%（grep 0.2 或 20）
5. ✅ 安全交底 ≥ 3 fewshots + 引用 GB 规范号
6. ✅ auto-summary 必须含 cron 注解
7. ✅ 客户尽调真 inject tianyancha + creditchina（不许 mock）
8. ✅ SitePhoto schema 含 defectFound + 多模态 prompt 真存在
9. ✅ **无重型依赖**：grep 6 个仓库 package.json 不能含 puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n
10. ✅ 6 个新 prompt 全部含 disclaimer + tier + 5 引导按钮
11. ✅ 不动 ai-gateway / 不重构现有模块
12. ✅ 不删除 M28 任何已写代码（只增量加）

---

## 6. 一句话总结给 Codex

> 节流模式 + 不开 dev server + 不截图 + 不引重型依赖 + 6 子块 1 commit/块 + verify 12/12 + 6 段文本交付。
> 跑完了，同乾方略从"咨询品牌 + AI 工具" 变成 "咨询品牌 + AI 工具 + 项目部数字化助手"。但仍**只是辅助咨询**，不替代造价师 / 律师 / 安全工程师。
