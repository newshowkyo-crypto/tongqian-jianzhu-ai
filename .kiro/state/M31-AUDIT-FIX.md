# M31 · 全量体检修复（lint + visual-lint + 单元测试 + tenant 隔离 + tool 真接）

> Codex 一段读完，按 5 子块顺序执行，每块 1 commit。**节流模式 + 不开 dev server + 不截图 + 不引重型依赖**。
> 本期定位：**修补 M26-M30 五个 milestone 大改后留下的架构债，让 main 真正干净到可上线**。

---

## 0. 必读 + 节流契约

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文
2. `.kiro/steering/ui-visual-spec.md` §1 颜色 token + §3 间距规则
3. `.kiro/steering/ui-ux-rules.md` §2.1 颜色 + §4 间距
4. `.kiro/steering/testing-rules.md` §3 覆盖率红线
5. `.kiro/steering/security-rules.md` §3 4 道防线
6. `.eslintrc.json`（看 import/order 规则）
7. `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx` 第 4 行（lint 失败位置）
8. `scripts/visual-lint.mjs`（看违规规则定义）

**节流契约**（强约束）：
- 上下文 ≥ 50% → 立刻 commit + push + 主动结束
- **不开 dev server / 不截图 / 不引重型依赖**
- 不动业务逻辑，只修 lint / 视觉 / 测试 / schema 加 default
- LOAD ≤ 5 / CODE ≤ 14 / VERIFY ≤ 5 / COMMIT ≤ 5（**单子块**）
- 每子块 ≤ 6 文件 / ≤ 400 行 / 1 commit

---

## 1. 子块拆解（5 子块 × 1 commit）

### 子块 1 · 修 admin lint 3 处 import/order

**目标**：`pnpm --filter @tongqian/admin lint` 必须 exit 0。

**操作**：

1. 跑 `pnpm --config.engine-strict=false --filter @tongqian/admin lint --fix` 让 ESLint 自动修
2. grep 还有没有手动遗漏的 import 顺序问题
3. 检查 3 个文件（自动 fix 应该解决全部 3 个）：
   - `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx`
   - `apps/admin/src/app/(main)/admin/legal-corpus/page.tsx`（如有）
   - `apps/admin/src/app/(main)/admin/onboarding/page.tsx`（如有）

**反作弊**：
- ❌ 不许 `// eslint-disable` 绕过
- ❌ 不许动业务代码

提交：`git checkout -b feature/m31-audit-fix && git add -A && git commit --no-verify -m "fix(m31): admin lint import order errors"; git push -u origin feature/m31-audit-fix`

---

### 子块 2 · 修 visual-lint 37 处违规

**目标**：`node scripts/visual-lint.mjs` 必须输出 `no violations` 或 0 违规。

**违规清单**（37 处）：
- **R1 hardcode hex**（11 处）：`bg-[#d6ad60]`, `bg-[#101820]` 等 — 必须改用既有 token：`bg-accent-gold` / `bg-navy-deepest` / `bg-primary-500` 等（看 `packages/ui/tailwind.config.ts` 现有 token）
- **R3 odd spacing**（25 处）：`gap-3 / mb-3 / p-3 / p-7` 等奇数间距 — 必须改成 `gap-2/gap-4/gap-6` / `mb-2/mb-4` / `p-2/p-4/p-6` 等 4 倍数
- **R5**（1 处）：看具体规则修

**核心修法**：
1. 全仓 grep `bg-\[#[0-9a-f]{6}\]` 全部替换成 token（grep 出现的 hex 值 → 在 tailwind.config.ts 找对应 token）
2. 全仓 grep `gap-3|gap-5|gap-7|p-3|p-5|p-7|mb-3|mb-5|mb-7|mt-3|mt-5|mt-7` 全部替换成 4 倍数
3. 重点修以下文件（M28-M30 新增）：
   - `apps/web/src/app/projects/[id]/schedule/page.tsx`
   - `apps/web/src/app/projects/[id]/tasks/page.tsx`
   - `apps/web/src/app/tenders/[id]/rfp-analysis/page.tsx`
   - `apps/web/src/app/cost-estimates/budget/page.tsx`
   - `apps/web/src/app/cost-estimates/rough-quantity/page.tsx`
   - `apps/web/src/app/projects/[id]/changes-claims/page.tsx`
   - `apps/web/src/app/projects/[id]/carbon/page.tsx`
   - `apps/web/src/app/cashflow/ledger/page.tsx`
   - `apps/admin/src/app/(main)/admin/legal-corpus/page.tsx` 及子页
   - `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx`

**反作弊**：
- ❌ 修完 visual-lint 必须 0 违规
- ❌ 不许 `// visual-lint-disable`

提交：`git add -A && git commit --no-verify -m "fix(m31): visual-lint 37 violations - replace hex with tokens + 4px grid"; git push`

---

### 子块 3 · 给 8 个新 service 加单元测试

**目标**：给 M28-M30 新加的 8 个核心 service 各加 1 个 spec.ts，覆盖率 ≥ 70%。

**最小测试清单**（8 个文件，每个 spec ≤ 80 行）：

1. `apps/api/src/modules/cost-catalog/cost-catalog.service.spec.ts` — 测 importFromCsv 流式 + searchByKeyword 命中
2. `apps/api/src/modules/tender/rfp-rag.service.spec.ts` — 测 ingestRfpDocs 切段 + searchAcrossRfp 跨文档
3. `apps/api/src/modules/risk-review/red-flag-scan.service.spec.ts` — 测 38 项扫描，feed 含"无限连带"合同应命中 bond-01
4. `apps/api/src/modules/chat-hub/tool-registry.service.spec.ts` — 测 17 工具注册 + 调用 list_my_tenders 真返回数据
5. `apps/api/src/modules/project-site/schedule.service.spec.ts` — 测 CPM 算法（feed 一个 5 任务图，验证关键路径）
6. `apps/api/src/modules/customer-due-diligence/due-diligence.service.spec.ts` — 测 graceful 占位（凭证未填时返回 credential_required）
7. `apps/api/src/modules/cost-estimate/budget-estimator.service.spec.ts` — 测 5 系数公式（杭州 1.05 × 钢结构 1.40 × 标准装修 1.15 …）+ 上下浮动 15%
8. `apps/api/src/modules/project-site/claim-record.service.spec.ts` — 测时效倒计时（提交 deadline 前 7 天应触发预警）

**测试套路**（每个 spec.ts 模板）：
```ts
import { describe, expect, it, beforeEach } from 'vitest';
import { XService } from './x.service.js';

describe('XService', () => {
  let service: XService;
  beforeEach(() => { service = new XService(); });
  
  it('happy path', async () => {
    const result = await service.method({ ... });
    expect(result.x).toBe(...);
  });
  
  it('boundary case', async () => {
    // edge case
  });
  
  it('error case', async () => {
    await expect(service.method({...})).rejects.toThrow();
  });
});
```

**反作弊**：
- ❌ 不许用 `expect(true).toBe(true)` 占位
- ❌ 不许 `it.skip`
- ❌ 测试必须真断言业务正确性

提交：`git add -A && git commit --no-verify -m "test(m31): 8 unit tests for m28-m30 new services"; git push`

---

### 子块 4 · schema 加 tenant_id 默认值 + 4 道防线检查

**目标**：M28-M30 加的 11 张表 tenantId 必须有 default 'platform' 或非空校验，防止跨租户漏数据。

**表清单**：

M28：
- LegalCorpus
- LegalClause（cascade 已有）
- CostCatalog
- CostItem
- RfpChunk

M29：
- ProjectSchedule
- ScheduleTask
- HistoricalProjectCost
- SitePhoto

M30：
- BaselineUnitCost（platform 全局，无 tenant）
- BudgetEstimate
- QuantityIndicator（platform 全局）
- RoughQuantityEstimate
- PaymentLedger
- ChangeOrder
- ClaimRecord
- CarbonFactor（platform 全局）
- CarbonEstimate
- ProjectTask
- TaskComment

**操作**：
1. 给所有"业务表"（非 platform 全局）的 tenantId 加 `@default("platform")`（mock 阶段）+ 加 `@@index([tenantId])`
2. 给所有"platform 全局表"（BaselineUnitCost/QuantityIndicator/CarbonFactor）加注释 `// platform-wide, no tenant_id`
3. 生成 migration（如本机 prisma 跑得起来）：
   ```bash
   pnpm --config.engine-strict=false --filter @tongqian/prisma migrate-dev --name m31-add-tenant-defaults
   ```
   如本机跑不起来用 `--create-only` 让 Codex 手写 migration SQL

**反作弊**：
- ❌ 不许把 tenantId 改成 String?（必须非空）
- ❌ 不许漏掉任何业务表的 @@index([tenantId])

提交：`git add -A && git commit --no-verify -m "fix(m31): tenant_id defaults + indices on m28-m30 tables"; git push`

---

### 子块 5 · ToolRegistry 17 工具真接 service + verify-m31

**目标**：M28 子块 5 的 ToolRegistry 是占位的（toolManifest 只有 name），本期把 17 个 tool 真接到对应 service handler。

**操作**：

1. 改 `apps/api/src/modules/chat-hub/tool-registry.service.ts`：
   - 每个 tool 加 `description` + `parameters: z.object({...})` + `handler: async (params, ctx) => result`
   - handler 真注入 17 个 service（list_my_tenders → tenderService.list；query_qualification → qualificationService.checkExpiry 等）
2. 改 `apps/api/src/modules/chat-hub/chat-hub.service.ts` 加 tool-calling 流：
   - 收到 DeepSeek 的 tool_calls → 调 toolRegistry.invoke(name, params, ctx) → 结果回灌 → DeepSeek 二次生成
3. 加集成测试 `apps/api/src/modules/chat-hub/chat-hub-tool-calling.spec.ts`：
   - mock DeepSeek 返回 tool_call list_my_tenders → 验证真调用 tenderService → 返回结果含 tenders 数组

4. 写 `scripts/verify-m31.ps1`，**12 条 PASS/FAIL**：
   ```powershell
   $ErrorActionPreference = 'Stop'
   $pass = 0; $fail = 0
   function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -Fg Green; $script:pass++ } else { Write-Host "FAIL $name" -Fg Red; $script:fail++ } }
   
   # 1. admin lint 0 errors
   pnpm --config.engine-strict=false --filter @tongqian/admin lint 2>&1 | Out-Null
   Check 'M31.1 admin lint 0 errors' ($LASTEXITCODE -eq 0)
   
   # 2. 全 lint 通过
   pnpm --config.engine-strict=false lint 2>&1 | Out-Null
   Check 'M31.2 full lint 0 errors' ($LASTEXITCODE -eq 0)
   
   # 3. visual-lint 0 violations
   $vl = node scripts/visual-lint.mjs 2>&1 | Out-String
   Check 'M31.3 visual-lint 0 violations' (-not ($vl -match '^R\d' -or $vl -match 'hardcode|odd'))
   
   # 4-11. 8 个 spec 文件存在
   foreach ($svc in 'cost-catalog/cost-catalog','tender/rfp-rag','risk-review/red-flag-scan','chat-hub/tool-registry','project-site/schedule','customer-due-diligence/due-diligence','cost-estimate/budget-estimator','project-site/claim-record') {
     Check "M31.spec $svc" (Test-Path "apps/api/src/modules/$svc.service.spec.ts")
   }
   
   # 12. typecheck + test pass
   pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
   $tc = $LASTEXITCODE
   pnpm --config.engine-strict=false test 2>&1 | Out-Null
   $tt = $LASTEXITCODE
   Check 'M31.12 typecheck + test pass' ($tc -eq 0 -and $tt -eq 0)
   
   Write-Host ""
   Write-Host "M31 verify: $pass PASS / $fail FAIL"
   exit $fail
   ```

提交：

```bash
git add -A
git commit --no-verify -m "feat(m31): toolregistry 17 real handlers + verify-m31"
git push

# 验证 + 合并
powershell -ExecutionPolicy Bypass -File scripts/verify-m31.ps1
pnpm --config.engine-strict=false typecheck
pnpm --config.engine-strict=false lint
pnpm --config.engine-strict=false test

git checkout main
git pull origin main
git merge --no-ff feature/m31-audit-fix -m "merge: feature/m31-audit-fix into main

M31 全量体检修复:
- admin lint 3 处 import/order
- visual-lint 37 处违规（hex token 化 + 4px 间距）
- 8 个新 service 单元测试覆盖
- M28-M30 11 张表 tenant_id 默认值 + 索引
- ToolRegistry 17 工具真接 service handler

verify-m31.ps1 12/12 PASS

ref: .kiro/state/M31-AUDIT-FIX.md"

git push origin main

git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M31 done - all audit issues resolved"
git push origin main
```

---

## 2. 6 段交付（最后给万婷婷）

```
1. main HEAD sha + 7 commits
2. verify-m31.ps1 输出（12/12 PASS）
3. 修复明细：
   - admin lint 修复 3 处 import/order（前后行号）
   - visual-lint 修复 37 处（按 R1/R3/R5 分别多少）
   - 8 个 service spec 行数
   - tenant_id 加在 11 张表（哪 8 张业务表 + 哪 3 张 platform 全局）
   - ToolRegistry 17 handler 全部真注入了 service（不是 mock）
4. 全量自检：lint exit 0 / typecheck 22/22 / test 22/22 / visual-lint 0 / verify-m31 12/12
5. 一句话评估：架构是否稳定可上线
6. 已知限制（如 prisma migrate 在本机跑不动用 --create-only）
```

---

## 3. 反作弊清单 12 条

跟 verify-m31 12 条对应。

特别注意：
- ❌ 不许 `// eslint-disable` / `// visual-lint-disable` / `it.skip` 任何绕过
- ❌ 不许把 visual-lint 规则放宽（不许改 scripts/visual-lint.mjs）
- ❌ 8 个 spec 必须真断言业务（不许 `expect(true)`）
- ❌ 17 个 tool handler 必须真 inject service（grep 验证 constructor 至少含 5 个不同 service inject）

---

## 4. 一句话总结给 Codex

> 节流模式 + 不开 dev server + 不截图 + 5 子块 1 commit/块 + verify 12/12 + 6 段文本交付。
> 跑完了，main 分支真正干净到可上线 — lint 0 errors / visual-lint 0 violations / test 全过 / 8 新 service 有覆盖 / tenant 4 道防线齐 / 17 工具真接通。
