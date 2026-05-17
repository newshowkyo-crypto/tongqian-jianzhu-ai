# @tongqian/web

建筑企业用户前台，面向老板、经营管理层和企业员工，是桌面端复用的主 Web 应用。

## 职责

- 承载建筑企业的项目机会、招投标、合同、资质、成本等核心工作台。
- 提供 AI 全局入口和报告查看入口。
- 输出可被 Tauri 桌面端打包复用的 standalone 构建产物。

## 主要文件

| 文件                     | 说明                                 |
| ------------------------ | ------------------------------------ |
| `src/app/layout.tsx`     | Next.js App Router 根布局。          |
| `src/app/page.tsx`       | 当前首页骨架。                       |
| `src/i18n/zh-CN.ts`      | 用户可见中文文案入口。               |
| `src/styles/globals.css` | Tailwind 和全局样式。                |
| `next.config.mjs`        | Next.js 配置，包含 standalone 输出。 |

## 启动

```powershell
pnpm --filter @tongqian/web dev
```

默认监听 `http://localhost:3000`。

## 开发约束

- 用户可见中文必须走 i18n，不在组件里硬编码关键业务文案。
- 代码层保留英文 `agent`，用户可见层统一显示“智能管家”。
- 作为桌面端来源时，构建前运行 `pnpm --filter @tongqian/desktop prepare:web`。
