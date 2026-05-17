# 02 共享契约 - Requirements

## Introduction

> 本 spec 实现 [`顶层 design §11`](../00-project-overview/design.md) 的"共享契约层"：5 个 packages（types / contracts / permissions / errors / constants）+ 横切的协议（idempotency / 审计 / traceId / 多租户 WHERE / 错误码）。

**作用**：所有后续模块（包括 5 大杀手锏）都从这里 import 类型、错误码、权限点、常量。修改契约必须先合本 spec，再改业务代码。这是 Codex 多会话并发开发**不冲突的关键**。

---

## Requirements

### Requirement 1：packages/types（共享类型）

#### Acceptance Criteria

1. THE `packages/types/` SHALL 按以下子目录组织（按"领域"划分，与子 spec 对齐）：

   ```
   packages/types/src/
   ├── index.ts                  # 主导出
   ├── auth/                     # 认证与租户类型
   │   ├── role.ts               # UserRole / AgentSubtype 枚举
   │   ├── position-tag.ts       # 30+ 岗位标签
   │   ├── tenant.ts             # Tenant / TenantType
   │   ├── scope.ts              # Scope / ScopeContext（4 层 WHERE）
   │   └── index.ts
   ├── subscription/             # 订阅类型
   │   ├── plan.ts               # 5 档枚举
   │   ├── status.ts             # trial/active/past_due/...
   │   └── index.ts
   ├── credit/                   # 点数
   │   ├── transaction.ts
   │   ├── lot.ts
   │   └── index.ts
   ├── ai-task/                  # AI 任务
   │   ├── task-type.ts          # AiTaskType 枚举（全部 50+）
   │   ├── tier.ts               # 1/2/3/4
   │   ├── confidence.ts
   │   ├── next-step.ts
   │   └── index.ts
   ├── dispatch/                 # 派单
   │   ├── need-class.ts         # A/B/C
   │   ├── pool.ts               # owned / cross / public
   │   ├── status.ts
   │   └── index.ts
   ├── reputation/               # 信誉
   │   ├── score.ts
   │   ├── level.ts              # LV1-5
   │   ├── event-type.ts         # 见 [顶层 design §8.2]
   │   └── index.ts
   ├── report/                   # 报告
   │   ├── status.ts
   │   ├── required-elements.ts  # 4 强制要素
   │   └── index.ts
   ├── common/                   # 通用
   │   ├── pagination.ts
   │   ├── api-response.ts       # { code, data, message, traceId }
   │   ├── id.ts                 # cuid
   │   ├── money.ts              # Decimal 包装
   │   └── index.ts
   └── ...（其他领域子目录由对应子 spec 增量添加）
   ```

2. 所有 enum SHALL 用 TypeScript `enum` 或 `as const` 双形态导出（兼容 Prisma + zod）。
3. 所有 DTO SHALL 配套提供 zod schema 用于运行时校验，存放在 `packages/types/src/{domain}/schemas/`。
4. THE package SHALL 不依赖任何业务代码，纯类型定义。
5. THE package SHALL 提供 `.d.ts` 输出，使其他 package / app 直接 `import type {...} from '@tongqian/types'`。

---

### Requirement 2：packages/errors（错误体系）

#### Acceptance Criteria

1. THE `packages/errors/` SHALL 提供基础错误类：
   - `BaseError`：所有业务错误的基类（含 code / httpStatus / message / details / traceId）
   - `BusinessError`：业务规则违反（422）
   - `ValidationError`：输入校验失败（400）
   - `AuthError`：未认证（401）/ `PermissionError`：无权限（403）
   - `NotFoundError`：资源不存在（404）
   - `ConflictError`：状态冲突（409）
   - `RateLimitError`：限流（429）
   - `UpstreamError`：上游模型 / 第三方服务错（502）
2. THE `errors/codes.ts` SHALL 集中定义全部错误码，按 [顶层 design §11.5 命名空间分配](../00-project-overview/design.md)：
   - `AUTH.*` / `PERM.*` / `TENANT.*` / `SUB.*` / `CREDIT.*` / `PAY.*` / `REPORT.*` / `OPP.*` / `TENDER.*` / `CONTRACT.*` / `QUAL.*` / `OPS.*` / `SITE.*` / `COST.*` / `DRAW.*` / `CASH.*` / `KB.*` / `RULE.*` / `AGENT.*` / `DISPATCH.*` / `RATING.*` / `REPUTATION.*` / `APPEAL.*` / `REFP.*` / `GOV.*` / `ADMIN.*` / `CHAT.*` / `ADDICT.*` / `NOTIF.*` / `SEC.*` / `FRAUD.*` / `AUDIT.*` / `EXPORT.*` / `AI.*`
3. 每个错误码 SHALL 定义为：
   ```ts
   export const ErrorCodes = {
     CREDIT_INSUFFICIENT: {
       code: 'CREDIT.DEDUCT.INSUFFICIENT',
       httpStatus: 422,
       message: '点数余额不足',
       userActionable: true,
     },
     // ...
   } as const;
   ```
4. THE package SHALL 提供 `errorMiddleware`（可选，给 NestJS 用），自动序列化错误为统一 API 响应格式。

---

### Requirement 3：packages/permissions（权限）

#### Acceptance Criteria

1. THE `packages/permissions/src/` SHALL 包含：
   - `roles.ts`：4 大注册角色枚举 + 8 个平台运营子角色
   - `position-tags.ts`：30+ 岗位标签枚举（详见 [glossary §3](../../../docs/glossary.md)）
   - `agent-subtypes.ts`：4 类智能管家
   - `permission-points.ts`：业务权限点（如 `contract:approve` / `data-export:trigger` / `agent:dispatch`）
   - `role-permission.ts`：角色 → 权限点映射表
   - `position-permission.ts`：岗位标签 → 权限点映射表
   - `scope-guard.ts`：4 层 WHERE 类型定义（被 base-repository 用）
2. 所有权限点 SHALL 用 `{resource}:{action}` 格式。
3. THE package SHALL 提供 `hasPermission(roles, positionTags, requiredPoint): boolean` 工具函数。

---

### Requirement 4：packages/constants（常量）

#### Acceptance Criteria

1. THE `packages/constants/src/` SHALL 按业务领域组织：
   - `subscription-plans.ts`：5 档订阅参数（月费 / 含点数 / 功能开关）
   - `credit-pricing.ts`：每个 AI 任务扣点（来自 [`business-model.md` §5](../../../docs/business-model.md)）
   - `commission-rates.ts`：分润比例（30%/20%/15%/5%/10%）
   - `dispatch-thresholds.ts`：A/B/C 三分类阈值（¥10万/¥3万/¥5000万 等）
   - `dispatch-weights.ts`：4 维加权评分权重（来自 BR-336）
   - `referral-fee-rates.ts`：推荐费比例
   - `reputation-rules.ts`：信誉加减分项 + 等级阈值
   - `tier-thresholds.ts`：AI Tier 1/2/3/4 金额阈值
   - `red-lines.ts`：6 条风险红线阈值
   - `rate-limits.ts`：API + AI 限流参数
   - `cache-ttl.ts`：缓存时长
   - `currency-display.ts`：1 元 = 100 点
2. 所有常量 SHALL 是 `export const ... as const`（防止运行时改）。
3. 部分常量（定价 / 阈值）SHALL NOT 写死在代码中，**SHALL** 同时提供数据库表 `system_configs` 的初始值，运营可后台覆盖（详见 [`24-admin-console`]）。

---

### Requirement 5：packages/contracts（API 契约）

#### Acceptance Criteria

1. THE `packages/contracts/openapi.yaml` SHALL 是**唯一**的 API 真理源，所有 API endpoint 必须先在此声明再实现。
2. THE openapi.yaml SHALL 按子 spec 分文件维护，主文件用 `$ref` 引用：
   ```
   packages/contracts/
   ├── openapi.yaml              # 主入口
   ├── paths/
   │   ├── auth.yaml
   │   ├── subscriptions.yaml
   │   ├── credits.yaml
   │   ├── payments.yaml
   │   ├── reports.yaml
   │   ├── opportunities.yaml
   │   ├── tenders.yaml
   │   ├── contracts.yaml
   │   ├── qualifications.yaml
   │   ├── ops-toolkit.yaml
   │   ├── agents.yaml
   │   ├── dispatches.yaml
   │   ├── reputation.yaml
   │   ├── ratings.yaml
   │   ├── appeals.yaml
   │   ├── ref-prices.yaml
   │   ├── gov.yaml
   │   ├── admin.yaml
   │   ├── chat.yaml
   │   ├── addiction.yaml
   │   ├── notifications.yaml
   │   └── ...
   └── components/
       ├── schemas/             # 引用 packages/types
       ├── responses/
       ├── parameters/
       └── examples/
   ```
3. THE package SHALL 提供 `pnpm gen:api` 命令：
   - 用 `openapi-typescript-codegen` 生成 client 代码到 `packages/api-client/`
   - 用 `openapi-zod-client` 生成 zod schemas
   - 与 `packages/types` 的 DTO 比对，不一致则报错
4. THE openapi.yaml SHALL 通过 `redocly lint` 校验。

---

### Requirement 6：跨模块协议实现（P-1 至 P-8）

依据 [顶层 design 附录 A](../00-project-overview/design.md)，本 spec 提供以下协议的**类型定义**（实现在 apps/api 的 common/ 中）：

#### Acceptance Criteria

1. **P-1 幂等性**：在 `packages/types/common/idempotency.ts` 定义 `IdempotencyKey = string` 类型 + `IdempotentRequest<T>` 包装器
2. **P-2 审计日志**：在 `packages/types/common/audit.ts` 定义 `AuditLog` schema（id / traceId / userId / tenantId / action / resource / before / after / ip / userAgent / createdAt）
3. **P-3 链路追踪**：在 `packages/types/common/trace.ts` 定义 `TraceId = string` 类型
4. **P-4 多租户 WHERE**：见 R3 的 `scope-guard.ts`
5. **P-5 AI Gateway 调用约定**：在 `packages/types/ai-task/` 全套
6. **P-6 错误码命名空间**：见 R2 的 `codes.ts`
7. **P-7 审批流统一接口**：在 `packages/types/approval/` 定义 `ApprovalFlow / ApprovalStep / ApprovalRequest / ApprovalDecision`
8. **P-8 长任务约定**：在 `packages/types/common/async-task.ts` 定义 `AsyncTaskStatus = 'queued' | 'processing' | 'completed' | 'failed'`

---

### Requirement 7：包间依赖（强约束）

按 [顶层 design §11.3](../00-project-overview/design.md) 单向依赖：

```
types（叶子根，不依赖任何）
  ↑
constants / errors / permissions（依赖 types）
  ↑
contracts（依赖以上四个）
ui / utils（依赖 types / constants）
```

#### Acceptance Criteria

1. CI SHALL 用 `madge --circular` 检测循环依赖，发现即 fail
2. 业务代码（apps/）SHALL NOT 互相 import，必须经 packages/ 中转

---

### Requirement 8：版本与发布

#### Acceptance Criteria

1. 所有 packages SHALL 用 `workspace:*` 协议在 monorepo 内引用
2. 暂不发布到 npm registry（OPC 模式无需）
3. 修改任一 package SHALL 在 `docs/changelog/` 写改动说明（重大修改触发 ADR）

---

### Requirement 9：边界

1. 本 spec SHALL NOT 包含具体业务实现（service / controller / DAO）
2. 本 spec SHALL NOT 包含数据库 schema（在 prisma/）
3. 本 spec SHALL NOT 包含具体业务的 zod schema（仅提供框架，业务 schema 在对应业务包）
4. 本 spec SHALL NOT 包含 i18n 文案（在 apps/web/src/i18n/）

---

### Requirement 10：依赖

- 前置：[`01-infra-monorepo`] 完成 Phase A（packages 占位目录已创建）
- 后续阻塞：本 spec 不完成，所有业务 spec 都不能开始


---

## V4 IMPROVEMENTS · 测试 fixtures 体系（漏洞 8 修补）

### Requirement 5：测试 fixtures 体系

#### Acceptance Criteria

#### R5.1 目录结构

```
packages/test-fixtures/
├── src/
│   ├── tenants/
│   │   ├── building-companies.ts    # 10 个建筑企业 fixture
│   │   ├── gov-units.ts              # 5 个政企 fixture
│   │   ├── agents.ts                 # 8 个智能管家 fixture（4 子类型 × 2 + PARTNER ×？）
│   │   └── platform.ts               # 平台运营 4 个角色 fixture
│   ├── contracts/
│   │   ├── high-risk.ts              # 高风险合同（无限连带 / 工期违约金过高）5 个
│   │   ├── medium-risk.ts            # 中风险 5 个
│   │   ├── safe.ts                   # 安全合同 5 个
│   │   └── tender-docs.ts            # 招标文件 5 个
│   ├── qualifications/
│   │   ├── certificates.ts           # 资质证书 OCR 后结构化 fixture
│   │   ├── personnel.ts              # 关键人员（建造师 / 安全员）20 个
│   │   └── upgrade-paths.ts          # 升级路径案例 10 个
│   ├── projects/
│   │   ├── opportunities.ts          # 项目机会 50 个（覆盖各地区 / 业务线）
│   │   └── owners.ts                 # 业主 fixture（含真假性混合）
│   ├── financial/
│   │   ├── ar-aging.ts               # 应收账龄 Excel
│   │   └── cashflow.ts               # 现金流数据
│   ├── policy-funds/
│   │   ├── national.ts               # 国家级 11 项
│   │   └── provincial.ts             # 省级 8 项
│   ├── prompts-golden/
│   │   └── ...                       # 与 29-prompt-testing 协同
│   └── index.ts
└── package.json
```

#### R5.2 数据来源

1. **真实场景脱敏**：你团队咨询专家配合提供 50+ 真实合同 / 招标 / 资质 → 脱敏后入库
2. **AI 辅助生成**：用 GPT-4 / Claude 生成补充场景（数据真实性由专家 review）
3. **公开数据爬取**：从中国招标投标公共服务平台爬取脱敏招标公告

#### R5.3 fixture 使用规范

```typescript
import { fixtures } from '@tongqian/test-fixtures';

// 单元测试
const tenant = fixtures.tenants.buildingCompanies[0];
const contract = fixtures.contracts.highRisk[0];

// 集成测试
const seed = fixtures.seed.full();  // 完整数据库 seed
await prisma.tenant.createMany({ data: seed.tenants });

// e2e 测试
const scenario = fixtures.scenarios.contractReviewFlow;
```

#### R5.4 seed 自动生成脚本

```bash
pnpm seed:dev        # 开发环境（少量真实场景）
pnpm seed:test       # 测试环境（完整 fixture）
pnpm seed:prod       # 生产环境（仅平台基础数据，无业务）
```

#### R5.5 fixture 维护

- 每个新 spec 实施时，作者必须补充对应 fixture
- 月度 review fixture 完整性
- 与 29-prompt-testing 黄金测试集协同（黄金测试集是 fixture 的特殊形态）

### Requirement 6：依赖（V4 IMPROVEMENTS 升级）

- 强依赖：[`01-infra-monorepo`]（packages 结构）
- 弱依赖：所有业务 spec（提供测试数据）
