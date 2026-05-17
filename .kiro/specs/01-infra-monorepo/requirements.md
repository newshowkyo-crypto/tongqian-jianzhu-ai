# 01 Monorepo 基础设施 - Requirements

## Introduction

> **同乾方略 · 建筑 AI 经营管家** 项目的工程基础设施 spec。本模块**不实现业务功能**，但搭建所有后续 27 个子 Spec 赖以工作的"地基"：Monorepo 结构、Docker 容器化、CI/CD、VPS 部署、本地开发环境、监控告警。

**关联顶层 spec**：[`00-project-overview`](../00-project-overview/) — 本 spec 实现 D-1（部署架构）、D-2（前端拓扑）的物理落地。

**核心目标**：**一键启动整个项目**（`pnpm install && pnpm dev` 让 4 个前端 + API + Worker + DB + Redis 全部跑起来）；**一键部署到生产**（push 到 main 自动 Docker build + 推 ACR + SSH VPS + docker-compose up）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| Monorepo | 全部代码（前端 / 后端 / 共享包）放在同一个 git 仓库 |
| pnpm workspace | pnpm 的 monorepo 管理机制 |
| Turborepo | 按依赖图增量构建 / 缓存的工具 |
| ACR | 阿里云容器镜像服务（Aliyun Container Registry）|
| VPS | 阿里云轻量服务器（一期生产环境）|
| BullMQ | 基于 Redis 的任务队列（Worker 用）|

---

## Requirements

### Requirement 1：Monorepo 结构

**User Story**：作为开发者（人 + Codex），我希望项目用 pnpm workspace + Turborepo 管理 monorepo，以便所有 apps / packages 共享同一个 lock 文件、统一构建、按依赖增量编译，避免多仓库的版本同步噩梦。

#### Acceptance Criteria

1. THE Repo SHALL 采用 pnpm 9+ workspace + Turborepo 2+ 管理。
2. THE Repo SHALL 按以下根目录结构组织（与 [`docs/architecture.md` §2](../../../docs/architecture.md) 完全一致）：

   ```
   tongqian-jianzhu-ai/
   ├── AGENTS.md
   ├── README.md
   ├── package.json              # 根 package（workspaces + scripts）
   ├── pnpm-workspace.yaml
   ├── turbo.json                # Turborepo 配置
   ├── tsconfig.base.json        # TS 基础配置
   ├── .eslintrc.json
   ├── .prettierrc
   ├── .gitignore
   ├── .env.example
   ├── .github/workflows/        # GitHub Actions
   ├── .kiro/                    # spec + steering（已存在）
   ├── docs/                     # 项目蓝图（已存在）
   ├── packages/
   │   ├── types/                # 共享类型
   │   ├── contracts/            # OpenAPI yaml + 生成的 client/server 代码
   │   ├── permissions/          # 角色 / 权限
   │   ├── errors/               # 错误码 + 业务异常类
   │   ├── constants/            # 全局常量
   │   ├── ui/                   # 共享 UI 组件库（shadcn 封装）
   │   ├── utils/                # 工具函数
   │   └── test-fixtures/        # 测试夹具（用户/合同/资质等 mock 数据）
   ├── prisma/
   │   ├── schema.prisma
   │   ├── migrations/
   │   └── seed/
   ├── apps/
   │   ├── api/                  # NestJS 主 API
   │   ├── worker/               # NestJS 异步任务
   │   ├── web/                  # Next.js 建筑企业前台
   │   ├── gov/                  # Next.js 政府版前台
   │   ├── agent/                # Next.js 智能管家工作台
   │   ├── admin/                # Next.js 平台后台
   │   └── desktop/              # Tauri Windows 客户端
   ├── infra/
   │   ├── docker/               # Dockerfile × N
   │   ├── docker-compose.yml    # 本地开发
   │   ├── docker-compose.prod.yml
   │   ├── nginx/                # Nginx 配置
   │   └── deploy/               # 部署脚本
   └── scripts/                  # 运维 / 一次性脚本
   ```

3. THE `pnpm-workspace.yaml` SHALL 声明 `packages/*` 与 `apps/*` 为 workspace。
4. THE `package.json` 根目录 SHALL 提供以下顶级脚本：
   - `pnpm dev` → 一键启动全部本地开发服务（用 Turbo 并行跑 6 个 dev server）
   - `pnpm build` → 全量构建（按依赖顺序）
   - `pnpm lint` / `pnpm typecheck` / `pnpm test` → 全 workspace 跑
   - `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio`
   - `pnpm docker:up` / `pnpm docker:down`
   - `pnpm clean` → 清掉所有 node_modules / dist / .next / .turbo
5. THE `turbo.json` SHALL 配置 `build` / `dev` / `lint` / `typecheck` / `test` 五个 pipeline，且声明依赖关系（如 build 依赖 `^build`）。
6. THE Repo SHALL 在所有 packages 之间用 `workspace:*` 协议引用（不允许 `latest` 或固定版本号）。

---

### Requirement 2：TypeScript 与代码风格

**User Story**：作为开发者，我希望 TypeScript 严格模式 + 全 workspace 统一 ESLint + Prettier 配置，以便代码风格一致，Codex 输出代码质量稳定。

#### Acceptance Criteria

1. THE Repo SHALL 使用 TypeScript 5.4+，根目录 `tsconfig.base.json` 强制开启：`strict / noImplicitAny / noUncheckedIndexedAccess / noFallthroughCasesInSwitch / noImplicitOverride / verbatimModuleSyntax`。
2. 每个 app / package 的 `tsconfig.json` SHALL `extends` 根 `tsconfig.base.json`。
3. THE Repo SHALL 提供根 `.eslintrc.json` 配置：`@typescript-eslint/recommended-strict` + `eslint-plugin-import`（强制 import 顺序）+ `eslint-plugin-unused-imports`。
4. THE Repo SHALL 提供根 `.prettierrc`（无尾分号、2 空格、单引号、最大 100 字符行宽、尾逗号 ES5）。
5. THE Repo SHALL 用 Husky + lint-staged 在 pre-commit 自动跑 lint + typecheck。
6. THE Repo SHALL 用 commitlint 强制 Conventional Commits（详见 [`.kiro/steering/git-workflow.md`](../../steering/git-workflow.md)）。

---

### Requirement 3：本地开发环境

**User Story**：作为开发者，我希望 `git clone` 后跑 1 个命令就能启动整个项目（含数据库 / Redis / 4 个前端 + API + Worker），以便降低新人 onboarding 时间到 30 分钟内。

#### Acceptance Criteria

1. THE Repo SHALL 提供 `infra/docker-compose.yml` 启动**仅基础设施**（PostgreSQL 15 + Redis 7 + MinIO 模拟 OSS + Mailhog 模拟邮件）：
   - PostgreSQL 暴露 5432，密码用 `.env` 注入
   - Redis 暴露 6379
   - MinIO 暴露 9000（API）+ 9001（控制台）
   - 数据卷挂载到 `./data/{pg,redis,minio}/`，重启数据不丢
2. THE Repo SHALL 提供 `pnpm dev` 命令并行启动 6 个开发 server：
   - apps/api（NestJS hot reload，端口 4000）
   - apps/worker（NestJS hot reload，端口 4100）
   - apps/web（Next.js，端口 3000）
   - apps/gov（Next.js，端口 3003）
   - apps/agent（Next.js，端口 3002）
   - apps/admin（Next.js，端口 3001）
3. THE Repo SHALL 提供 `.env.example` 完整列出所有环境变量（已存在，需校对）。
4. THE Repo SHALL 提供 `pnpm db:setup` 一次性命令：跑 prisma migrate deploy + prisma db seed。
5. THE Repo SHALL 提供 `README.md` "本地开发" 段落，列出从 `git clone` 到看到首页的完整 5 步骤。

---

### Requirement 4：Docker 容器化

**User Story**：作为运维（OPC 模式 1 人），我希望所有应用都打包成 Docker 镜像，以便用 docker-compose 一键部署到 VPS，不依赖 VPS 上装 Node.js / pnpm。

#### Acceptance Criteria

1. THE Repo SHALL 为每个 app 提供 `infra/docker/Dockerfile.{app}`：
   - apps/api、apps/worker → 单一 Node.js 22 alpine 多阶段构建
   - apps/web、apps/gov、apps/agent、apps/admin → Next.js standalone 输出 + 多阶段构建
2. 每个 Dockerfile SHALL 用 multi-stage build：`base → deps → builder → runner`，最终镜像 ≤ 200MB（next 应用）/ ≤ 150MB（node 应用）。
3. 每个 Dockerfile SHALL 在 runner 阶段用 `node:22-alpine` + 非 root 用户运行。
4. THE Repo SHALL 提供 `infra/docker-compose.prod.yml` 描述生产环境完整服务编排：
   - PostgreSQL（带数据卷 + 自动备份脚本）
   - Redis（带持久化 AOF）
   - api / worker / web / gov / agent / admin 6 个应用容器
   - Nginx（反向代理 + SSL termination）
   - Watchtower（可选，自动拉新镜像）
5. 每个生产镜像 SHALL 有 healthcheck：
   - api / worker：`/health` endpoint 返回 200
   - 前端：根路径 200
6. THE Repo SHALL 提供 `.dockerignore` 屏蔽 node_modules / .git / .env / .next 等。

---

### Requirement 5：CI/CD 流水线

**User Story**：作为创始人，我希望 push 到 GitHub 后自动跑测试 + 构建，merge 到 main 后自动部署到 VPS，以便 OPC 模式下不用人工运维。

#### Acceptance Criteria

1. THE Repo SHALL 提供 `.github/workflows/ci.yml`：
   - 触发：push / pull_request 到任何分支
   - 跑：pnpm install → typecheck → lint → test → build
   - 缓存：pnpm store + Turbo cache + Next.js cache
   - 全部通过才允许 PR merge

2. THE Repo SHALL 提供 `.github/workflows/deploy-staging.yml`：
   - 触发：push 到 develop 分支
   - 跑：CI 全套 → 构建 7 个 Docker 镜像（每个 app + Nginx）→ 推到阿里云 ACR（tag = `staging-{git-sha}`）→ SSH 到 staging VPS → `docker-compose pull && up -d`
   - 跑健康检查 30 秒，失败自动回滚

3. THE Repo SHALL 提供 `.github/workflows/deploy-prod.yml`：
   - 触发：push 到 main 分支
   - 跑：CI 全套 → 构建镜像 tag = `prod-{git-sha}` + `prod-latest` + `prod-previous`（保留上一版）
   - SSH 到生产 VPS → 灰度发布（先金丝雀 5% → 25% → 50% → 100%，详见 [`design.md` §12.3]）
   - 失败自动回滚到 `prod-previous` tag

4. THE Repo SHALL 在 GitHub Secrets 中存储以下凭证：
   - ALIYUN_ACR_USERNAME / ALIYUN_ACR_PASSWORD
   - SSH_PRIVATE_KEY_STAGING / SSH_PRIVATE_KEY_PROD
   - VPS_HOST_STAGING / VPS_HOST_PROD
   - 业务级 secret（DB / Redis / OpenAI / 微信支付 等）由 VPS 上 `.env.prod` 管理，**SHALL NOT** 进 GitHub Secrets

5. THE Repo SHALL 提供 `infra/deploy/rollback.sh`：1 行命令切回上一版本镜像。

---

### Requirement 6：监控与日志

**User Story**：作为创始人，我希望 VPS 上有基础监控（错误率 / 延迟 / CPU / 内存），失败立即告警到企业微信，以便 OPC 模式下问题不漏。

#### Acceptance Criteria

1. THE Repo SHALL 在 `infra/docker-compose.prod.yml` 中加入：
   - Uptime Kuma（开源服务可用性监控，监控 8 个端点：4 个前端 + api + worker + DB + Redis）
   - 阿里云日志服务 SLS 客户端（收集所有容器 stdout）
2. THE 应用层日志 SHALL 用 pino（结构化 JSON），带字段：`traceId / userId / tenantId / module / level / msg`。
3. THE Repo SHALL 提供 `infra/monitoring/alert-rules.yaml`：
   - api 5xx 错误率 > 1%（5 分钟）→ 告警
   - api P95 延迟 > 1s（5 分钟）→ 告警
   - VPS CPU > 80%（10 分钟）→ 告警
   - 磁盘剩余 < 20% → 告警
   - PG 主从延迟 > 5s → 告警
4. 告警渠道：企业微信群机器人 webhook + 短信（紧急级别）。

---

### Requirement 7：备份与灾备

**User Story**：作为创始人，我希望数据每天自动备份到 OSS（跨区域），故障时可以 4 小时内恢复，以便满足 [`requirements.md` R9.2](../00-project-overview/requirements.md) 的 RTO / RPO 要求。

#### Acceptance Criteria

1. THE Repo SHALL 提供 `infra/deploy/backup.sh` 每天凌晨 3:00 跑：
   - `pg_dump` 全量备份压缩到 `/data/backup/pg-{YYYYMMDD}.sql.gz`
   - 上传到阿里云 OSS（私有桶 `tongqian-backup`），跨区域复制
   - 保留 30 天
2. THE OSS 桶 SHALL 启用版本控制 + 删除保护（防误删）。
3. THE Repo SHALL 提供 `infra/deploy/restore.sh`：从指定日期备份恢复，含数据完整性校验。
4. THE Repo SHALL 每季度执行一次"恢复演练"，演练结果写入 `docs/changelog/quarterly-restore-{YYYY-Q}.md`。

---

### Requirement 8：Tauri 桌面端打包基础

> 桌面端的应用代码在 [`05-windows-desktop`]，本 spec 仅提供 Tauri 项目骨架。

#### Acceptance Criteria

1. THE `apps/desktop/` SHALL 用 Tauri 2+ 初始化，**仅复用 `apps/web` 的 Next.js 输出**（不复用 gov / agent / admin 三个前端，避免边界模糊）。
2. THE Tauri 配置 SHALL 限定单实例运行 + 系统托盘 + 自启动选项。
3. THE Repo SHALL 提供 GitHub Actions 工作流 `desktop-release.yml`，按 tag 触发打包：
   - 输出 `.msi` 安装包（带签名）
   - 上传到 GitHub Releases
   - 桌面端通过 `tauri-updater` 自动检查更新

#### 与 [`05-windows-desktop`] 的边界（强约束）

| 范围 | 归属 | 说明 |
|---|---|---|
| Tauri 项目初始化 + `tauri.conf.json` + `Cargo.toml` 骨架 | ✅ 本 spec（01 R8）| 跑通 `tauri dev` 能加载 `apps/web` 首页即可 |
| 单实例 / 托盘 / 自启动 / 自动更新基础配置 | ✅ 本 spec（01 R8）| 平台级配置 |
| `.msi` 打包 + GitHub Release + 签名 workflow | ✅ 本 spec（01 R8）| 部署相关 |
| 桌面端业务功能（图纸 / 造价 原生模块、本地缓存、剪贴板桥接、文件系统访问、本地通知）| ❌ [`05-windows-desktop`] | 业务 spec 完整化 |
| 桌面端独有的 UX 优化（窗口管理 / 多屏支持 / 离线模式）| ❌ [`05-windows-desktop`] | 业务 spec 完整化 |
| 用户首次安装引导 / 自动登录 / 设备绑定 | ❌ [`05-windows-desktop`] | 业务 spec 完整化 |

❗ **本 spec SHALL NOT 实现任何桌面端业务功能**。本 spec 验收标准是"`pnpm --filter @tongqian/desktop tauri dev` 能起本地预览且加载到 apps/web 首页"，仅此而已。

---

### Requirement 9：开发者文档

**User Story**：作为新加入的开发者（人 / Codex），我希望仓库根目录的 `README.md` 5 分钟读完就能上手，以便不用问其他人。

#### Acceptance Criteria

1. THE `README.md` SHALL 含：
   - 项目一句话介绍（来自 [顶层 spec R1](../00-project-overview/requirements.md)）
   - 技术栈一览（来自 architecture.md）
   - 仓库结构（来自本 spec R1）
   - 本地开发 5 步（来自本 spec R3）
   - 常用命令速查表
   - 文档导览（指向 AGENTS.md / steering / specs）
2. THE 各 app / package 根目录 SHALL 各有自己的 `README.md`（说明：职责 / 依赖 / 主要文件 / 关键命令）。

---

### Requirement 10：依赖与外部服务

**User Story**：作为创始人，我希望本 spec 列出所有外部依赖（云服务 / API / 工具），以便创始人准备清单能对应。

#### Acceptance Criteria

1. **本地开发**：Docker Desktop + Node.js 22 + pnpm 9 + git
2. **开发期 + 生产**：
   - 阿里云 ECS 轻量（开发 4C8G + 生产 8C16G）
   - 阿里云 RDS（可选，一期用 docker-compose 自管 PG）
   - 阿里云 OSS（备份 + 文件存储）
   - 阿里云 ACR（镜像仓库）
   - 阿里云 SLS（日志服务）
   - 阿里云 DNS（域名）
   - GitHub（私有仓库 + Actions 免费额度）
3. **可选 / 二期**：阿里云 RDS 主从、CDN、SLB

---

### Requirement 11：性能与容量基线

#### Acceptance Criteria

1. THE 单 VPS 8C16G 配置 SHALL 支撑 ≤ 5000 并发用户、≤ 100 QPS API 调用（详见 [`docs/architecture.md` §9](../../../docs/architecture.md)）。
2. THE 镜像构建 SHALL 在 GitHub Actions 上完成时间 ≤ 8 分钟（含缓存）。
3. THE 部署 SHALL 在生产灰度全套完成时间 ≤ 15 分钟。

---

### Requirement 12：边界（不做的）

1. THE Repo SHALL NOT 一期上 Kubernetes（[ADR-001 §4.4](../../../docs/decisions/2025-05-15-initial-decisions.md)）。
2. THE Repo SHALL NOT 一期实现自动蓝绿部署（用半自动 + 人工确认）。
3. THE Repo SHALL NOT 一期实现多区域部署。
4. THE Repo SHALL NOT 在生产环境直接跑 prisma migrate dev，仅用 prisma migrate deploy。
5. THE Repo SHALL NOT 把任何 secret 写入代码仓库（只用 .env / GitHub Secrets / VPS 系统变量）。

---

### Requirement 13：依赖（前置 spec）

无（本 spec 是 P0 起点）。

### Requirement 14：开放问题

| OQ | 问题 | 决策时机 |
|---|---|---|
| 01-OQ-001 | 是否引入 Vercel / Netlify 部署前端（更快但锁定供应商）| MVP 上线前再评估，目前用阿里云 VPS |
| 01-OQ-002 | 是否引入 dependabot / renovate 自动升级依赖 | 上线 3 个月后启用 |
| 01-OQ-003 | 是否切到 Bun（更快的包管理 + 运行时）| 二期评估，目前 pnpm 足够 |
