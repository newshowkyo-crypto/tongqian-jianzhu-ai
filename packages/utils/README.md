# @tongqian/utils

共享工具包，提供格式化、日期、字符串、加密辅助和其他无业务状态的纯函数工具。

## 职责

- 放置跨 app、跨 package 复用的通用函数。
- 避免在业务模块复制粘贴格式化、校验和转换逻辑。
- 为后续金额、点数、日期、脱敏和签名辅助提供统一入口。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/utils typecheck
pnpm --filter @tongqian/utils lint
pnpm --filter @tongqian/utils build
```

## 开发约束

- 工具函数应保持纯函数优先，不隐藏数据库、网络或模型调用。
- 加解密工具只能封装算法和格式，不内置密钥。
- 与业务规则强绑定的逻辑应放回对应领域模块。
