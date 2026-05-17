# 同乾方略 · 建筑 AI 经营管家

> 中小建筑企业日常 AI 工具平台 + 同乾方略高端咨询获客器

## 项目简介

本项目是为中国建筑行业中小企业打造的 AI 工具平台，覆盖：

- **5 大杀手锏**：项目机会雷达、招标解读 + 标书工厂、合同审查、资质智能管家、经营成本工具集
- **17 大功能区**：建筑企业 14 区 + 智能管家工作台 + 政府 / 央国企版 + AI 全局入口 + 高端咨询入口 + 平台后台

## 用户角色（4 大注册类型）

1. 建筑企业用户（内部 30+ 岗位）
2. 政府 / 央国企用户
3. 智能管家用户
4. 平台运营用户

## 技术栈

- **后端**：NestJS + Prisma + PostgreSQL + Redis
- **前端**：Next.js (App Router) + Tailwind + shadcn/ui
- **桌面端**：Tauri 2
- **AI**：自建 AI Gateway，多渠道路由（OpenRouter / B.AI / 阿里百炼 / 火山方舟 / 6 月后自建 HK 直连）
- **部署**：GitHub → VPS（阿里云轻量）

## 仓库结构

详见 [docs/architecture.md](./docs/architecture.md)。

```
.kiro/                 # Kiro spec + steering
docs/                  # 项目蓝图
packages/              # 共享类型 / 契约 / 权限 / 错误码 / 常量
prisma/                # 数据库 schema
apps/
  ├── api/             # 主 API
  ├── worker/          # 异步任务
  ├── web/             # 建筑企业前台
  ├── gov/             # 政府 / 央国企版
  ├── agent/           # 智能管家工作台
  ├── admin/           # 平台后台
  └── desktop/         # Tauri 桌面端
infra/                 # 部署
```

## AI 编码助手必读

> **任何 AI 编码助手（Codex / Claude Code / Cursor）开始任务前必须读完这一节**

### 必读文件（按顺序）

1. [AGENTS.md](./AGENTS.md) — 总指令
2. [.kiro/steering/coding-standards.md](./.kiro/steering/coding-standards.md)
3. [.kiro/steering/security-rules.md](./.kiro/steering/security-rules.md)
4. [.kiro/steering/api-conventions.md](./.kiro/steering/api-conventions.md)
5. [.kiro/steering/database-conventions.md](./.kiro/steering/database-conventions.md)
6. [.kiro/steering/ai-gateway-rules.md](./.kiro/steering/ai-gateway-rules.md)
7. [docs/architecture.md](./docs/architecture.md)
8. [docs/business-model.md](./docs/business-model.md)
9. [docs/glossary.md](./docs/glossary.md)
10. 当前任务对应的 `.kiro/specs/{module}/` 三件套

### 核心物理边界

- 共享类型：`packages/types`
- 错误码：`packages/errors`
- 权限：`packages/permissions`
- API 契约：`packages/contracts/openapi.yaml`
- 数据库：`prisma/schema.prisma`
- AI 调用：`apps/api/src/ai-gateway/`

详见 AGENTS.md 第 3 节。

## 开发模式

- **OPC 极简模式**：创始人 + 2 人团队 + AI 主导开发
- **Spec 驱动**：每个模块走 Requirements → Design → Tasks 三阶段
- **GitHub → VPS** 一键部署
- **可视化后台**：所有运营操作零代码可视化

## 本地开发

### 1. 准备工具

本仓库默认使用 Windows 11 + PowerShell 开发，先确认本机具备：

- Node.js 22.x
- pnpm 9.x
- Docker Desktop
- Git

可用以下命令快速检查：

```powershell
node -v
pnpm -v
docker version
git --version
```

### 2. 拉取仓库并安装依赖

```powershell
git clone https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai.git
cd tongqian-jianzhu-ai
pnpm install
```

### 3. 准备本地环境变量

```powershell
Copy-Item .env.example .env
```

开发期 P1 凭证（微信、支付宝、阿里云、企微、DashVector 等）可保持 `PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL`，系统会使用 mock provider。3 个 P0 AI Key 只有在真实 AI 调用时需要填入真值。

### 4. 启动基础设施并初始化数据

```powershell
pnpm docker:up
pnpm db:seed
```

`pnpm docker:up` 会启动 PostgreSQL、Redis、MinIO、Mailhog。若本机端口冲突，可在不提交的本地环境文件中覆盖端口配置。

### 5. 启动应用并访问前端

```powershell
pnpm dev
```

启动后访问：

| 应用            | 地址                           |
| --------------- | ------------------------------ |
| 建筑企业前台    | <http://localhost:3000>        |
| 平台后台        | <http://localhost:3001>        |
| 智能管家工作台  | <http://localhost:3002>        |
| 政府 / 央国企版 | <http://localhost:3003>        |
| API 健康检查    | <http://localhost:4000/health> |
| Worker          | <http://localhost:4100>        |

常用检查命令：

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm clean
pnpm docker:down
```

## License

私有项目。
