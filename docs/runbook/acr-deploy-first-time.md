# ACR 首次部署 Runbook

## 前置条件

- 阿里云 ACR 命名空间：[PLACEHOLDER_ACR_NAMESPACE]
- 镜像仓库区域：[PLACEHOLDER_ACR_REGION]
- GitHub Secrets：
  - `ALIYUN_ACR_REGISTRY`
  - `ALIYUN_ACR_USERNAME`
  - `ALIYUN_ACR_PASSWORD`
  - `VPS_HOST`
  - `VPS_USER`
  - `VPS_SSH_KEY`
  - `DEPLOY_PATH`

## 首次开通

1. 在阿里云控制台开通 ACR。
2. 创建命名空间 `tongqian`。
3. 创建仓库：`api` / `worker` / `web` / `admin` / `agent` / `gov`。
4. 创建访问凭证，写入 GitHub Secrets。
5. 在 VPS 登录 ACR：`docker login [PLACEHOLDER_ACR_REGISTRY]`。

## 首次部署

1. 确认 `main` 已通过 CI。
2. 手动触发 `deploy-prod.yml`。
3. 观察 build-and-push 阶段是否推送 6 个镜像。
4. 观察 deploy 阶段是否 SSH 到 VPS。
5. VPS 执行：
   - `docker compose -f docker-compose.prod.yml pull`
   - `docker compose -f docker-compose.prod.yml up -d`
   - `infra/deploy/health-check.sh`

## 验证

- API health 返回 `ok`。
- 4 个 Next app 返回 200。
- Worker 无异常重启。
- Postgres/Redis 容器 healthy。

## 常见失败

- ACR 登录失败：检查 registry、账号、密码。
- 镜像不存在：检查 tag 是否一致。
- SSH 失败：重新跑 `verify-vps.yml`。
- Next app 404：检查 host 路由和 container port。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
