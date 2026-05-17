# @tongqian/test-fixtures

共享测试夹具包，为单元测试、e2e、PBT 和后续黄金测试提供可复用的测试数据与场景工厂。

## 职责

- 集中维护跨模块测试数据，避免每个测试重复造样例。
- 为租户、用户、权限、订阅、点数、AI 任务和审批流提供基础 fixture。
- 支持 mock provider 和 P1 placeholder 场景的稳定测试输入。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/test-fixtures typecheck
pnpm --filter @tongqian/test-fixtures lint
pnpm --filter @tongqian/test-fixtures build
```

## 开发约束

- 测试夹具不得包含真实客户资料、真实合同、真实凭证或生产数据。
- 涉及 P1 凭证的夹具默认使用 `PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL` 和 mock provider。
- 夹具要保持确定性，避免依赖当前时间、网络或随机外部状态。
