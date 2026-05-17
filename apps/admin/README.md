# @tongqian/admin

平台运营后台，用于平台配置、凭证管理、运营审核、订阅计费、风控审计和咨询转化管理。

## 职责

- 承载系统配置与凭证管理页面，包括 mock/real toggle、审批和审计。
- 支持平台运营查看用户、租户、订单、AI 成本、报表和异常。
- 管理同乾方略咨询转化与运营配置。

## 主要文件

| 文件                     | 说明                               |
| ------------------------ | ---------------------------------- |
| `src/app/layout.tsx`     | Next.js App Router 根布局。        |
| `src/app/page.tsx`       | 当前后台首页骨架。                 |
| `src/i18n/zh-CN.ts`      | 后台中文文案入口。                 |
| `src/styles/globals.css` | Tailwind 和全局样式。              |
| `tailwind.config.ts`     | Tailwind 配置，接入共享 UI token。 |

## 启动

```powershell
pnpm --filter @tongqian/admin dev
```

默认监听 `http://localhost:3001`。

## 开发约束

- 任何写操作都必须保留审批流和审计记录。
- 前端不得展示或持久化明文密钥，只显示脱敏后的凭证状态。
- P1 凭证占位时使用 mock provider，不阻塞开发期 e2e。
