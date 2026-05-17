# @tongqian/worker

NestJS Worker 应用，负责异步队列、定时任务、后台补偿和后续通知派发等非同步 HTTP 工作。

## 职责

- 监听 BullMQ 队列并执行后台任务。
- 承接 AI 长任务、报表生成、点数过期、通知发送等耗时流程。
- 与 API 共享数据库、Redis 和审计约束。

## 主要文件

| 文件            | 说明                                         |
| --------------- | -------------------------------------------- |
| `src/main.ts`   | Worker 启动入口，当前包含 dummy queue 骨架。 |
| `package.json`  | Worker 脚本、BullMQ 和 Redis 依赖。          |
| `tsconfig.json` | TypeScript 编译配置。                        |

## 启动

```powershell
pnpm --filter @tongqian/worker dev
```

默认连接本地 Redis，配合 `pnpm docker:up` 使用。

## 开发约束

- 任务处理必须幂等，涉及扣点、退款、通知、审计的流程必须可重试。
- 不在 Worker 中绕过 repository 或审批流直接改业务数据。
- 后台失败要记录可追踪日志，不能只 `console.log` 后吞错。
