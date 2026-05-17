# 01 Monorepo 基础设施 - Tasks

> Codex / Claude Code 按本任务清单顺序实施。每个任务勾完才能进下一个。

## 任务总数：35

---

## Phase A：Monorepo 骨架（5 个）

- [x] **A1** 初始化 pnpm + Turborepo（创建 `package.json` / `pnpm-workspace.yaml` / `turbo.json` / `.npmrc`）
  - 文件：根目录
  - 验收：`pnpm install` 不报错；`pnpm dev` 命令存在（即使无 app）

- [x] **A2** 配置 TypeScript（`tsconfig.base.json`）+ ESLint + Prettier + Husky + commitlint
  - 文件：根目录 + `.husky/`
  - 验收：`pnpm typecheck` 通过空仓库；`pnpm lint` 通过；提交会触发 hook

- [ ] **A3** 创建 packages 占位目录 + 各自 package.json + tsconfig.json
  - 文件：`packages/{types,contracts,permissions,errors,constants,ui,utils,test-fixtures}/`
  - 验收：`pnpm install` 后 workspace 识别全部 8 个 packages

- [ ] **A4** 创建 apps 占位目录（仅 package.json + tsconfig.json，不含业务代码）
  - 文件：`apps/{api,worker,web,gov,agent,admin,desktop}/`
  - 验收：`pnpm install` 后 workspace 识别全部 7 个 apps

- [ ] **A5** 初始化 Prisma（`prisma/schema.prisma` 仅含 generator + datasource）
  - 文件：`prisma/`
  - 验收：`pnpm db:studio` 能打开（空 schema 也行）

---

## Phase B：本地开发环境（5 个）

- [ ] **B1** 编写 `infra/docker-compose.yml`（PG + Redis + MinIO + Mailhog）
  - 验收：`pnpm docker:up` 后 4 个服务都 healthy

- [ ] **B2** 编写各 app 的最小 hello-world：
  - apps/api：NestJS 启动 + `/health` 返回 200
  - apps/worker：BullMQ 启动 + 监听一个 dummy queue
  - apps/web/gov/agent/admin：Next.js + 一个空首页
  - 验收：`pnpm dev` 6 个 server 全部启动 + 各端口可访问

- [ ] **B3** 配置 Tailwind + shadcn/ui base 到 4 个 Next 应用
  - 验收：每个 app 的 `tailwind.config.ts` 引入 `packages/ui` 的 token

- [ ] **B4** 编写 prisma seed 骨架（`prisma/seed/index.ts`）
  - 验收：`pnpm db:seed` 跑空 seed 不报错

- [ ] **B5** 编写仓库根 `README.md` 的 "本地开发" 章节
  - 内容：5 步从 clone 到看到 4 个前端
  - 验收：人/Codex 按照能成功起来

---

## Phase C：Docker 镜像（5 个）

- [ ] **C1** 编写 `infra/docker/Dockerfile.api`
  - 验收：`docker build -f infra/docker/Dockerfile.api .` 出镜像 ≤ 150MB

- [ ] **C2** 编写 `infra/docker/Dockerfile.worker`
  - 同上验收

- [ ] **C3** 编写通用 `infra/docker/Dockerfile.next`（带 APP_NAME build-arg）
  - 验收：能用同一 Dockerfile 构建 web/gov/agent/admin 4 个镜像

- [ ] **C4** 编写 `infra/docker/Dockerfile.nginx` + 4 个 conf.d 配置
  - 验收：本地 `docker run` 后能反代到对应 upstream

- [ ] **C5** 编写 `infra/docker-compose.prod.yml`
  - 验收：在 staging VPS 上 `docker compose up -d` 启动全套

---

## Phase D：CI（4 个）

- [ ] **D1** 编写 `.github/workflows/ci.yml`（typecheck + lint + test + build）
  - 验收：PR 触发后 8 分钟内完成

- [ ] **D2** 编写 `.github/workflows/build-images.yml`
  - 触发：push to develop / main
  - 验收：构建 7 个镜像 + 推 ACR

- [ ] **D3** 编写 `.github/workflows/deploy-staging.yml`
  - 验收：merge to develop 后自动部署 + 健康检查

- [ ] **D4** 编写 `.github/workflows/deploy-prod.yml`
  - 验收：merge to main 后灰度发布 + 失败回滚

---

## Phase E：部署脚本（4 个）

- [ ] **E1** 编写 `infra/deploy/deploy.sh`
- [ ] **E2** 编写 `infra/deploy/canary.sh`（灰度发布权重切换）
- [ ] **E3** 编写 `infra/deploy/rollback.sh`
- [ ] **E4** 编写 `infra/deploy/health-check.sh`

每个验收：在 staging VPS 跑通 + 文档化用法

---

## Phase F：备份与监控（4 个）

- [ ] **F1** 编写 `infra/deploy/backup.sh` + cron 配置
  - 验收：每日凌晨 3:00 跑，OSS 上看到当日备份

- [ ] **F2** 编写 `infra/deploy/restore.sh`
  - 验收：从指定备份能恢复到测试库

- [ ] **F3** 部署 Uptime Kuma + 配置 8 个监控端点
  - 验收：8 个端点都能监控

- [ ] **F4** 配置阿里云 SLS 接收 Docker 容器日志
  - 验收：在 SLS 控制台能看到结构化日志

---

## Phase G：Tauri 桌面端骨架（3 个）

- [ ] **G1** `apps/desktop/` 用 Tauri 2 初始化
  - 验收：`pnpm --filter @tongqian/desktop tauri dev` 能起本地预览

- [ ] **G2** 配置 Tauri 复用 apps/web 的 standalone 输出
  - 验收：桌面端能加载 apps/web 首页

- [ ] **G3** 编写 `.github/workflows/desktop-release.yml`
  - 验收：tag 触发后产出 .msi 上传到 GitHub Release

---

## Phase H：开发者文档（3 个）

- [ ] **H1** 完善仓库根 README.md（项目介绍 + 快速开始 + 技术栈 + 文档导览）
- [ ] **H2** 给每个 app 写 README.md（职责 / 主要文件 / 启动方式）
- [ ] **H3** 给每个 package 写 README.md

---

## Phase I：性能与验收（2 个）

- [ ] **I1** 测 CI 流水线总耗时 ≤ 8 分钟
- [ ] **I2** 在 staging VPS 测部署时长 ≤ 15 分钟（含灰度）

---

## 完成标准

- ✅ 35 个任务全部勾选
- ✅ `pnpm install && pnpm dev` 一键起整套（本地）
- ✅ `git push main` → 自动部署到 prod 成功
- ✅ Uptime Kuma 看板显示 8 个监控点全绿
