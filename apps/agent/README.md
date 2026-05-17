# @tongqian/agent

智能管家工作台，面向线下服务人员，支持执行 AI 方案、跟进客户、推荐同乾方略和联系平台客服。

## 职责

- 承载智能管家派单、执行、回访和服务记录。
- 展示 AI 方案的执行要点，但不作为 AI 方案补全入口。
- 支持后续声誉、保证金替代机制、分润和风控协同。

## 主要文件

| 文件                     | 说明                               |
| ------------------------ | ---------------------------------- |
| `src/app/layout.tsx`     | Next.js App Router 根布局。        |
| `src/app/page.tsx`       | 当前工作台首页骨架。               |
| `src/i18n/zh-CN.ts`      | 工作台中文文案入口。               |
| `src/styles/globals.css` | Tailwind 和全局样式。              |
| `tailwind.config.ts`     | Tailwind 配置，接入共享 UI token。 |

## 启动

```powershell
pnpm --filter @tongqian/agent dev
```

默认监听 `http://localhost:3002`。

## 开发约束

- 用户可见文案必须显示“智能管家”，不得出现“中介”。
- 智能管家定位是线下跑腿、关系、兜底，不是 AI 方案解读或补全。
- 引导按钮按角色裁剪，智能管家侧默认最多 3 个。
