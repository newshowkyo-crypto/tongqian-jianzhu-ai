# 02 共享契约 - Tasks

> Codex / Claude Code 按本任务清单顺序实施。每个任务勾完才能进下一个。
>
> ⚠️ **任务粒度约束**（按 [`memory-management.md` §3.1](../../steering/memory-management.md)）：单任务修改文件 ≤ 5 个、修改行数 ≤ 500 行。原 A1 一个任务建 12 个文件违反此约束，已拆分为 A1a / A1b。

## 任务总数：22

## Phase A：types 包（7 个）

- [x] **A1a** 在 `packages/types/src/auth/` 实现 4 文件
  - 文件：`role.ts` / `position-tag.ts` / `tenant.ts` / `scope.ts` + `index.ts`
  - 验收：`pnpm --filter @tongqian/types build` 通过；导出 4 大角色 + 30+ 岗位标签 + 4 层 WHERE Scope 类型

- [ ] **A1b** 在 `packages/types/src/common/` 实现 8 文件
  - 文件：`api-response.ts` / `pagination.ts` / `id.ts` / `money.ts` / `audit.ts` / `trace.ts` / `async-task.ts` / `idempotency.ts` + `index.ts`
  - 验收：协议 P-1 至 P-3 / P-8 类型定义齐全；ApiResponse / ApiResponseList 双形态导出

- [ ] **A2a** 在 `packages/types/src/subscription/` 实现 plan / status / change-plan / auto-renewal
  - 验收：5 档订阅枚举 + 完整状态机 trial/active/past_due/canceled/expired

- [ ] **A2b** 在 `packages/types/src/credit/` 实现 transaction / lot / expiry
  - 验收：点数有效期分类（订阅/充值/赠送/失败退还）枚举齐全

- [ ] **A3a** 在 `packages/types/src/ai-task/` 实现 task-type / tier / confidence / next-step / cache-strategy / provider / sanitize-mask
  - 验收：50+ AiTaskType 起步枚举 + Tier 1-4 + 4 强制要素接口

- [ ] **A3b** 在 `packages/types/src/report/` 实现 status / required-elements + zod schema
  - 验收：BR-322 4 强制要素 zod schema 可校验任意业务输出

- [ ] **A4** 在 `packages/types/src/dispatch/` 与 `packages/types/src/reputation/` 各实现起步类型
  - dispatch：`need-class.ts`（A/B/C）/ `pool.ts`（owned/cross/public）/ `status.ts` / `quote-color.ts`
  - reputation：`score.ts` / `level.ts`（LV1-5）/ `event-type.ts`（30+ 事件）
  - 验收：types/dispatch + types/reputation 全部导出

- [ ] **A5** 在 `packages/types/src/approval/` 实现协议 P-7
  - 文件：`flow.ts` / `step.ts` / `decision.ts`
  - 验收：ApprovalFlow / ApprovalStep / ApprovalRequest / ApprovalDecision 接口齐全

## Phase B：errors 包（3 个）

- [ ] **B1** 实现 `BaseError` + 8 类业务错误子类
  - 文件：`base-error.ts` / `business-error.ts` / `validation-error.ts` / `auth-error.ts` / `permission-error.ts` / `not-found-error.ts` / `conflict-error.ts` / `rate-limit-error.ts` / `upstream-error.ts`
  - 验收：每个错误类含 code / httpStatus / message / details / traceId 字段

- [ ] **B2** 实现 `codes.ts`（按 [`design.md` §11.5](../00-project-overview/design.md) 33 个命名空间起步框架）
  - 验收：每命名空间至少 1 个示例错误码 + `as const satisfies Record<string, ErrorCodeDef>`

- [ ] **B3** 实现 `errorMiddleware`（NestJS 异常过滤器）+ `getErrorMessage` 工具
  - 验收：能把 BaseError 序列化成 ApiResponse 失败格式 + 单测覆盖

## Phase C：permissions 包（3 个）

- [ ] **C1** 实现 `roles.ts` + `agent-subtypes.ts` + `position-tags.ts` + `platform-roles.ts`
  - 验收：4 大注册角色 + 4 类智能管家子类型 + 30+ 岗位 + 8 个平台运营子角色全部导出

- [ ] **C2** 实现 `permission-points.ts`（业务权限点常量）
  - 验收：起步 ≥ 30 个权限点（合同/订阅/派单/数据导出/提现/申诉/平台运营），`{resource}:{action}` 格式

- [ ] **C3** 实现 `role-permission.ts` + `position-permission.ts` 映射表 + `hasPermission` 工具 + `scope-guard.ts`
  - 验收：`hasPermission(roles, positionTags, point)` 单测覆盖

## Phase D：constants 包（3 个）

- [ ] **D1a** 实现订阅 / 点数 / 分润 / 派单阈值 / 推荐费 / Tier 常量（含 `seedSystemConfigs()` 导出）
  - 文件：`subscription-plans.ts` / `discount-ladders.ts` / `credit-pricing.ts` / `commission-rates.ts` / `dispatch-thresholds.ts` / `dispatch-rates.ts` / `referral-fee-rates.ts` / `tier-thresholds.ts`
  - 验收：每文件同时输出 `as const` 默认值 + `seedSystemConfigs()` 函数（按 [`design.md` §5.14](../00-project-overview/design.md) 后台覆盖契约）

- [ ] **D1b** 实现信誉规则 / 派单权重 / 红线 常量（含 `seedSystemConfigs()` 导出）
  - 文件：`reputation-rules.ts` / `reputation-levels.ts` / `dispatch-weights.ts` / `red-lines.ts` / `takeover-triggers.ts` / `premium-services.ts`
  - 验收：BR-336 4 维加权 + BR-331/332/333 信誉规则 + BR-901 红线全部可后台覆盖

- [ ] **D2** 实现限流 / 缓存 / 货币显示 / 杂项常量（不需后台覆盖）
  - 文件：`rate-limits.ts` / `ai-rate-limits.ts` / `cache-ttl.ts` / `currency-display.ts` / `refund-policy.ts` / `refund-tiers.ts` / `reactivation-window.ts` / `agent-activity-thresholds.ts` / `agent-referral-bonus.ts` / `fission-rates.ts` / `checkin-rewards.ts` / `lottery-schedule.ts` / `urgency-limits.ts` / `cost-floor.ts`
  - 验收：纯 `as const`，与 D1a/b 区分清楚（`README.md` 列表标注哪些可后台覆盖）

## Phase E：contracts 包（3 个）

- [ ] **E1** 创建 `openapi.yaml` 主入口 + 目录结构
  - 文件：`openapi.yaml` 仅含 `/health` + `paths/` 与 `components/` 目录占位
  - 验收：通过 `redocly lint`

- [ ] **E2** 实现 `pnpm gen:api` 命令（用 openapi-typescript-codegen + openapi-zod-client）
  - 验收：`pnpm gen:api` 可成功生成 client + zod schemas 到 `generated/`

- [ ] **E3** 添加 redocly lint 配置 + CI 校验 + 与 packages/types DTO 一致性检查
  - 验收：CI 在 OpenAPI 与 types 不一致时 fail

## Phase F：utils + ui 起步（2 个）

- [ ] **F1** 在 `packages/utils/` 实现日期 / 金额 / 字符串 / 加解密 工具函数
  - 验收：date-fns 封装 + Decimal 金额格式化 + AES-256-GCM 工具 + traceId 生成

- [ ] **F2** 在 `packages/ui/` 配置 shadcn/ui 基础（design-token + 几个 primitive）
  - 完整 ui 由 [`03-design-system`] spec 实施，本处仅起骨架
  - 验收：tailwind preset 导出 + 4 个子前端可引用

## Phase G：system_configs 后台覆盖契约（1 个）

- [ ] **G1** 实现 `apps/api/src/modules/system-config/` 起步骨架（被 [`24-admin-console`] 后续完整化）
  - 文件：`system-config.service.ts`（读 + 缓存 + 失败回落 constants）+ `system_configs` / `system_config_history` 数据表 schema
  - 验收：`SystemConfigService.get(key)` 可读取（默认空，回落 constants）+ Prisma migration 生成

## 验收

- ✅ 所有 packages 在 `pnpm install` 后被 workspace 识别
- ✅ `pnpm build` 跑通全部 packages
- ✅ `madge --circular packages/` 无循环依赖（CI 强制）
- ✅ `pnpm gen:api` 可成功生成 client（即使 openapi.yaml 只有 /health 一个 endpoint）
- ✅ D1a / D1b 所有"必须后台可调"项有对应 `seedSystemConfigs()` 函数
- ✅ G1 完成后，`SystemConfigService` 可在 [`24-admin-console`] 后续被完整化

---

## V4 IMPROVEMENTS 新增任务（漏洞 8 测试 fixtures 体系）

- [ ] **02-IMP-1** packages/test-fixtures 包骨架 + package.json
- [ ] **02-IMP-2** tenants fixture（10 建筑 + 5 政企 + 8 智能管家 + 4 平台）
- [ ] **02-IMP-3** contracts fixture（5 高风险 + 5 中风险 + 5 安全 + 5 招标文件）
- [ ] **02-IMP-4** qualifications fixture（10 证书 + 20 人员 + 10 升级路径）
- [ ] **02-IMP-5** projects fixture（50 机会 + 业主真假混合）
- [ ] **02-IMP-6** financial fixture（应收 + 现金流）
- [ ] **02-IMP-7** policy-funds fixture（11 国家 + 8 省级 seed）
- [ ] **02-IMP-8** seed 脚本（dev / test / prod 三档）
- [ ] **02-IMP-9** 与 29-prompt-testing 黄金测试集协同
- [ ] **02-IMP-10** fixture 工具函数（spread / scenario / scope-aware）
