---
inclusion: always
---

# 编码规范（Coding Standards）

> 适用范围：本仓库全部代码（前端 / 后端 / Worker / 桌面端 / 脚本）

## 1. 技术栈基线

| 层 | 技术 | 版本约束 |
|---|---|---|
| 语言 | TypeScript | ≥ 5.4，strict 模式 |
| 后端 | NestJS | ≥ 10 |
| 前端 | Next.js (App Router) | ≥ 14 |
| ORM | Prisma | ≥ 5 |
| 数据库 | PostgreSQL | ≥ 15 |
| 缓存 / 队列 | Redis + BullMQ | Redis ≥ 7 |
| UI | shadcn/ui + Tailwind CSS | 最新稳定 |
| 状态管理 | Zustand（前端） | 最新稳定 |
| HTTP 客户端 | TanStack Query + axios | 最新稳定 |
| 校验 | zod / class-validator | 二选一，模块内统一 |
| 测试 | Vitest（单测）+ Playwright（e2e） | 最新稳定 |
| 桌面端 | Tauri | ≥ 2 |
| 包管理 | pnpm | ≥ 9 |

不允许引入未在此清单的新技术，必须先写 ADR。

## 2. TypeScript 强制约束

- `tsconfig.json` 必须开启：
  - `strict: true`
  - `noImplicitAny: true`
  - `noUncheckedIndexedAccess: true`
  - `noFallthroughCasesInSwitch: true`
- 禁用 `any`，必须用 `unknown` + 类型守卫
- 公共导出必须有显式返回类型
- 禁用 `// @ts-ignore`，必须用 `// @ts-expect-error` 加注释

## 3. 文件组织

```
apps/api/src/
├── modules/
│   ├── {module-name}/
│   │   ├── {module-name}.module.ts
│   │   ├── {module-name}.controller.ts
│   │   ├── {module-name}.service.ts
│   │   ├── {module-name}.repository.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── tests/
│   │   └── README.md
├── common/         # 通用拦截器 / 守卫 / 装饰器 / 过滤器
├── ai-gateway/     # AI 调用统一入口
├── database/       # Prisma 客户端 + 通用 repository
├── auth/           # 认证 / RBAC / ABAC
├── prompts/        # AI Prompt 模板库
└── main.ts
```

## 4. 命名约定（重申）

| 对象 | 风格 | 例子 |
|---|---|---|
| 文件名 | kebab-case | `user-profile.service.ts` |
| 类 | PascalCase | `UserProfileService` |
| 接口 / Type | PascalCase + 后缀 | `IUserProfile` / `UserProfileDto` / `UserProfileVo` |
| 函数 / 变量 | camelCase | `getUserProfile` |
| 常量 | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| 枚举 | PascalCase + 大写值 | `enum UserStatus { ACTIVE, FROZEN }` |
| 数据库表 | snake_case 复数 | `user_profiles` |
| 数据库字段 | snake_case | `created_at` |
| API 路径 | kebab-case 复数 | `/api/v1/user-profiles` |

## 5. 错误处理

- 禁用裸 `throw new Error(...)`
- 必须用 `packages/errors` 中预定义错误类：
  ```ts
  throw new BusinessError(ErrorCode.CREDIT_INSUFFICIENT, { required: 100, available: 50 });
  ```
- catch 块必须做以下之一：
  1. 重新抛出（包装为业务错误）
  2. 调用日志服务记录
  3. 返回 fallback 值并附带告警标记
- 禁止 `catch (e) { console.log(e); }`

## 6. 异步代码

- 必须用 async / await，禁用 `.then` 链（除非工具函数内部）
- 必须处理所有 Promise（无 unhandled rejection）
- 长耗时操作（≥ 3 秒）必须放队列异步处理

## 7. 注释规范

- 每个 service 方法必须有 JSDoc 注释（说明 / 参数 / 返回 / 抛错）
- 复杂业务逻辑必须有内联注释解释 "为什么"
- 禁止注释掉的死代码（用 git 历史）
- TODO 必须带责任人和日期：`// TODO(zhangsan, 2025-12-31): refactor to use new gateway`

## 8. 提交前自检

- [ ] `pnpm lint` 通过
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm test` 通过
- [ ] 测试覆盖率不低于本模块基线
- [ ] 没有 `console.log` 残留（业务代码）
- [ ] 没有 `any`、`@ts-ignore`、注释掉的代码
- [ ] 必要的 README 已更新

## 9. 代码审查标准（审 AI 输出代码时同样适用）

- **可读性**：变量名是否准确、逻辑是否清晰
- **一致性**：是否符合项目既有风格
- **正确性**：边界条件、空值、异常路径
- **安全性**：是否有 SQL 注入 / XSS / 越权风险
- **性能**：N+1 查询、不必要的 await、内存泄漏

## 10. 国际化与本地化

- 一期所有面向用户文案 **统一中文**（zh-CN）
- 文案集中存放在 `apps/web/src/i18n/zh-CN.ts`，禁止硬编码
- 日期 / 金额 / 数字 / 数据格式按中国大陆习惯
- 时区统一 `Asia/Shanghai`，存储用 UTC

## 11. 日志规范

- 用 pino（后端）/ console.log 仅限开发
- 日志级别：`fatal | error | warn | info | debug | trace`
- 必带字段：`traceId`、`userId`（如有）、`tenantId`（如有）、`module`
- 禁止打印密码 / 卡号 / API key 全文

## 12. 性能基线

- API p95 ≤ 500ms（除 AI 调用接口）
- AI 调用接口 p95 ≤ 30s（按模型）
- 单接口响应体 ≤ 1MB（超出必须分页 / 流式）
- 单查询不允许跨 5 张以上表 join，超出用读模型 / 缓存
