# M37 · 高频增量（services 乱码 + 图纸轻量 + 规范 RAG + 催款多通道 + 跨项目预警 + 项目经理 H5）

> Codex 整段读，按 7 子块顺序，每块 1 commit。**节流模式 + 不开 dev server（除子块 7 puppeteer 一次）+ 不引重型依赖（puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad 一律禁）**。
>
> 本期定位：**严格增量不重构，让老板 / 项目经理高频调 AI**（万婷婷自建 token 中转站，调用频率 = 收入）。

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`
2. `AGENTS.md` §3.7 双轨 + §3.8 V4 商业宪法
3. `.kiro/state/M27-LEGAL-CORPUS-RULE-GEN.md`（M27 法律语料骨架，本期扩 GB 规范族）
4. `apps/web/src/app/services/page.tsx` 第 4 行（**bug 现场**：??????  hardcode 数组）
5. `apps/api/src/modules/cashflow-finance/cashflow-finance.service.ts`（M21 既有催款）
6. `apps/api/src/modules/notification/notification.module.ts`（既有通知通道）

**节流契约**（强约束）：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- 不开 dev server（子块 7 puppeteer 一次截图除外）
- 不引重型依赖（特别强调：**禁 BIM SDK / Revit / AutoCAD / Cesium / ComfyUI**）
- 允许的轻量依赖：`react-pdf`（PDF 看图，已在）/ `pdfjs-dist`（PDF 文本提取）/ 既有所有
- LOAD ≤ 6 / CODE ≤ 16 / VERIFY ≤ 4 / COMMIT ≤ 6（**单子块**）
- 每子块 ≤ 7 文件 / ≤ 600 行 / 1 commit

**核心红线**（万婷婷 2026-05-26 明确）：
- ❌ 不重构（M0-M36 已冻结，只增量）
- ❌ 不做 ComfyUI / 户型图 / 室内 redesign / 效果图（家装活）
- ❌ 不做真 BIM 解析（重型依赖）
- ✅ 做轻量 PDF 看图 + AI 解读截图（多模态）
- ✅ 让项目经理也调 AI（赚 token 差价）

---

## 1. 7 子块拆解

### 子块 1 · services 乱码修 + 全仓 ???? 扫描（必做）

**bug 现场**：
```typescript
// apps/web/src/app/services/page.tsx 第 4 行
const services = ['??????','?????','??????','?????','??????','????',
                  '??????','??????','??????','??????'];
```

**操作**：
1. 改 `apps/web/src/app/services/page.tsx`：services 数组写真实文案（参考 design/stitch/_13/code.html，10 项是同乾方略服务货架）：
   ```typescript
   const services = [
     { name: '化债策略咨询', priceRange: '¥50万起', deliverables: ['方案书', '路线图'] },
     { name: 'ABS / REITs 框架', priceRange: '¥100万起', deliverables: ['框架图', '评估报告'] },
     { name: '央国企融资路径', priceRange: '¥30-100万', deliverables: ['路径图', '材料清单'] },
     { name: '专项债申报', priceRange: '¥30万起', deliverables: ['申报书', '反馈追踪'] },
     { name: '工程款 ABS 包装', priceRange: '¥50-150万', deliverables: ['资产包', '券商对接'] },
     { name: '上市辅导（建工）', priceRange: '¥200万起', deliverables: ['整体方案', '券商引荐'] },
     { name: '资质升级一级', priceRange: '¥80万起', deliverables: ['人员清单', '业绩材料'] },
     { name: '特级资质规划', priceRange: '¥300万起', deliverables: ['路径', '业绩布局'] },
     { name: '混改 / 国资入股', priceRange: '¥100万起', deliverables: ['估值', '方案'] },
     { name: '产业园招商配套', priceRange: '¥50万起', deliverables: ['方案', '资源对接'] },
   ];
   ```

2. 全仓 grep `\?{4,}` 找其他漏网（如发现继续修）

3. 改 `scripts/visual-lint.mjs` 加 R10 规则：禁止 hardcode `'????'` 这类 4+ 个连续 `?` 字符串

**反作弊**：
- ❌ 服务货架 10 项必须写真实文案（不许复制粘贴占位）
- ❌ 不许 `// visual-lint-disable`

提交：`git checkout -b feature/m37-increments && git add -A && git commit --no-verify -m "fix(m37): services placeholder gibberish + R10 visual-lint forbid 4plus question marks"; git push -u origin feature/m37-increments`

---

### 子块 2 · PDF 图纸轻量看 + AI 截图问

**目标**：项目经理上传 PDF 图纸，能页内放大 / 标记 / 截图问 AI（多模态识别工程内容 + 规范条款）

**文件清单（≤ 7）**：

- `prisma/schema.prisma` 加 model `Drawing` + `DrawingAnnotation`：
  ```prisma
  model Drawing {
    id              String   @id @default(cuid())
    tenantId        String
    projectId       String
    name            String
    pdfOssUrl       String
    pageCount       Int
    version         Int      @default(1)
    parentDrawingId String?  // 用于版本对比
    uploadedBy      String
    uploadedAt      DateTime @default(now())
    
    @@index([projectId, version])
    @@map("drawings")
  }
  
  model DrawingAnnotation {
    id              String   @id @default(cuid())
    drawingId       String
    pageNumber      Int
    boundingBox     Json     // { x, y, width, height } 截图区域
    snapshotOssUrl  String?  // 截图 OSS URL
    aiAnalysis      String?  @db.Text  // AI 解读结果
    aiConfidence    Float?
    userNote        String?
    createdBy       String
    createdAt       DateTime @default(now())
    
    @@index([drawingId, pageNumber])
    @@map("drawing_annotations")
  }
  ```

- `apps/api/src/modules/drawing/drawing.service.ts`（新建 ≤ 130 行）：
  - `uploadDrawing(input)` 上传到 OSS + 提取页数（用 pdf-parse 或既有 OCR 模块）
  - `addAnnotation(input)` 保存截图 + 调 AI 多模态解读
  - `compareVersions(v1Id, v2Id)` 文本 diff + AI 总结变更
  - 列表 / 详情

- `apps/api/src/prompts/drawing/drawing-snapshot-explain.prompt.ts`（新建 ≤ 130 行）：
  - taskType: `AiTaskType.DRAWING_SNAPSHOT_EXPLAIN`
  - inputSchema: `{ snapshotUrl: string, contextNote?: string, projectType?: string }`
  - outputSchema: `{ workType, regulationRefs: Array<{ code, clauseRef }>, qualityChecklist: string[], commonRisks: string[], confidence, disclaimer }`
  - primaryModel: `qwen-vl-max` 或 `deepseek-vl`（看 ai-gateway 既有多模态 provider 注册）
  - few-shot ≥ 3（钢筋绑扎 / 模板支设 / 防水节点）
  - 禁绝对化 + disclaimer + Tier 2

- `apps/api/src/prompts/drawing/drawing-version-diff.prompt.ts`（新建 ≤ 100 行）：
  - 输入：v1 + v2 的 OCR 文本
  - 输出：变更点列表 + 影响评估 + 建议关注

- `apps/web/src/app/projects/[id]/drawings/page.tsx`（新建 ≤ 200 行）：
  - 列表（按 version 分组）+ 上传按钮
  - 点击进入 PDF 查看器
  - 用 `react-pdf` 渲染（**已在依赖**：检查 packages/ui 有没有，没有就加 `pnpm --filter @tongqian/web add react-pdf pdfjs-dist`）

- `apps/web/src/app/projects/[id]/drawings/[drawingId]/page.tsx`（新建 ≤ 250 行）：
  - 左：PDF 渲染 + 缩放 + 翻页
  - 右上："截图问 AI" 按钮 → 用 canvas 截当前可见区 → 调 drawing-snapshot-explain
  - 右下：标注历史列表
  - 顶部"对比版本" → 选另一版本 → 跳到 diff 页

- `apps/web/src/app/projects/[id]/drawings/[drawingId]/diff/[v2Id]/page.tsx`（新建 ≤ 150 行）：
  - 左 v1 / 右 v2 同页对比
  - 底部 AI 变更总结卡

**多模态调用**：复用 ai-gateway，**不引新 SDK**。

**反作弊**：
- ❌ 不引重型依赖（grep 验证 puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad/three/fabric 全 0 命中）
- ❌ 不做 BIM / IFC 解析
- ❌ react-pdf / pdfjs-dist 是允许的轻量包（前端 PDF 渲染标准）
- ✅ 多模态 prompt 必须含 disclaimer + Tier + confidence

提交：`git add -A && git commit --no-verify -m "feat(m37): pdf drawing viewer + ai snapshot explain + version diff"; git push`

---

### 子块 3 · 建筑规范 RAG 快查（GB 系列）

**目标**：扩 M27 法律语料骨架到施工规范族（GB50300/50204/50202/50205/50206/50208/50210/50207），老板 / 项目经理一句话查规范。

**文件清单（≤ 5）**：

- `apps/api/data/legal-corpus/seed/metadata.json` 加 8 个 GB 规范条目（已有 6 个权威文本，扩到 14 个）：
  ```json
  // 追加 8 项
  { "code": "GB50300-2013", "title": "建筑工程施工质量验收统一标准", ... },
  { "code": "GB50204-2015", "title": "混凝土结构工程施工质量验收规范", ... },
  { "code": "GB50202-2018", "title": "建筑地基基础工程施工质量验收标准", ... },
  // ... 共 8 个
  ```

- `apps/api/src/prompts/regulation/regulation-quick-query.prompt.ts`（新建 ≤ 130 行）：
  - taskType: `AiTaskType.REGULATION_QUICK_QUERY`
  - inputSchema: `{ question: string, role?: 'boss' | 'pm' | 'agent' }`
  - outputSchema: `{ answer: string, citations: Array<{ code, clauseRef, excerpt }>, checklist: string[], relatedQuestions: string[], confidence, disclaimer }`
  - 内部先调 RAG（既有 M27 dedup + simhash + jaccard 检索）找相关条款 → 喂给 DeepSeek 答
  - few-shot ≥ 4（"屋面防水验收要求" / "钢筋绑扎规范" / "脚手架搭设" / "幕墙安装"）

- `apps/api/src/modules/knowledge/regulation-rag.service.ts`（新建 ≤ 100 行）：
  - `quickQuery(question, role): Promise<RegulationAnswer>`
  - 内部调 RAG search → AI 答 → 写 audit log

- `apps/web/src/app/regulations/page.tsx`（新建 ≤ 180 行）：
  - 顶部大搜索框（占满宽度）+ "热门问题" 标签云（10 个常见问题）
  - 输入问题 → 流式回答 + 引用列表 + checklist
  - 底部"近 5 次查询历史"

- `apps/agent/src/app/regulations/page.tsx`（同样的页给智能管家用，简化版 ≤ 100 行）

**赚 token 差价点**：每次问 10 点（约 ¥0.10），高频小消耗，老板 / 项目经理 / 智能管家都会用。

提交：`git add -A && git commit --no-verify -m "feat(m37): regulation rag quick query for gb construction standards"; git push`

---

### 子块 4 · 催款多通道一键群发

**目标**：M21 既有催款函生成，加 4 通道（短信 / 微信公众号 / 企微 / 邮件）一键群发。

**文件清单（≤ 4）**：

- `apps/api/src/modules/cashflow-finance/multi-channel-reminder.service.ts`（新建 ≤ 130 行）：
  - `sendBulkReminder(input: { receivableIds, channels, templateLevel: 'gentle' | 'formal' | 'final' }): Promise<BulkSendResult>`
  - 调既有 NotificationDispatcherService 4 通道
  - 每条记录写 `reminder_sends` 表（追溯：哪个客户 / 哪个通道 / 何时发 / 是否已读）
  - 限频（同一客户 24h 内同一通道 ≤ 1 次）

- `prisma/schema.prisma` 加 model `ReminderSend`：
  ```prisma
  model ReminderSend {
    id              String   @id @default(cuid())
    tenantId        String
    receivableId    String
    customerName    String
    channel         String   // sms/wechat_mp/wechat_work/email
    templateLevel   String   // gentle/formal/final
    content         String   @db.Text
    sentAt          DateTime @default(now())
    readAt          DateTime?
    repliedAt       DateTime?
    
    @@index([tenantId, receivableId, sentAt])
    @@map("reminder_sends")
  }
  ```

- `apps/web/src/app/cashflow/reminders/page.tsx`（新建 ≤ 200 行）：
  - 上方筛选：账龄 30+ / 60+ / 90+ 天的应收
  - 中间表格：勾选要催的客户（最多 50 条 / 次）
  - 右侧：选 4 通道（多选）+ 模板等级 + AI 个性化语气 → "一键群发"
  - 底部：发送历史 + 阅读率 + 回复率统计

- `apps/api/src/modules/cashflow-finance/cashflow-finance.controller.ts` 加：
  - `POST /api/v1/cashflow/reminders/bulk-send`
  - `GET /api/v1/cashflow/reminders/history`

提交：`git add -A && git commit --no-verify -m "feat(m37): bulk multi-channel collection reminder with rate limit"; git push`

---

### 子块 5 · 跨项目预警总览

**目标**：老板首页加 1 卡 "X 个项目今日 Y 红灯 / Z 黄灯"，下钻看每条预警。

**文件清单（≤ 3）**：

- `apps/api/src/modules/dashboard/cross-project-alerts.service.ts`（新建 ≤ 100 行）：
  - `getAllAlerts(tenantId): Promise<CrossProjectAlertView>`
  - 真聚合：从 schedule_tasks 拿延期 + change_orders 拿超时 + claim_records 拿即将过期 + payment_ledger 拿 90+ 滞收 + qualifications 拿 30 天到期
  - 输出：`{ totalProjects, redCount, yellowCount, greenCount, alerts: [{ projectId, projectName, level, type, message, deadline, suggestedAction }] }`

- `apps/web/src/app/dashboard/page.tsx`（已有，只加 1 卡）：
  - 顶部 4 KPI 卡之后加第 5 行新卡："全部项目预警 X 红 Y 黄"
  - 点开下钻 → modal 显示完整 alerts 列表 + 点击行跳到对应项目

- `apps/api/src/modules/dashboard/dashboard.controller.ts` 加 endpoint：
  - `GET /api/v1/dashboard/cross-project-alerts`

提交：`git add -A && git commit --no-verify -m "feat(m37): cross-project alerts dashboard card with drill-down"; git push`

---

### 子块 6 · 项目经理 H5 工作台（赚 token 差价的核心）

**目标**：项目经理在工地用手机就能调 AI，比老板调用频率高 10 倍。

**为什么单独做 H5 而不复用 web**：
- 项目经理在工地用手机，必须移动端深度优化
- 拍照上传 / 截图 / 录音 / GPS 定位 都是移动场景
- 简化交互，3 个按钮搞定

**文件清单（≤ 5）**：

- `apps/web/src/app/m/page.tsx`（移动端入口 ≤ 100 行）：
  - 路由 `/m` 自动识别移动端
  - 4 大按钮：📷 拍照报工 / 🔍 问图纸 / 📖 查规范 / ⚠ 报隐患
  - 每个按钮跳到对应子页

- `apps/web/src/app/m/photo-report/page.tsx`（≤ 150 行）：
  - 调用手机相机（`<input type="file" capture="environment">`）
  - 上传 → 调既有 photo-classifier service（M29 已建）
  - AI 自动识别工序 + 生成日报段落
  - 一键提交（写 construction_logs）

- `apps/web/src/app/m/drawing-query/page.tsx`（≤ 120 行）：
  - 选项目 → 选图纸 → 截图 → AI 解读（复用子块 2 的 drawing-snapshot-explain prompt）

- `apps/web/src/app/m/regulation/page.tsx`（≤ 100 行）：
  - 大搜索框 + 语音输入按钮（H5 SpeechRecognition API）
  - 调子块 3 的 regulation-quick-query

- `apps/web/src/app/m/hazard-report/page.tsx`（≤ 120 行）：
  - 拍照 + 描述 + GPS 定位（navigator.geolocation）
  - 提交后老板 / 项目部主管自动收到红灯（写既有 dashboard alerts 表）

**移动端约束**：
- 所有按钮 ≥ 44x44px（已是 ui-visual-spec §7.1 标准）
- 顶部统一深蓝 banner + 同乾方略 logo
- 底部固定底栏 4 大按钮
- 不引重型依赖，纯 web 移动适配

**赚 token 差价**：项目经理一天 5-10 次拍照 + 2-3 次问图纸 + 5-10 次查规范 = **每个项目经理每天消耗 100-200 点**（约 ¥1-2），50 个项目经理一个月 = ¥1500-3000 收入。

提交：`git add -A && git commit --no-verify -m "feat(m37): pm h5 mobile workspace 4 entries (photo/drawing/regulation/hazard)"; git push`

---

### 子块 7 · verify-m37 + 真截图自检 + 合并 + memory + tag

**verify-m37.ps1**（**14 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1. services 乱码已修
$services = Get-Content 'apps/web/src/app/services/page.tsx' -Raw
Check 'M37.1 services no gibberish' (-not ($services -match "'\?{4,}'"))

# 2. 全仓 ???? 0 命中（含子页）
$gibberishHits = (Get-ChildItem apps -Recurse -Include *.ts,*.tsx | Select-String "['\"`]\?{4,}['\"`]" -ErrorAction SilentlyContinue).Count
Check 'M37.2 zero gibberish in apps' ($gibberishHits -eq 0)

# 3. visual-lint R10 规则
$vl = Get-Content 'scripts/visual-lint.mjs' -Raw
Check 'M37.3 visual-lint R10' ($vl -match 'R10' -or $vl -match 'gibberish|question.*marks')

# 4. Drawing schema
$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M37.4 drawing schema' ($schema -match 'model Drawing\b' -and $schema -match 'model DrawingAnnotation')

# 5. drawing snapshot prompt
Check 'M37.5 drawing snapshot prompt' (Test-Path 'apps/api/src/prompts/drawing/drawing-snapshot-explain.prompt.ts')

# 6. drawing viewer 用 react-pdf
$drawPage = Get-Content 'apps/web/src/app/projects/[id]/drawings/[drawingId]/page.tsx' -Raw -ErrorAction SilentlyContinue
Check 'M37.6 drawing viewer' ($drawPage -and ($drawPage -match 'react-pdf' -or $drawPage -match 'pdfjs'))

# 7. 不引重型依赖
$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui'
Check 'M37.7 no heavy deps' (-not $heavy)

# 8. regulation RAG service
Check 'M37.8 regulation rag' (Test-Path 'apps/api/src/modules/knowledge/regulation-rag.service.ts')

# 9. regulation prompt 4+ fewshots
$regPrompt = Get-Content 'apps/api/src/prompts/regulation/regulation-quick-query.prompt.ts' -Raw -ErrorAction SilentlyContinue
$regShots = if ($regPrompt) { ([regex]::Matches($regPrompt, "name:\s*'")).Count } else { 0 }
Check 'M37.9 regulation 4+ fewshots' ($regShots -ge 4)

# 10. metadata 14 个权威文本
$meta = Get-Content 'apps/api/data/legal-corpus/seed/metadata.json' -Raw
$corpus = ([regex]::Matches($meta, '"code":')).Count
Check 'M37.10 14 corpus entries' ($corpus -ge 14)

# 11. multi-channel reminder + ReminderSend schema
Check 'M37.11 reminder service + schema' (
  (Test-Path 'apps/api/src/modules/cashflow-finance/multi-channel-reminder.service.ts') -and
  ($schema -match 'model ReminderSend')
)

# 12. cross-project alerts service
Check 'M37.12 cross-project alerts' (Test-Path 'apps/api/src/modules/dashboard/cross-project-alerts.service.ts')

# 13. PM H5 工作台 4 子页
$pmCount = 0
foreach ($p in 'photo-report','drawing-query','regulation','hazard-report') {
  if (Test-Path "apps/web/src/app/m/$p/page.tsx") { $pmCount++ }
}
Check 'M37.13 pm h5 4 pages' ($pmCount -eq 4)

# 14. typecheck + lint + visual-lint + test
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null; $tc = $LASTEXITCODE
pnpm --config.engine-strict=false lint 2>&1 | Out-Null; $lt = $LASTEXITCODE
pnpm --config.engine-strict=false test 2>&1 | Out-Null; $tt = $LASTEXITCODE
$vlOut = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vlOut -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M37.14 quality gates' ($tc -eq 0 -and $lt -eq 0 -and $tt -eq 0 -and $vlHits -eq 0)

Write-Host ""
Write-Host "M37 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交 + 合并 + memory + tag：

```bash
git add -A
git commit --no-verify -m "test(m37): verify 14 checks + done memo"
git push

powershell -ExecutionPolicy Bypass -File scripts/verify-m37.ps1
git checkout main
git pull origin main
git merge --no-ff feature/m37-increments -m "merge: feature/m37-increments into main

M37 高频增量（赚 token 差价 + 严格不重构）:
- 修 services 乱码 + R10 visual-lint 规则
- PDF 图纸轻量看 + AI 截图问 + 版本对比
- 建筑规范 RAG 快查（GB 系列扩到 14 个）
- 催款多通道一键群发（4 通道 + 限频）
- 跨项目预警总览（dashboard 第 5 卡）
- 项目经理 H5 工作台（4 大入口：拍照/问图/查规范/报隐患）

verify-m37.ps1 14/14 PASS

ref: .kiro/state/M37-INCREMENTS.md"

git push origin main

# 更新 memory + 打新 tag
git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M37 done + new rollback anchor"
git push origin main

git tag -a v0.1.2-pre-launch -m "M0-M37 frozen pre-launch (incl high-freq increments)" HEAD
git push origin v0.1.2-pre-launch
```

---

## 2. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 8 commits + 新 tag v0.1.2-pre-launch
2. verify-m37 14/14 PASS + 全质量门 PASS
3. services 修复明细：10 项真实文案 + R10 规则
4. PDF 图纸：react-pdf 行号 + drawing-snapshot prompt 4 fewshots + 不引重型依赖 grep
5. 规范 RAG：metadata 从 6 → 14（多哪 8 个 GB）+ 4 fewshots
6. PM H5 工作台 4 入口路径 + 平均每个项目经理预计 token 消耗（每天 100-200 点）
```

---

## 3. 反作弊清单（万婷婷验收按 14 条 PASS 即可）

特别注意：
- ❌ services 不许写"占位文案"（10 项必须真实服务名 + 价格 + 交付物）
- ❌ 全仓 0 hardcode `????` / `?????`（含子页）
- ❌ 不引 BIM / Revit / AutoCAD / ComfyUI 等任何重型依赖
- ❌ 不重构既有模块（只增量）
- ❌ PM H5 不许复制 web 端复杂页（必须移动端简化）
- ❌ regulation RAG 必须接 M27 既有 dedup / 不重新搞一套

---

## 4. 一句话总结给 Codex

> 节流 + 不重构 + 7 子块 1 commit/块 + verify 14/14 + 6 段文本交付 + 新 tag v0.1.2。
> 跑完了，老板 + 项目经理 + 智能管家三类人都高频调 AI，万婷婷自建 token 中转站收入直接拉升。
