# @tongqian/gov

政府和央国企工作台，面向政企用户提供项目治理、供应商协同、合规审阅和专家咨询入口。

## 职责

- 承载政企侧项目、招采、合规和协同视图。
- 提供申请同乾方略和专家小时咨询入口。
- 与企业前台共享设计系统和 AI 输出规范。

## 主要文件

| 文件                     | 说明                               |
| ------------------------ | ---------------------------------- |
| `src/app/layout.tsx`     | Next.js App Router 根布局。        |
| `src/app/page.tsx`       | 当前政企首页骨架。                 |
| `src/i18n/zh-CN.ts`      | 政企端中文文案入口。               |
| `src/styles/globals.css` | Tailwind 和全局样式。              |
| `tailwind.config.ts`     | Tailwind 配置，接入共享 UI token。 |

## 启动

```powershell
pnpm --filter @tongqian/gov dev
```

默认监听 `http://localhost:3003`。

## 开发约束

- 政企侧 AI 输出必须包含免责声明、Tier 徽章、AI 信心度和角色裁剪后的引导按钮。
- 任何数据访问都必须保持租户和权限边界。
- 用户可见中文必须经 i18n 维护。
