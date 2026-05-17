# @tongqian/permissions

权限常量与权限判断包，维护角色、权限点、作用域和后续 `hasPermission` 等共享逻辑。

## 职责

- 提供平台角色、企业岗位、智能管家子类型和权限点定义。
- 支撑 API guard、前端菜单裁剪和后台运营权限配置。
- 统一租户、项目、所有者等权限边界的语义。

## 主要文件

| 文件            | 说明                     |
| --------------- | ------------------------ |
| `src/index.ts`  | 当前导出入口。           |
| `package.json`  | 包导出、构建和校验脚本。 |
| `tsconfig.json` | TypeScript 编译配置。    |

## 命令

```powershell
pnpm --filter @tongqian/permissions typecheck
pnpm --filter @tongqian/permissions lint
pnpm --filter @tongqian/permissions build
```

## 开发约束

- 权限点只能从本包导入，业务代码不得重复声明。
- 所有数据查询必须保留 tenant、scope、project 和 owner 边界。
- 新增写操作权限时，同步考虑审批流和审计要求。
