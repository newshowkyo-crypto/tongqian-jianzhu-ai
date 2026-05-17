# @tongqian/errors

共享错误包，集中维护错误码命名空间、业务错误基类和可预期错误类型。

## 职责

- 为所有应用提供统一错误类和错误码。
- 保证 API、Worker 和前端能用同一套错误语义处理失败。
- 支持后续错误中间件、审计日志和用户可见错误文案映射。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/errors typecheck
pnpm --filter @tongqian/errors lint
pnpm --filter @tongqian/errors build
```

## 开发约束

- 可预期业务失败必须抛本包定义的错误类。
- 每个错误必须带稳定错误码，不用裸字符串临时返回。
- 禁止 catch 后吞错或只写日志不向上抛出。
