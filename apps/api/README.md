# @tongqian/api

NestJS 主 API 应用，负责对外 HTTP 接口、认证入口、业务编排、审计写入和 AI Gateway 的统一调用入口。

## 职责

- 暴露 `/health` 和后续 `/api/v1/*` 业务接口。
- 接入 Prisma repository、权限守卫、审批流和审计日志。
- 作为 AI、计费、知识库、报表等后端模块的聚合层。

## 主要文件

| 文件            | 说明                                    |
| --------------- | --------------------------------------- |
| `src/main.ts`   | NestJS 启动入口，当前提供健康检查骨架。 |
| `package.json`  | API 应用脚本和 NestJS 依赖。            |
| `tsconfig.json` | TypeScript 编译配置。                   |

## 启动

```powershell
pnpm --filter @tongqian/api dev
```

默认监听 `http://localhost:4000`，健康检查为 `GET /health`。

## 开发约束

- 数据访问必须经 `apps/api/src/database/repository/`。
- AI 调用必须经 `apps/api/src/ai-gateway/`。
- Controller 输入必须强校验，响应统一包装 `{ code, data, message, traceId }`。
