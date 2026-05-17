# @tongqian/types

共享类型包，集中维护 DTO、Entity、VO、枚举和跨模块 TypeScript 类型。

## 职责

- 作为所有业务类型的统一来源。
- 为 API、Worker、前端、后台和测试提供可复用类型定义。
- 承接认证、订阅、点数、AI 任务、报表、派单和审批等模块类型。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/types typecheck
pnpm --filter @tongqian/types lint
pnpm --filter @tongqian/types build
```

## 开发约束

- 业务代码不得重复定义共享 DTO、枚举或权限相关类型。
- 新增跨模块类型先进入本包，再由业务模块导入。
- 类型命名遵循 `T` 前缀或 `Dto`、`Entity`、`Vo` 后缀。
