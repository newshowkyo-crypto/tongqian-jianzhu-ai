# 同乾方略 · 建筑 AI 经营管家

服务中国中小型建筑企业的 AI 工具平台，也是同乾方略高端咨询业务的获客与交付入口。

平台一期面向建筑企业、政府/央国企、智能管家和平台运营四类用户，提供项目机会雷达、招投标解读、合同审查、资质管理、经营成本工具、AI 全局入口、后台运营与咨询转化能力。

## 快速开始

本仓库默认使用 Windows 11 + PowerShell + Node.js 22 + pnpm 9 + Docker Desktop。

1. 安装并检查工具：

```powershell
node -v
pnpm -v
docker version
git --version
```

1. 拉取代码并安装依赖：

```powershell
git clone https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai.git
cd tongqian-jianzhu-ai
pnpm install
```

1. 准备本地环境变量：

```powershell
Copy-Item .env.example .env
```

开发期 P1 凭证可以保留 `PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL`，系统按 mock provider 处理。真实 AI 调用需要填入 P0 的 3 个 AI Key。

1. 启动基础设施并初始化数据：

```powershell
pnpm docker:up
pnpm db:seed
```

1. 启动应用：

```powershell
pnpm dev
```

访问入口：

| 应用            | 地址                           |
| --------------- | ------------------------------ |
| 建筑企业前台    | <http://localhost:3000>        |
| 平台后台        | <http://localhost:3001>        |
| 智能管家工作台  | <http://localhost:3002>        |
| 政府/央国企版   | <http://localhost:3003>        |
| API 健康检查    | <http://localhost:4000/health> |
| Worker 健康检查 | <http://localhost:4100/health> |

## 技术栈

| 层级     | 技术                                                          |
| -------- | ------------------------------------------------------------- |
| Monorepo | pnpm workspace, Turborepo                                     |
| 后端     | NestJS, Prisma, PostgreSQL, Redis, BullMQ                     |
| 前端     | Next.js App Router, Tailwind CSS, shadcn/ui                   |
| 桌面端   | Tauri 2, 复用 `apps/web`                                      |
| AI       | AI Gateway, 阿里百炼, OpenRouter, DeepSeek 直连               |
| 部署     | Docker Compose, Nginx, GitHub Actions, 阿里云 VPS/ACR/OSS/SLS |
| 监控     | Uptime Kuma, 阿里云 SLS                                       |

## 仓库结构

```text
.github/workflows/       CI/CD 与发布流水线
.kiro/                   specs、steering、autopilot 状态
apps/api/                NestJS API
apps/worker/             BullMQ Worker
apps/web/                建筑企业前台
apps/admin/              平台后台
apps/agent/              智能管家工作台
apps/gov/                政府/央国企版
apps/desktop/            Tauri Windows 客户端
packages/types/          共享类型
packages/contracts/      OpenAPI 契约
packages/permissions/    权限常量
packages/errors/         错误码与错误类
packages/constants/      全局常量
packages/ui/             共享 UI
packages/utils/          工具函数
prisma/                  数据库 schema 与 seed
infra/                   Docker、Nginx、部署脚本、监控配置
docs/                    架构、商业模式、ADR、术语表
```

## 常用命令

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm clean
pnpm docker:up
pnpm docker:down
pnpm db:setup
pnpm --filter @tongqian/desktop tauri --version
pnpm --filter @tongqian/desktop prepare:web
```

## 文档导航

| 主题          | 文档                                                             |
| ------------- | ---------------------------------------------------------------- |
| 最高工作指令  | [AGENTS.md](./AGENTS.md)                                         |
| Codex 速查    | [.kiro/codex-quickstart.md](./.kiro/codex-quickstart.md)         |
| 架构          | [docs/architecture.md](./docs/architecture.md)                   |
| 商业模式      | [docs/business-model.md](./docs/business-model.md)               |
| 术语表        | [docs/glossary.md](./docs/glossary.md)                           |
| 规格总览      | [.kiro/specs/README.md](./.kiro/specs/README.md)                 |
| 基础设施 spec | [.kiro/specs/01-infra-monorepo](./.kiro/specs/01-infra-monorepo) |
| 决策记录      | [docs/decisions](./docs/decisions)                               |
| 变更记录      | [docs/changelog](./docs/changelog)                               |

## 开发约束摘要

- 共享 DTO、枚举、错误码、权限常量必须来自 `packages/*`。
- 数据库访问必须经 repository，业务层不写裸 SQL。
- AI 调用必须经 `apps/api/src/ai-gateway/`。
- 所有用户可见中文走 i18n，代码层保留英文 `agent`，用户可见层显示“智能管家”。
- 不提交 `.env`、密钥、证书、数据库备份或用户原始资料。

## License

私有项目。版权所有，同乾方略。
