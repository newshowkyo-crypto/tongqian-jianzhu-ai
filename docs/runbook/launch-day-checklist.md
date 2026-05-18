# 上线日 Checklist

## 目标

在备案、域名、ACR、VPS、GitHub Secrets、P0 AI Key 已准备完成后，按小时完成首发上线。

## T-1 天

- 确认 `main` 最新 commit 已通过 `pnpm typecheck && pnpm lint && pnpm test && pnpm build`。
- 确认 `.env.prod` 已在 VPS `/opt/tongqian`，权限为 `600`。
- 确认 P0 AI Key 可用：阿里百炼、OpenRouter、DeepSeek。
- 确认 P1 凭证仍可 mock 启动，真实凭证从 admin 后台替换。
- 确认 GitHub Secrets：`VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` / `DEPLOY_PATH` / `[PLACEHOLDER_ACR_SECRETS]`。
- 确认 OSS backup bucket 已创建：[PLACEHOLDER_OSS_BACKUP_BUCKET]。

## T-4 小时

- `git pull origin main`
- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:prompts`
- `pnpm build`
- 在 VPS 执行 `docker compose -f infra/docker-compose.prod.yml config`。
- 在 admin 后台确认 `FEATURE_FLAG_PARTNER_ENABLED=false`。

## T-2 小时

- 确认 DNS TTL 已降到 300 秒。
- 确认 Nginx `www/gov/agent/admin/api` 5 个 host 配置存在。
- 确认 SSL 证书签发或 acme.sh 可执行。
- 确认 Uptime Kuma 监控项：web、api、admin、Postgres、Redis。

## T-1 小时

- 执行数据库备份：`infra/deploy/backup.sh`。
- 执行 deploy workflow 或 VPS 手工部署。
- 验证健康检查：
  - `https://api.[PLACEHOLDER_DOMAIN]/health`
  - `https://www.[PLACEHOLDER_DOMAIN]`
  - `https://admin.[PLACEHOLDER_DOMAIN]`
- 记录镜像 tag：[PLACEHOLDER_IMAGE_TAG]。

## T+0

- 切 DNS 到生产 VPS IP。
- 观察 15 分钟：HTTP 5xx、API 延迟、AI 调用失败率、登录失败率。
- 只开放内测账号，禁止公开群发。

## T+30 分钟

- 替换真实 P1 凭证时逐项走 admin 审批。
- 每替换一项凭证后立即跑一条 mock-safe smoke case。
- 出现异常时回滚该凭证到 mock provider。

## T+2 小时

- 导出审计日志和红线指标快照。
- 确认备份任务下一次计划时间。
- 整理上线记录到 `[PLACEHOLDER_LAUNCH_LOG_URL]`。

## 回滚触发条件

- API 连续 5 分钟 5xx > 5%。
- 登录或支付相关接口出现跨租户/越权风险。
- AI 出境 sanitizer 失效。
- 资金异常出账或退款异常。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
