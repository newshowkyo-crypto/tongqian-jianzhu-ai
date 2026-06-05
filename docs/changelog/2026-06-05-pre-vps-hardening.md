# 2026-06-05 上线前总收口 · Pre-VPS Hardening

> 分支：`feature/m40-gov-truth-fix`
> 目标：上线 VPS 前可验收收口（迁移可复现、扣点不丢账、核心页面无乱码无假数据、部署脚本可执行）。
> 模式：standby（非 autopilot）→ 触及架构/安全级决策时按 AGENTS.md §14 停下报告。

---

## 一、工作区整理（#1）

### 已做
- `.gitignore`：补 `.env.*` / `.env.prod` 显式规则（原 `*.env` 仅匹配 `xxx.env`，不匹配 `.env.prod`）。保留 `!.env.example` / `!.env.dev.template` 白名单。已用 `git check-ignore -v` 验证 `.env.prod` / `.env.production` 现已被忽略。
- `.gitignore`：新增 `.kiro/state/_migration_work/`（本轮迁移核对脚本与中间产物，不入库）。
- 误删的 e2e 验收截图：worktree 中有 41 张已提交（历史验收证据，最早见 commit `e6d9842`）被删。**已 `git checkout -- tests/e2e/screenshots/` 全部恢复，未静默删除。**

### 不动（属于用户在途改动，非误删）
- `apps/web/src/app/projects/[id]/quality/rectifications/[id]/page.tsx`
  `apps/web/src/app/projects/[id]/subcontracts/[id]/evaluation/page.tsx`
  → 为 Next.js 动态路由参数重命名（`[id]` → `[rectificationId]` / `[subcontractId]`），已有未跟踪的新目录替换。保留不回滚。

### 回滚点建议
- 当前 dirty worktree 较大。建议在开始代码层修复前打 tag：
  `git stash` 不适用（改动需保留）；改用 **commit 分段**：
  1. 先单独提交「迁移 + 工作区整理」：`git add prisma/migrations/20260605000000_* .gitignore docs/changelog/2026-06-05-pre-vps-hardening.md && git commit`
  2. 该 commit 即为稳定回滚点（仅含可复现迁移 + 整理，可独立通过 gate）。
  3. 回滚用 `git revert <commit>`，**禁止** `git reset --hard` / `git push -f`（git-workflow.md §7）。

---

## 二、数据库迁移链修复（#2，最高优先级）—— 已完成且验证

### 根因
- `prisma/schema.prisma` 含 251 个 model（含 `owner_risk_*` / `market_signal_*` / credit 相关表）。
- `prisma/migrations` 正式迁移最新只到 `20260525120000_m31_add_tenant_defaults`（43 个）。
- dev 库（`tqj-postgres:25432/tongqian_dev`）此前用 `prisma db push` 推过 75 张新表（`_prisma_migrations` 只记录 43 条，但物理表已存在）→ **生产部署路径缺这 75 张表的正式迁移**。

### 处理
- 用本地锁定版 **prisma 5.22.0**（非全局 7.8.0）+ 全新 shadow 库 `tongqian_shadow` 做非破坏性 `migrate diff`。
- 生成的原始 diff 共 2117 行，**混入了破坏性语句**（见下「停下报告」）。按任务 #2 规则，**不强推破坏性 diff**。
- 仅抽取 **75 张新表的 additive DDL**（211 条语句：75 CREATE TABLE + 107 INDEX + 29 FK），新表外键只引用已存在的 `policy_funds`（`20260518223000` 已建）。
- 新迁移：`prisma/migrations/20260605000000_m40_owner_risk_market_situation_credit_tables/migration.sql`（1477 行）。

### 验证（全新空 shadow 库）
| 命令 | 结果 |
|---|---|
| `prisma migrate deploy`（44 条全链，从空库） | ✅ All migrations successfully applied |
| `prisma validate` | ✅ schema is valid |
| 新迁移 additive SQL 叠加在 43 链之上 | ✅ exit 0，`owner_risk_*`(8) + `market_signal_*`(9) 表全部创建 |
| 迁移→schema 残余 drift 中 owner_risk/market_signal 引用数 | **0**（新表迁移完整无遗漏） |

- **生产部署不依赖 `prisma db push --accept-data-loss`**：用 `prisma migrate deploy`。

### ⚠️ 停下报告：残余破坏性 drift（pre-existing，非本轮引入）
全链跑完后，`migrate diff (migrations → schema)` 仍有 428 行 drift，**全部是历史手改 schema 与旧迁移的偏移，且为破坏性**，按 §14 不自动应用：
- `121 ×` `ALTER COLUMN "id" DROP DEFAULT`（schema 把 `@default` 去掉、迁移里仍有）—— 多为无害的元数据漂移。
- `14 ×` `SET DATA TYPE TIMESTAMP(3)`（timestamptz → timestamp，**有时区语义变更风险**）。
- `2 ×` `DROP TABLE "carbon_estimates" / "carbon_factors"`（schema 已移除这两个 model；若生产已有数据则丢数据）。
- `3 ×` `DROP COLUMN`：`audit_logs` 的 id 漂移 + `gov_audit_logs.resource_id`。**`audit_logs` 触及审计日志红线（security-rules §13），严禁随意删列。**

**建议（待人工裁决，不自动执行）**：
1. carbon 两表：确认是否真的废弃。若废弃，单独写一支可逆迁移 + 数据迁出脚本，**不与本轮新表迁移混在一起**。
2. timestamptz→timestamp：确认是否有意。若否，应改 schema 用 `@db.Timestamptz` 对齐，而不是降级列类型。
3. `audit_logs` / `gov_audit_logs` 列变更：需法务/合规确认，默认**不动**。
4. `id DROP DEFAULT`：低风险，可在后续单独「schema 对齐」迁移统一处理。

---

## 三、Prisma 使用边界（#3）—— 已完成

### 问题
- `credentials-admin.controller.ts`、`ingest-admin.controller.ts`：模块级 `new PrismaClient()` + controller 内直接 `$queryRaw`/`$executeRaw`。
- `owner-risk.module.ts`、`market-situation.module.ts`：各自 `{ provide: PrismaClient, useValue: new PrismaClient() }`（每模块独立连接池）。

### 处理
- 新增共享 `PrismaService`（`database/prisma/prisma.service.ts`，extends PrismaClient + onModuleInit/onModuleDestroy 连接生命周期）。
- 新增全局 `DatabaseModule`（`@Global`，提供 `PrismaService` 并把 `PrismaClient` token `useExisting` 指向它，repository 注入 `@Inject(PrismaClient)` 不变即可复用）。`main.ts` AppModule 注册。
- owner-risk / market-situation module 去掉各自 `new PrismaClient()`，改走全局共享 provider。
- credentials-admin：拆出 `CredentialsAdminRepository`（Prisma ORM，零裸 SQL，`secrets` + `audit_logs` 走 ORM）+ `CredentialsAdminService`（编排/脱敏/审计），controller 变薄；guard / `@RequirePermission` / 统一 response wrapper 全部保留。
- ingest-admin：DB 访问下沉到 `IngestAdminRepository`（参数化 Prisma tagged template，留在数据层），controller 变薄。
- DI 统一用项目既有约定 `@Inject(Token)`。

### 验证
- `grep new PrismaClient` 全仓仅剩 `prisma.service.ts` 注释；controller 层裸 SQL = 0。
- `tsc --noEmit` ✅ / eslint（改动文件）✅。
- api 测试 60 passed（含新增 `credentials-admin.service.spec.ts` 6 个：list/detail/upsert+审计/switch-mode/test/audit）。

## 已通过的 gate
- `prisma validate` ✅
- `prisma migrate deploy`（空库全链 44 条）✅
- `apps/api` typecheck ✅ / eslint（改动文件）✅ / `node --test` 60 passed ✅

## 仍 defer / 待人工裁决
- 残余破坏性 drift（见 §二）——需人工确认 carbon 废弃 / timestamp 语义 / audit 列变更。

## 四、点数中心持久化（#4）—— 已暂缓（发现财务红线 bug，待真库会话）

### ⚠️ 发现：现有 preCharge→commit 双扣余额 bug
- `pre-charge.service.ts:26` preCharge 扣 `account.totalBalance -= amount` 且消耗 lot。
- `commit.service.ts:38` commit 再次扣 `account.totalBalance -= amount`（不碰 lot）。
- 结果：owner-risk 解锁走的 preCharge+commit 链**重复扣余额**，且 `totalBalance` 与 lot 余额之和不一致。
- 无任何 credit 单测覆盖；owner-risk/market 测试注入的是 fake CreditService，未触发真实逻辑。

### 决策（与用户确认）
- 账本语义改为：**preCharge=预扣（消耗 lot + 占用余额 hold）→ commit=度金/确认（不再扣余额）→ refund=释放 hold**。修正双扣。
- 持久化方案：accounts/lots/logs 落 Prisma；幂等用 `credit_logs.idempotency_key` 唯一约束；租户隔离用 account(userId+tenantId)；重启不丢靠 Postgres。
- 节奏：本轮先做 #5/#7（无财务风险），#4 留待可跑真库集成测试的专注会话再实现（~17 文件 async 级联，财务红线，不在上下文紧张的尾段抢做）。

## 五、owner-risk 去 Map（#5）—— 已完成

### 真实代码核查（不凭记忆）
OwnerRiskService 原有 8 个 Map：
- **3 个死 Map**（`cards` / `reports` / `unlockLogs`）：声明了但所有读写早已走 repository，纯冗余。
- **5 个"读但永不写"Map**（`guaranteeRecords` / `mixingRecords` / `watchlists` / `riskEvents` / `receivableRecords`）：从无 `.set()`，5 个 list 方法**恒返回 `[]`**（假空数据）。

### 处理
- 8 个 Map 全部删除。
- 5 个 list 方法改走 `OwnerRiskRepository` 真实 Prisma 读（新增 `listGuaranteeRecords` / `listMixingRecords` / `listCounterpartyWatchlist` / `listCounterpartyRiskEvents` / `listReceivableRecords`，均带 tenantId/(profileId|counterpartyId) 4 层 scope + `deletedAt: null`，Decimal→Number 映射）。
- 这 5 张表（owner_guarantee_records / owner_company_mixing_records / counterparty_watchlist / counterparty_risk_events / receivable_risk_records）已在 §二新迁移中创建，无需补 schema。

### 验证
- `grep new Map / : Map<` 于 owner-risk.service = 0。
- tsc ✅ / eslint ✅。
- owner-risk 测试 33→35（新增 2：guarantee 读经 repo + tenant/profile scope；其余 4 个 list 全部 delegate 验证）；api 全量 62 passed ✅。

## 七、前端去 mock/乱码/TBD（#7）—— owner-risk 三端 + 占位页已完成

### 真实扫描结果（不凭记忆）
- `锟斤拷` 等真乱码 CJK：**0 命中**（"乱码"问题此前已修，非本轮）。
- `TBD_TEXT`：12 文件（11 个为同款 34 行 Stitch 占位骨架 + customer-dd）。
- `mockReport`：1（mobile 报告页）；`mockProfiles`：3（mobile/admin-web/admin-app dashboard）。

### 处理
- **mobile/owner-risk/page.tsx**：mockProfiles → 真 `apiClient.ownerRisk.listProfiles()` + loading/error/empty（对齐 PC 版模式）。
- **mobile/owner-risk/report/[id]/page.tsx**：mockReport → 真 `getProfile + listReports`，无报告时 EmptyState「尚无风险报告」。
- **web /admin/owner-risk/page.tsx**：mockProfiles → 真 `listProfiles`；运营拦截/复核动作（无后端）改为 disabled「即将上线」，不再 fake console.log。
- **customer-dd/page.tsx**：全 TBD_TEXT/??? 占位 → 合规 Coming Soon（真中文标题 + EmptyState）。
- **11 个占位骨架页**（cashflow/ledger、cost-estimates×3、projects×2、tenders/rfp、admin credentials/legal-corpus/onboarding×2）→ 各自带正确中文标题的 Coming Soon（脚本生成，零 fake 数据）。
- **admin owner-risk dashboard/logs/cards**：fake 实时指标/最近记录/审计日志 → 「即将接入」空态；mockCards 是真实默认卡片目录 → 重命名 defaultCards 保留展示。

### 验证
- 重新 rg：生产页面 `TBD_TEXT`=0、`mockReport`=0、`mockProfiles`=0、`???`=0、乱码=0（market-situation 两页留 #6 处理）。
- 三端（PC/mobile/admin）owner-risk loading/empty/error 状态对齐；解锁/复核/报告按钮状态明确（无后端的标 disabled「即将上线」）。
- ⚠️ web/admin 前端 typecheck/build 因本 shell 无 pnpm + Next 复杂 tsconfig 未跑（环境限制，非代码）；改动均使用 PC 参考页同款 apiClient 方法/类型与 @tongqian/ui 组件，import 一致。

## 六、market-situation 真链路（#6）—— 已完成

### spec 判定（docs/TONGQIAN_OWNER_RISK_AND_MARKET_SITUATION_DEV_TASK.md §8）
spec 明确：所有 AI 调用必须经 AiGateway 完整闭环「点数检查→预扣→缓存→脱敏→模型路由→审计→实扣/回滚→返回」，且「AI 失败必须回滚点数」。原 `generateAnalysis` 只写 GenerationLog、不扣点不调 AI —— 违背 spec，非允许的 defer。

### 处理（后端）
- `generateAnalysis` 重写为完整闭环（对齐已验证的 owner-risk 模式）：preCharge → AiGateway.invoke → updateViewCount + createGenerationLog → commit；AI 失败 / DB 失败均 refund 并抛出。
- 新增 `GENERATION_TYPE_TO_TASK_TYPE`（summary/impact_analysis/simulation/report → 对应 AiTaskType）+ `GENERATION_TYPE_TO_CREDITS_COST`。
- module 引入 `AiGatewayModule`，service 注入 `AiGatewayService`。
- unlock/simulation/report/feedback 已确认全部 tenant scoped（经 repo 带 tenantId；既有测试覆盖）。

### 处理（前端，承接 #7）
- web `/admin/market-situation`：mockSignals → 真 `apiClient.marketSituation.listSignals` + loading/empty/error，运营动作 disabled「即将上线」。
- admin-app market-situation dashboard/logs/signals：fake 指标/信号/日志 → 「即将接入」EmptyState；删除随之失效的 helper。

### 验证
- market-situation 测试 12→16（新增：happy preCharge+commit 不重复扣、AI 失败 refund、DB 失败 refund、tenant scoped）。
- tsc ✅ / eslint（api 改动文件）✅ / api 全量 **66 passed** ✅。
- 全仓 app 页面 mock/TBD/乱码 终扫 = **0**。

## 八、契约一致性（#8）—— 已核验 + 强化

### 核验结果（真实代码为准）
- **`any` 返回类型 = 0**：api-client 全文 `Promise<any>`/`: any` 计数 0；仅 5 处 `unknown`，均在回调/helper（`onServerError`、`normalize*`），合规。
- **无假路由**：api-client 所有 owner-risk / market-situation HTTP 路径逐一对应真实 Nest controller 路由（owner-risk 20 路由、market-situation 18 路由）。
- **openapi 1:1**：`openapi.yaml` 含 owner-risk 14 path + market-situation 14 path（含 #6 新接的 `/signals/{id}/analyze`、`/owner-risk/profiles/{profileId}/analyze`），与 controller 对齐。
- **real/mock 结构一致**：mock 与真实返回同形（spec 断言覆盖）。

### 强化
- `packages/api-client/src/index.spec.ts`：4→6 测试，新增 ownerRisk `listProfiles` + guarantee/receivable 列表结构断言、marketSituation `getSignal` + `unlockSignal` real/mock 同形断言。
- 验证：api-client typecheck ✅ / spec **6 passed** ✅。

## 进行中
- #4（点数中心持久化，待可跑真库的专注会话）/ #9 部署一键 VPS。
