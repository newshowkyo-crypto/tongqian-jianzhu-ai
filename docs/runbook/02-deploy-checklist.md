# 上线检查表

| 序号 | 检查项 | 状态 |
| --- | --- | --- |
| 1 | ACR_REGISTRY / ACR_USERNAME / ACR_PASSWORD 已配置 | 未勾选 |
| 2 | `.env.prod` 已填写数据库、Redis、JWT、MASTER_ENCRYPTION_KEY | 未勾选 |
| 3 | `/admin/credentials` 已完成 P0 凭证真实连通测试 | 未勾选 |
| 4 | ICP_RECORD_NO 已在备案通过后写入系统配置 | 未勾选 |
| 5 | 80 / 443 安全组已开放，22 仅限运维 IP | 未勾选 |
| 6 | SSL 证书已签发并挂载到 nginx | 未勾选 |
| 7 | PostgreSQL 每日 03:00 备份任务已启用 | 未勾选 |
| 8 | Redis appendonly 已启用且目录持久化 | 未勾选 |
| 9 | Uptime Kuma 已配置 6 个健康探针 | 未勾选 |
| 10 | Nginx access/error log 已采集 | 未勾选 |
| 11 | WAF、DDoS、限流规则已在云控制台启用 | 未勾选 |
| 12 | 回滚演练 `rollback.sh` 已跑通 | 未勾选 |
