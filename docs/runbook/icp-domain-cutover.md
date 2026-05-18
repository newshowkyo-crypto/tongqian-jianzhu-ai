# ICP 与域名切换 Runbook

## 前置条件

- ICP 备案号：[PLACEHOLDER_ICP_NUMBER]
- 域名：[PLACEHOLDER_DOMAIN]
- VPS 公网 IP：[PLACEHOLDER_VPS_IP]
- DNS 服务商账号已可登录。
- Nginx 已配置 5 个 host。

## Host 规划

- `www.[PLACEHOLDER_DOMAIN]` → web
- `api.[PLACEHOLDER_DOMAIN]` → api
- `admin.[PLACEHOLDER_DOMAIN]` → admin
- `agent.[PLACEHOLDER_DOMAIN]` → agent
- `gov.[PLACEHOLDER_DOMAIN]` → gov

## 切换步骤

1. DNS TTL 调整为 300 秒。
2. 添加 A 记录到 VPS IP。
3. 在 VPS 执行 Nginx 配置检查：`nginx -t`。
4. 签发证书：`acme.sh --issue -d [PLACEHOLDER_DOMAIN] -d *.[PLACEHOLDER_DOMAIN]`。
5. reload Nginx：`docker compose restart nginx`。
6. 验证 HTTPS：
   - `curl -I https://www.[PLACEHOLDER_DOMAIN]`
   - `curl -I https://api.[PLACEHOLDER_DOMAIN]/health`
7. 打开 Uptime Kuma 监控。
8. 观察 30 分钟。

## 回滚

- DNS A 记录切回旧 IP 或暂停解析。
- Nginx 回退到上一份 conf。
- 证书异常时临时关闭强制 HTTPS，限内测使用。

## 注意

- 政企端上线前必须确认水印与审计开关。
- admin 域名不公开传播，仅白名单访问。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
