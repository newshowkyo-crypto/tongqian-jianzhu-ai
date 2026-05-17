---
inclusion: always
---

# 自检流程（DoD - Definition of Done）

> Codex / Claude Code 在 Autopilot 模式下，每个 atomic task 完成前**必须**通过本 DoD。失败按 [`error-recovery.md`](./error-recovery.md) 修复后回到 DoD。

## 1. DoD 总原则

```
失败 → 走 error-recovery.md → 修复 → 回到 DoD
失败 ≥ 3 次 → 标记 blocked + 跳过（progress.json）
SHALL NOT 跳过 DoD 直接 commit
```

## 2. 通用 DoD（所有 task 必过）

| # | 检查项 | 命令 / 工具 | 通过条件 |
|---|---|---|---|
| 1 | TypeScript 类型 | `pnpm typecheck` | 0 error |
| 2 | ESLint | `pnpm lint` | 0 error（warning 视严重度，新增 warning 数 = 0）|
| 3 | 编译 | `pnpm build`（仅本 task 涉及的 workspace）| 通过 |
| 4 | 单元测试 | `pnpm test --filter <relevant>` | 100% 通过 |
| 5 | 修改的文件已格式化 | Prettier 自动 | 无格式 diff |
| 6 | 无 `any` / `@ts-ignore` | grep 检查 | 0 个新增 |
| 7 | 无 `console.log`（业务代码）| grep | 0 个新增 |
| 8 | 无注释掉的死代码 | grep `^\s*//\s*[a-z]` | 无 |
| 9 | 修改的文件 ≤ 5 个 | git diff --name-only | true |
| 10 | 修改总行数 ≤ 500 | git diff --shortstat | true |

**任一不通过 → 修复 + 回到 1**。

## 3. 任务类型专属 DoD

### 3.1 Backend Service / Repository 任务

通用 DoD + 以下：

| # | 检查项 | 通过条件 |
|---|---|---|
| 11 | 单测覆盖率 | ≥ 85%（核心模块）/ 75%（非核心）|
| 12 | service 方法有 JSDoc | 每个 public 方法都有 |
| 13 | Repository 经 BaseRepository | 不直接 import PrismaClient |
| 14 | 4 层 WHERE 自动注入 | 通过 PBT |
| 15 | idempotency 已实现 | 写接口测同 key 重复返回 |
| 16 | 错误用 `BusinessError` | grep `throw new Error` 0 个新增 |
| 17 | tenant_id 在所有写操作中 | grep 检查 |

### 3.2 Backend Controller / API 任务

通用 DoD + 以下：

| # | 检查项 | 通过条件 |
|---|---|---|
| 18 | OpenAPI 已注册 | `pnpm gen:api` 不报错 |
| 19 | DTO 用 zod / class-validator | 校验完整 |
| 20 | 权限点装饰器 | `@RequirePermission` 已加 |
| 21 | e2e happy + 错误路径 | 每 endpoint ≥ 2 个 e2e |
| 22 | 跨租户 e2e 拒绝 | tokenA / tokenB 测试通过 |
| 23 | 响应包装 | `{ code, data, message, traceId }` |
| 24 | Idempotency-Key 头 | 非 GET 请求支持 |

### 3.3 数据库 Schema 改动任务

| # | 检查项 | 通过条件 |
|---|---|---|
| 25 | Migration 已生成 | `prisma migrate dev` 通过 |
| 26 | Migration 可回滚 | 写 down 脚本 |
| 27 | 表名 snake_case 复数 | `users` 不是 `user` |
| 28 | 字段名 snake_case | `created_at` 不是 `createdAt` |
| 29 | 含 tenant_id（业务表）| 系统表例外 |
| 30 | 通用字段 | id / created_at / updated_at / deleted_at / created_by |
| 31 | 必加索引 | 外键 / tenant_id / status / created_at |
| 32 | 软删除 | `deleted_at` 字段 |

### 3.4 AI Gateway / Prompt 任务

| # | 检查项 | 通过条件 |
|---|---|---|
| 33 | PromptTemplate 完整 | taskType / version / tier / inputSchema / outputSchema / fallbackText |
| 34 | 4 强制要素 schema | outputSchema.merge(RequiredElementsSchema) |
| 35 | tier 函数 PBT | 单调性测试通过 |
| 36 | 红线表述拦截 | 输出含"必须 / 一定 / 绝对" → blocked |
| 37 | 脱敏 round-trip | unmask(mask(x)) === x |
| 38 | 已注册到 04 R14 | grep ai-task/task-type.ts |
| 39 | 扣点配置 | packages/constants/credit-pricing.ts 有默认 |

### 3.5 前端组件任务

| # | 检查项 | 通过条件 |
|---|---|---|
| 40 | 颜色从 token 取 | grep `style.*color` 0 个 inline 颜色 |
| 41 | 字号从规范取 | text-2xl/xl/lg/base/sm/xs 之一 |
| 42 | 间距 4px 倍数 | 无 p-3/p-5/p-7（除非有 ADR）|
| 43 | 圆角统一 | rounded-md/lg/xl |
| 44 | 阴影统一 | shadow-sm/shadow/shadow-md |
| 45 | EmptyState | 列表组件有 |
| 46 | LoadingState | 异步组件有 |
| 47 | ErrorState | 异步组件有 |
| 48 | RTL 测试 | 渲染 + 基础交互 |
| 49 | a11y | axe-core 0 violations |
| 50 | 移动端响应式 | 触控 ≥ 44px |
| 51 | 中文用"您" | grep "你的" 0 个（业务文案）|
| 52 | 图标 lucide | grep emoji 作功能 0 个 |

### 3.6 前端页面任务

通用 DoD + 上面 §3.5 + 以下：

| # | 检查项 | 通过条件 |
|---|---|---|
| 53 | TanStack Query | 不用 useEffect + fetch |
| 54 | API client | 经 packages/api-client，不直接 axios |
| 55 | Zustand 仅放全局状态 | 不放 API data |
| 56 | 表单 react-hook-form + zod | 不用 useState 管表单 |
| 57 | 关键操作 toast | 成功 / 失败 |
| 58 | 路由守卫 | middleware.ts 鉴权 |

### 3.7 PBT 任务

| # | 检查项 | 通过条件 |
|---|---|---|
| 59 | 用 fast-check | 实际跑 ≥ 100 次 random |
| 60 | 边界测试 | 含 0 / 负数 / 极大 / 空 |
| 61 | 反向回滚（适用）| 操作 + 反向 = identity |

### 3.8 测试 task

| # | 检查项 | 通过条件 |
|---|---|---|
| 62 | 不 mock 全部依赖 | 至少一层真实调用 |
| 63 | 每个 it 独立 | 不依赖前一个 |
| 64 | afterEach 清理 | 防副作用 |
| 65 | 单测耗时 ≤ 10s | 超出拆分 |

## 4. 自检命令套件

```bash
# 单 task 自检最小命令集
pnpm --filter <package> typecheck \
  && pnpm --filter <package> lint \
  && pnpm --filter <package> test --run \
  && pnpm --filter <package> build

# 跨 package 影响检查
pnpm typecheck

# OpenAPI 一致性（如改了 contracts）
pnpm gen:api

# 循环依赖检查（如改了 packages）
pnpm madge --circular packages/

# E2E（如改了 controller / 前端页面）
pnpm test:e2e --grep "<feature>"

# 5 个关键路径 e2e（每个大 spec 完成后跑）
pnpm test:e2e:critical
```

## 5. 失败处理流程

```
Step 1: 看错误信息
  - TypeScript error → 修类型
  - ESLint error → 修代码风格
  - Test fail → 看断言信息
  - Build fail → 看具体模块

Step 2: 查 error-recovery.md 对应 playbook
  - 找到 → 按 playbook 修
  - 找不到 → Step 3

Step 3: grep 周边代码看模式
  - 复用既有写法
  - 修复后回 §4 自检命令

Step 4: 重读 spec 确认约束
  - 是否漏了 Acceptance Criteria
  - 是否走错了 BR
  - 修复后回 §4

Step 5: 仍失败（已 3 次）
  - 写 progress.json blocked + 失败原因
  - 跳到下一 task
```

## 6. 提交前最终检查（git pre-commit）

```bash
# Husky + lint-staged 自动跑
- prettier --write
- eslint --fix
- typecheck on staged files
- 单测仅跑 changed scope
```

如 pre-commit 失败 → 修代码而不是 `--no-verify`。

## 7. 整体里程碑 DoD（每个 phase 完成时跑）

每个 spec 的 tasks 全部完成时（如 22-H3 完成 → 22 spec 完成）：

```bash
pnpm install        # 检查依赖整洁
pnpm typecheck      # 全 workspace
pnpm lint           # 全 workspace
pnpm test --run     # 全部单测
pnpm build          # 全部应用 + packages
pnpm gen:api        # OpenAPI ↔ types 一致
pnpm madge --circular packages/  # 0 循环依赖
pnpm test:e2e:critical  # 5 个 e2e 场景
```

任一不过 → 不进下一 spec，回头修。

## 8. 最终 Final DoD（全部 spec 完成时）

按 [`autopilot-rules.md` §11](./autopilot-rules.md) 跑。
