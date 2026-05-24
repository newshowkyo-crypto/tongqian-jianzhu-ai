# M26 · 全网数据采集 + AI 规则抽取自动化

> 一段提示词。Codex 整段读，按 5 子块逐一交付，每子块 1 commit。
>
> **核心定位变更**：业务底料**不靠律师/专家手工录**，改成爬虫真采 + AI 抽候选 + 律师只审。这是万婷婷 2026-05-23 的明确指令。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文（含 §A 永久事实区 + 4 节策略修正）
2. `AGENTS.md` §3.7 双轨命名 + §3.8 V4 商业宪法
3. `.kiro/steering/security-rules.md` §10 数据出境 + §13 审计日志
4. `apps/api/src/modules/security-compliance/security-compliance.service.ts`（12 个公开数据源已列）
5. `apps/api/src/modules/knowledge/knowledge.service.ts`（既有 `triggerCrawler` mock）
6. `apps/api/src/modules/admin/ingest/ingest-admin.controller.ts`（既有 3 个 mock job）
7. `apps/api/src/modules/rule-curation/rules.service.ts`（候选审核入口已在）
8. `prisma/schema.prisma` grep model: `Rule | RuleCandidate | KnowledgeDocument | CourtJudgment | TenderNotice | StandardTemplate | PolicyFund | CompanyProfile | IngestRun`（应已存在）

**节流契约**：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- 不开 dev server / 不真跑爬虫上量 / 不截图 / 不写 MILESTONE 长文档
- LOAD ≤ 6 / CODE ≤ 14 / VERIFY ≤ 4 / COMMIT ≤ 6
- 每子块 ≤ 5 文件 / ≤ 500 行 / 1 commit

**双轨命名**：用户可见层中文，代码层英文 `crawler / fetcher`，绝不写"中介"。

---

## 1. 总目标

**让 admin 后台一键启动全网采集**，每天定时跑爬虫 → 抓数据 → AI 抽候选 → 律师 admin 审核 → 自动入库 → 老板侧 AI 报告引用最新数据。

| 数据源（V1 上线先做 6 个最高价值） | 抓什么 | 写入表 | 频次 |
|---|---|---|---|
| 中国招标投标公共服务平台 cebpubservice.com | 招标公告 + 中标公告 | `tender_notices` | 每天 04:00 增量 |
| 中国裁判文书网 wenshu.court.gov.cn | 建工合同纠纷判决（关键词过滤） | `court_judgments` | 每周日全量（防风控） |
| 信用中国 creditchina.gov.cn | 失信被执行人 + 行政处罚 | `credit_records` | 每周三全量 |
| 住建部 mohurd.gov.cn | 部颁政策 + 标准 + 规范修订 | `policy_funds` + `standard_templates` | 每天 06:00 |
| 财政部 mof.gov.cn | 财政补贴 + 资金类政策 | `policy_funds` | 每天 06:30 |
| 发改委 ndrc.gov.cn | 发改委审批 + 鼓励类目录 | `policy_funds` | 每天 07:00 |

V1 不上：四库一平台（账号难搞）/ 各省公共资源（500 个 URL 太散，V2 再做） / 国家企业信用公示（gsxt 反爬太狠）。

---

## 2. 子块拆解（5 子块 × 1 commit）

### 子块 1 · 爬虫框架 + 6 个真 fetcher

**目标**：`apps/worker/src/crawlers/` 6 个真爬虫 + BullMQ 调度。

**新建/改动**：

- `apps/worker/src/crawlers/base-fetcher.ts`（新建）：
  - 抽象基类 `BaseFetcher<TItem>`，含 `fetch(): Promise<TItem[]>` `parse(html): TItem[]` `dedup(items, existing): TItem[]`
  - 内置 `node-fetch` + `cheerio`（不引 puppeteer 太重，下个 phase 再说）
  - User-Agent: `Tongqian research crawler + biz@tongqian.xin`（`security-compliance.service.ts` 已用同样 UA）
  - 自带 robots.txt 检查 + 请求间隔 ≥ 2s + 失败指数退避（最多 5 次）
  - 写 `ingest_runs` 审计：fetched_count / upserted_count / failed_count / errors[]

- 6 个 fetcher（每个 ≤ 80 行）：
  - `apps/worker/src/crawlers/cebpubservice.fetcher.ts`：招标公告 RSS + 中标公告
  - `apps/worker/src/crawlers/wenshu.fetcher.ts`：判决书全文（cause = 建设工程合同纠纷 + 限近 1 年）
  - `apps/worker/src/crawlers/creditchina.fetcher.ts`：失信名单 JSON API
  - `apps/worker/src/crawlers/mohurd.fetcher.ts`：政策列表分页爬
  - `apps/worker/src/crawlers/mof.fetcher.ts`：同上
  - `apps/worker/src/crawlers/ndrc.fetcher.ts`：同上

- `apps/worker/src/queues/crawler.queue.ts`（新建）：
  - 6 个 BullMQ Job，cron 调度（不同时间点防风控）
  - 失败 retry 3 次 + 死信队列写 `ingest_failures` 表
  - 完成后 emit event `crawler.completed` → 触发子块 2 AI 抽取

- `apps/worker/src/main.ts`（如已存在则改）：注册 6 个 processor + 启动 BullMQ Worker

**反作弊**：
- ❌ fetcher 不许返回 hardcode mock 数组（必须真发 HTTP）
- ❌ 必须写 `ingest_runs` 审计（traceId + duration + counts）
- ❌ 必须遵守 robots.txt 检查
- ✅ 不要求 Codex 真跑 6 个爬虫上量（CI / VPS 上才跑），只验证：
  - 每个 fetcher 文件含 `fetch(` 真发请求
  - cron 注册到 BullMQ
  - 6 个 Job 各有 1 个集成测试 mock HTTP 返回 sample HTML 验证 parse 出 ≥ 1 条

---

### 子块 2 · AI 候选抽取 pipeline

**目标**：爬虫入库后自动调 AI 抽规则候选 → 写入 `rule_candidates` 表。

**新建/改动**：

- `apps/api/src/modules/rule-extraction/rule-extraction.service.ts`（新建）：
  - 监听 `crawler.completed` 事件（从 BullMQ 取 jobId 拿原数据）
  - 按数据类型路由：判决书 → contract / regulation 候选；招标公告 → tender 候选；政策 → regulation 候选
  - 调既有 `aiGateway.invoke({ taskType: AiTaskType.RULE_EXTRACT, input })`（如 taskType 不存在新增）
  - 输出 schema 用 zod 校验（title / type / clauseRef / riskLevel / suggestion / reverseExample / confidence）
  - 调 `rulesService.createCandidate(input)` 写入候选表
  - confidence ≥ 0.85 自动标 `pending_review`；< 0.85 标 `pending_review_low`，admin 优先审

- `apps/api/src/prompts/rules/rule-extract.prompt.ts`（新建）：
  - PromptTemplate 标准结构（version v1, primaryModel deepseek-chat, fallback qwen-plus）
  - System prompt：建筑业资深律师 + 招标专家联合视角，输出风险规则候选
  - inputSchema: `{ sourceText: string, sourceType: 'judgment' | 'tender' | 'policy', sourceUrl: string }`
  - outputSchema: `{ candidates: Array<{ title, type, clauseRef?, riskLevel: 'red'|'yellow'|'green', suggestion, reverseExample?, confidence }> }`
  - few-shot ≥ 3 个（高 / 中 / 低风险各 1）
  - 红线：禁绝对化"必须 / 绝对"；引用必须有出处
  - safetyChecks: 政治敏感 + 个人隐私

- `apps/api/src/modules/rule-extraction/rule-extraction.module.ts`（新建）：
  - imports: AiGatewayModule + RuleCurationModule
  - providers: RuleExtractionService

- 注册到 main.ts AppModule

**反作弊**：
- ❌ Prompt 不许硬编码 sample 输出
- ❌ 输出必须经 zod 校验，schema 失败重试 ≤ 2 次
- ❌ rule_candidates 写入必须含 source_url + extract_trace_id（可追溯）
- ❌ 不许把判决书当事人姓名 / 公司名直传海外模型（DeepSeek 国产可直传，但这里走脱敏走查 V4 §3.8 红线）
- ✅ 1 个集成测试：feed 一段 mock 判决书 → 期望抽出 ≥ 2 条候选 + zod 校验过

---

### 子块 3 · 时效性打分 + 自动去重 + 自动 deprecate

**目标**：旧数据自动失效，新数据优先。

**新建/改动**：

- `apps/api/src/modules/rule-extraction/timeliness.service.ts`（新建）：
  - 评分公式：
    ```
    score = base
            + 1 / (ageInDays + 1) * 30          // 越新越高
            + (sourceAuthority * 20)             // 来源权威性
            - (similarRulesCount * 5)            // 重复扣分
    ```
  - sourceAuthority: 住建部 / 最高法判例 = 1.0；省级 = 0.8；招标 = 0.6
  - 每周日跑一次全量 rescore，写入 `rule_candidates.timeliness_score`

- `apps/api/src/modules/rule-extraction/dedup.service.ts`（新建）：
  - 用 simhash + 余弦相似度（不引向量库，先用关键词 jaccard 够用）
  - 相似度 ≥ 0.85 → 合并到已有 rule，新版本号 +1，旧版自动 deprecate
  - 写 `rule_versions` 表（既有）

- `apps/api/src/modules/rule-extraction/auto-deprecate.service.ts`（新建）：
  - 每周日扫所有 `active` 规则
  - 引用法规已被新版替代（关键词匹配如"已废止""代替"）→ 自动 status='deprecated'
  - timeliness_score < 30 且 ageInDays > 365 → 自动归档（不删）
  - 所有自动操作写 audit log + 通知 admin（admin 可一键 revert）

**反作弊**：
- ❌ dedup 阈值不许写死 0.5（必须 ≥ 0.8 严格）
- ❌ deprecate 必须可 revert（不许物理删除）
- ❌ 必须 audit log 留痕
- ✅ PBT 测试 timeliness 单调性：相同来源越新分越高

---

### 子块 4 · admin 候选审核台升级

**目标**：让律师 / 专家在 admin 后台快速审 AI 抽出的候选。

**改动**：

- `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx`（如不存在新建，存在则改活）：
  - 列表用 useQuery 拉 `GET /api/v1/admin/rule-candidates?status=pending_review&sortBy=timeliness_score`
  - 表格列：标题 / 来源（链接） / 风险等级 / AI 信心度 / 时效分 / 操作
  - 点击行 → 抽屉显示原文 + AI 抽取对比（左右双栏）
  - 操作按钮：通过 / 拒绝 / 修改后通过 / 标"待复核"
  - 批量操作：批量拒绝低信心候选、批量通过同来源高信心候选

- `apps/admin/src/app/(main)/admin/rules/candidates/[id]/page.tsx`（详情页）：
  - 左：原文（cheerio render）
  - 右：AI 抽取表单（react-hook-form + zod，可改字段）
  - 底部 5 按钮：通过 / 拒绝 + 原因 / 修改后通过 / 待复核 / 上报创始人

- 后端 `apps/api/src/modules/admin/rule-candidates/rule-candidates.controller.ts`：
  - GET `/api/v1/admin/rule-candidates`（query: status, sortBy, sourceType, page）
  - POST `/api/v1/admin/rule-candidates/:id/approve` (body: edits?)
  - POST `/api/v1/admin/rule-candidates/:id/reject` (body: reason)
  - POST `/api/v1/admin/rule-candidates/batch` (body: { ids, action, reason? })

**反作弊**：
- ❌ 列表不许 hardcode 数组
- ❌ 通过 / 拒绝必须写 audit log
- ❌ 批量操作不许超过 50 条/次（防误操作）
- ❌ 律师只看自己 tenant 候选不行（候选属于平台，所有 EXPERT/LAWYER 共审）— 但 ABAC 校验 EXPERT 角色权限

---

### 子块 5 · verify-m26.ps1 + 提交 + memory

新建 `scripts/verify-m26.ps1`，**12 条 PASS/FAIL**：

```powershell
$ErrorActionPreference = 'Stop'
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }

# 1-6. 6 个 fetcher 真存在且真发 HTTP
foreach ($src in 'cebpubservice','wenshu','creditchina','mohurd','mof','ndrc') {
  $f = "apps/worker/src/crawlers/$src.fetcher.ts"
  $content = Get-Content $f -Raw -ErrorAction SilentlyContinue
  $hasFetch = $content -and ($content -match 'fetch\(' -or $content -match 'http\.get')
  Check "M26.$($src) fetcher real" ((Test-Path $f) -and $hasFetch)
}

# 7. base-fetcher 抽象类
$base = Get-Content 'apps/worker/src/crawlers/base-fetcher.ts' -Raw -ErrorAction SilentlyContinue
Check 'M26.7 base-fetcher abstract + dedup + audit' ($base -match 'abstract class BaseFetcher' -and $base -match 'ingest_runs' -and $base -match 'robots')

# 8. AI 抽取 service
$ext = Get-Content 'apps/api/src/modules/rule-extraction/rule-extraction.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M26.8 rule-extraction inject + zod' ($ext -match 'aiGateway' -and $ext -match 'zod' -and $ext -match 'createCandidate')

# 9. Prompt 模板
$prompt = Get-Content 'apps/api/src/prompts/rules/rule-extract.prompt.ts' -Raw -ErrorAction SilentlyContinue
Check 'M26.9 prompt has fewshot + outputSchema' ($prompt -match 'fewShotExamples' -and $prompt -match 'outputSchema' -and $prompt -match 'fallbackText')

# 10. timeliness + dedup + auto-deprecate
Check 'M26.10 three governance services' (
  (Test-Path 'apps/api/src/modules/rule-extraction/timeliness.service.ts') -and
  (Test-Path 'apps/api/src/modules/rule-extraction/dedup.service.ts') -and
  (Test-Path 'apps/api/src/modules/rule-extraction/auto-deprecate.service.ts')
)

# 11. admin 候选审核台
$cand = Get-Content 'apps/admin/src/app/(main)/admin/rules/candidates/page.tsx' -Raw -ErrorAction SilentlyContinue
Check 'M26.11 admin candidates page useQuery' ($cand -match 'useQuery' -and $cand -match 'rule-candidates')

# 12. typecheck
$tc = pnpm --config.engine-strict=false typecheck 2>&1
Check 'M26.12 typecheck' ($LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "M26 verify: $pass PASS / $fail FAIL"
exit $fail
```

提交：

```bash
git add -A
git commit --no-verify -m "feat(m26): full-web crawler ai rule extraction pipeline"
git push -u origin feature/m26-crawler-auto-curation
```

最后写 `.kiro/state/M26-CRAWLER-AUTO-CURATION-DONE.md`：HEAD + verify 输出 + 6 fetcher 行数 + AI 抽取 traceId 一次实跑（mock 一段判决书）。

---

## 3. 6 段交付（最后给万婷婷）

完成后**只**回这 6 段：

```
1. HEAD sha + branch
2. verify-m26.ps1 输出（必须 12/12 PASS）
3. 6 个 fetcher 行数 + 1 个 fetcher 关键代码片段（证明真发 HTTP）
4. AI 抽取 1 次 mock 判决书的输出 JSON（候选 ≥ 2 条 + traceId）
5. timeliness 公式 + dedup 阈值 + auto-deprecate 触发条件
6. 已知限制：本机不真跑爬虫上量；6 个数据源 robots.txt 各自合规（如 wenshu 风控严，标注待 IP 池） / 反爬升级 V2 用 puppeteer
```

---

## 4. 反作弊清单（万婷婷验收）

1. ✅ 5 commits（一子块一 commit）
2. ✅ verify 12/12 PASS
3. ✅ 6 个 fetcher 必须真 fetch HTTP（grep 每个文件含 `fetch(` 或 `http.get`）
4. ✅ base-fetcher 必须 abstract + dedup + ingest_runs 审计 + robots 检查
5. ✅ Prompt 必须 fewShotExamples ≥ 3 + outputSchema zod + fallbackText
6. ✅ rule_candidates 必须含 source_url + extract_trace_id
7. ✅ dedup 阈值 ≥ 0.8（不许 0.5）
8. ✅ deprecate 不物理删除（必须软标 + 可 revert）
9. ✅ admin candidates 页 useQuery（不许 hardcode）
10. ✅ 6 个 fetcher 各自有 1 个 mock HTTP 集成测试
11. ✅ typecheck 仍过
12. ✅ 不删除任何既有 mock job（保留兼容期，admin 一键切真）

---

## 5. 一句话总结给 Codex

> 节流模式 + 不真跑爬虫上量 + 5 子块 1 commit/块 + verify 12/12 + 6 段文本交付。
> 跑完了，万婷婷开 admin 看候选审核台，律师只审不录，平台数据每天自动新陈代谢。
