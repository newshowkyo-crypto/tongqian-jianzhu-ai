# @tongqian/contracts

API 契约包，负责维护 OpenAPI 入口、契约类型和后续生成的客户端/服务端类型。

## 职责

- 作为所有 HTTP API 的契约来源。
- 约束 controller 输入输出和统一响应结构。
- 为前端、后台和 e2e 提供稳定的接口描述。

## 主要文件

| 文件           | 说明                       |
| -------------- | -------------------------- |
| `src/index.ts` | 当前 TypeScript 导出入口。 |
| `openapi.yaml` | 后续 OpenAPI 主契约文件。  |
| `package.json` | 包导出、构建和校验脚本。   |

## 命令

```powershell
pnpm --filter @tongqian/contracts typecheck
pnpm --filter @tongqian/contracts lint
pnpm --filter @tongqian/contracts build
```

## 开发约束

- 新增 API 必须先更新 OpenAPI 契约，再实现 controller。
- 响应结构统一为 `{ code, data, message, traceId }`。
- 契约变更需要同步对应 DTO、测试和前端调用。
