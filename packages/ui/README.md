# @tongqian/ui

共享 UI 包，提供设计系统 token、Tailwind preset、基础组件和后续领域组件出口。

## 职责

- 统一 Web、Admin、Agent、Gov 四个前端应用的视觉基础。
- 输出 Tailwind preset、CSS token 和可复用 UI primitive。
- 承接后续仪表盘、报表、表单、数据展示和领域组件。

## 主要文件

| 文件                     | 说明                    |
| ------------------------ | ----------------------- |
| `src/index.ts`           | UI 组件和工具导出入口。 |
| `src/tailwind-preset.ts` | 共享 Tailwind preset。  |
| `src/styles/tokens.css`  | 设计 token CSS 输出。   |
| `package.json`           | 包导出、依赖和脚本。    |

## 命令

```powershell
pnpm --filter @tongqian/ui typecheck
pnpm --filter @tongqian/ui lint
pnpm --filter @tongqian/ui build
```

## 开发约束

- 组件应优先服务密集业务操作，不做装饰性落地页风格。
- 用户可见中文由各 app 的 i18n 提供，UI primitive 不硬编码业务文案。
- 新组件需要保持可访问性、稳定尺寸和响应式约束。
