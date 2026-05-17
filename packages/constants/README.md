# @tongqian/constants

共享常量包，集中维护订阅、点数、限流、缓存、Feature Flag、Tier 和平台级配置常量。

## 职责

- 为 API、Worker、前端和后台提供同一份业务常量。
- 避免在业务代码里重复定义价格、阈值、状态和枚举字符串。
- 承接后续商业规则中的点数、分润、红线和功能开关默认值。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/constants typecheck
pnpm --filter @tongqian/constants lint
pnpm --filter @tongqian/constants build
```

## 开发约束

- 新增跨模块常量先放到本包，再由业务模块导入。
- 不把密钥、真实凭证或租户私有配置写成常量。
- 商业规则常量要与 ADR 和 spec 保持一致。
