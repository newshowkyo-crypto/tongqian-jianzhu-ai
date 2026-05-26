# M36 · 精度对标审计（7 核心 prompt vs GitHub 优秀实践）+ 黄金测试集

> Codex 整段读，按 7 子块顺序，每块 1 commit。**节流模式 + 不开 dev server + 不引代码 + 只增强 prompt + 数据**。
> 本期定位：万婷婷凭证一接上立刻能运营 = AI 输出精度达到"建工行业可用"。

---

## 0. 必读 + 节流契约

**先读**：
1. `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md`
2. `.kiro/state/GITHUB-CONSTRUCTION-AI-SCAN-2026-05-23.md`
3. `apps/api/src/prompts/` 全部 30+ prompt 文件结构
4. `AGENTS.md` §3.8 V4 商业宪法

**节流契约**：上下文 ≥ 50% commit；每子块 ≤ 5 文件 / ≤ 500 行；**绝不引 GitHub 仓库代码**（License 红线）。

---

## 1. 7 个核心 prompt 对标审计清单

| # | 我们的 prompt | 对标 GitHub 优秀实践 | 增强方向 |
|---|---|---|---|
| 1 | `contract-review-pro.prompt` | evolsb/claude-legal-skill 50+ red flag | 我们 38 → 补到 80 |
| 2 | `tender-summary.prompt` | aws-genai-rfpassistant Bedrock RAG | 加多文档对比 + 8 类关键条款抽取强化 |
| 3 | `qualification-checkup.prompt` | 无开源对位（中国本土）| 增 30 真案例 fewShot |
| 4 | `cost-from-text.prompt` | OpenConstructionERP estimate API + DDC CWICR | 加 cwicr 子目优先 + 偏离度自检 |
| 5 | `red-flag-scan.service` | claude-legal-skill checklist | 38 → 80 项 + 行业细分 |
| 6 | `report-generator.prompt` | DDC `4_DDC_Curated` quality check | 加 5 项质量自检的 prompt 强化 |
| 7 | `due-diligence.prompt` | 无开源对位 | 加 5 真案例 fewShot |

---

## 2. 子块拆解

### 子块 1 · 合同 red flag 38 → 80 项

读 `apps/api/data/contract-red-flags/zh-CN-construction.json`（M28 写的 38 项）：

按 8 大类补到 80 项（每类 +5 条）：
- 付款（5 → 10）：加"合同价款不含税不含规费 / 工程进度款付款比例不足 / 竣工结算未约定审计期限 / 总价合同隐藏条款变更 / 农民工工资专户"
- 工期（5 → 10）：加"开竣工日期含糊 / 工期顺延条件过严 / 节假日 / 不可抗力 + 政策性停工 / 验收时点"
- 违约（5 → 10）...
- 担保 / 索赔 / 不可抗力 / 知识产权 / 争议解决 同样补

**新增条目要求**：
- 每条含 `id / category / title / keywords / regex / riskLevel / defaultBenchmark / suggestion / legalBasis（GF-2017-0201 第 X.X 条）`
- 引用法律依据必须真实（不能编 GF-2017-0201 第 99 条这种）

提交：`git checkout -b feature/m36-prompt-precision-audit && git add -A && git commit --no-verify -m "feat(m36): expand red-flag-scan from 38 to 80 items with legal basis"; git push -u origin feature/m36-prompt-precision-audit`

---

### 子块 2 · 7 prompt 黄金测试集

新建 `apps/api/data/golden-test-sets/`：

每个 prompt 1 个测试集（≤ 20 行 JSON 描述 + ≥ 10 真实案例）：

```json
// contract-review-pro.test.json
{
  "taskType": "CONTRACT_REVIEW_PRO",
  "version": "v1",
  "cases": [
    {
      "id": "case-01-payment-delay",
      "input": {
        "contractText": "..." // 200-500 字真实合同片段（脱敏）
      },
      "expectedSignals": ["pay-02", "pay-03"],   // 应命中的 red flag id
      "forbiddenSignals": [],                      // 不该命中
      "minConfidence": 0.80,
      "expectedTier": 2
    },
    // 共 10 个案例
  ]
}
```

7 套测试集（每套 ≥ 10 案例 = 70+ 案例）：
- contract-review.test.json
- tender-summary.test.json
- qualification-checkup.test.json
- cost-estimate.test.json
- red-flag-scan.test.json
- report-quality.test.json
- due-diligence.test.json

测试数据来源（**不复制有 license 内容**）：
- 自己改写的合同片段（参考 GF-2017-0201 公开示范文本）
- 招标文件公开样例（中国招标投标公共服务平台）
- 裁判文书网公开判例（脱敏 + 缩写）

提交：`git add -A && git commit --no-verify -m "feat(m36): 7 golden test sets with 70+ real cases"; git push`

---

### 子块 3 · 黄金测试 runner

新建 `apps/api/src/modules/prompt-testing/golden-runner.service.ts`（≤ 200 行）：

```ts
async runGoldenSet(taskType: AiTaskType): Promise<GoldenRunResult> {
  // 1. 读对应 test.json
  // 2. 逐 case 调 aiGateway.invoke()
  // 3. 用 expected/forbidden signals 计算精度（precision / recall / F1）
  // 4. 输出 result：{ taskType, total, passed, failed, precision, recall, f1, byCase: [...] }
}
```

新增 endpoint：
- `POST /api/v1/admin/prompt-testing/run-golden?taskType=CONTRACT_REVIEW_PRO`
- `GET /api/v1/admin/prompt-testing/golden-history`

admin 后台加页：
- `apps/admin/src/app/(main)/admin/prompt-testing/golden/page.tsx`
- 7 个 task 各一卡 + 跑按钮 + 历史评分趋势图

提交：`git add -A && git commit --no-verify -m "feat(m36): golden test runner + admin page with f1 score"; git push`

---

### 子块 4 · 7 prompt 增强（fewShot 翻倍 + 边界 case）

逐个 prompt 增强：

#### 4.1 `contract-review-pro.prompt.ts`
- fewShotExamples 从 3 加到 8（红黄绿各 2-3 + 涉外合同 1 + 政府采购 1）
- outputSchema 加 `legalBasis` 必填 + `clauseRef` 格式校验
- systemPrompt 加 5 条新红线："涉及刑事不出意见 / 涉外用 FIDIC 框架 / 农民工工资专项条款 / 双随机一公开 / 招投标法实施条例第 32 条"

#### 4.2 `tender-summary.prompt.ts`
- 加跨文档对比能力：输入 `[招标文件, 答疑, 补遗]` → 输出"实质性变更"列表
- few-shot 加 1 个跨文档案例

#### 4.3 `cost-from-text.prompt.ts`
- 加 cwicr 优先级（先查 catalog → AI 选 → 再算 → 最后偏离度自检）
- few-shot 加 3 个偏离度异常案例

（其他 4 个 prompt 同样增强，每个 ≤ 100 行改动）

提交：`git add -A && git commit --no-verify -m "feat(m36): 7 prompts enhanced with 2x fewshots + edge cases + new red lines"; git push`

---

### 子块 5 · 跑黄金测试 + 评分

跑全套（不真调 DeepSeek，**用 mock provider** 节省成本，等 VPS 真凭证后再跑真）：

```bash
pnpm --filter @tongqian/api test:golden
```

输出：

```
CONTRACT_REVIEW_PRO: precision 0.87 / recall 0.82 / F1 0.84 (PASS 8/10)
TENDER_SUMMARY: F1 0.79 (PASS 7/10)
QUALIFICATION_CHECKUP: F1 0.91 (PASS 9/10)
COST_ROUGH_ESTIMATE: F1 0.76 (PASS 7/10)  ← 待真凭证后重测
RED_FLAG_SCAN: F1 0.93 (PASS 9/10)
REPORT_QUALITY: F1 0.85 (PASS 8/10)
DUE_DILIGENCE: F1 0.81 (PASS 8/10)
```

把结果写到 `.kiro/state/M36-GOLDEN-RESULTS.json`

**精度红线**（按 V4 商业宪法）：
- F1 < 0.70 → 该 prompt 不许上线 → 补 fewShot 或调输出 schema
- F1 ≥ 0.80 → 上线

提交：`git add -A && git commit --no-verify -m "test(m36): run golden suite + record f1 scores"; git push`

---

### 子块 6 · README 加 prompt audit trail

新建 `docs/prompt-audit/2026-05-23-m36-baseline.md`：

| Prompt | F1 | 对标项目 | 借鉴点（不引代码） | 增强 |
|---|---|---|---|---|
| contract-review-pro | 0.84 | claude-legal-skill | red flag 思路 | fewShot 3→8 + 80 项 checklist |
| ... 共 7 行 | | | | |

写明：
- 每个 prompt 借鉴了 GitHub 哪个项目的什么思路（不抄代码）
- 哪些没采纳 + 为什么（License / 不适用国情 / 太重）
- 下次 audit 计划（M40 时跑同一套黄金测试集，看精度有没有提升）

提交：`git add -A && git commit --no-verify -m "docs(m36): prompt audit trail baseline 2026-05-23"; git push`

---

### 子块 7 · verify-m36 + 合并 + memory

`scripts/verify-m36.ps1`（**12 条**）：

```powershell
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n" -Fg Green; $script:pass++ } else { Write-Host "FAIL $n" -Fg Red; $script:fail++ } }

# 1. red-flag 80 项
$rf = Get-Content 'apps/api/data/contract-red-flags/zh-CN-construction.json' -Raw
$count = ([regex]::Matches($rf, '"id":')).Count
Check 'M36.1 red-flag 80+ items' ($count -ge 80)

# 2-8. 7 个黄金测试集
foreach ($t in 'contract-review','tender-summary','qualification-checkup','cost-estimate','red-flag-scan','report-quality','due-diligence') {
  Check "M36.test $t" (Test-Path "apps/api/data/golden-test-sets/$t.test.json")
}

# 9. golden runner
Check 'M36.9 golden-runner' (Test-Path 'apps/api/src/modules/prompt-testing/golden-runner.service.ts')

# 10. golden results 7 项 F1 都 ≥ 0.70
$results = Get-Content '.kiro/state/M36-GOLDEN-RESULTS.json' -Raw -ErrorAction SilentlyContinue
$lowF1 = if ($results) { ($results -split '\n' | Select-String '"f1":\s*0\.[0-6]').Count } else { 99 }
Check 'M36.10 all F1 >= 0.70' ($lowF1 -eq 0)

# 11. audit trail doc
Check 'M36.11 audit trail' (Test-Path 'docs/prompt-audit/2026-05-23-m36-baseline.md')

# 12. typecheck
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M36.12 typecheck' ($LASTEXITCODE -eq 0)

Write-Host ""; Write-Host "M36 verify: $pass PASS / $fail FAIL"; exit $fail
```

合并 + memory 同 M34/M35。

---

## 3. 6 段交付

```
1. main HEAD + 8 commits
2. verify-m36 12/12 PASS
3. red-flag 38 → 80 项的对比（按类目几条）
4. 7 个黄金测试 F1 评分
5. 7 prompt 各借鉴的 GitHub 项目（不抄代码 / 只增强 prompt）
6. 已知限制（mock provider 跑的 F1 + 真凭证后会重测）
```

---

## 4. 反作弊

- ❌ 绝不引 GitHub 仓库代码（License 红线）
- ❌ 80 项 red flag 不许重复 38 项的标题
- ❌ legalBasis 必须真实条款号
- ❌ 黄金测试案例不许 mock 假合同（必须从公开示范文本/判决书改写）
- ❌ F1 < 0.70 的 prompt 必须补 fewShot 不许直接发布
- ❌ 不动业务逻辑 / 不动 schema

---

## 5. 一句话总结

> 节流模式 + 不引 GitHub 代码 + 只增强 prompt 和测试集 + 7 子块 1 commit/块 + verify 12/12 + 6 段文本交付。
> 跑完了，万婷婷真凭证一接上，AI 输出精度立刻达到"建工行业可用"水准。
