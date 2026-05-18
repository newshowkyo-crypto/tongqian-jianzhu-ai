# 运维 1 人 SOP

## 每日

- 查看 Uptime Kuma。
- 查看 Docker 容器状态。
- 查看 API error 日志。
- 查看备份是否成功。
- 查看磁盘空间。

## 每周

- 更新依赖安全告警。
- 抽查审计日志。
- 测试一次凭证 mock fallback。
- 检查 SSL 到期时间。

## 每月

- 执行红线月报。
- 执行数据出境报告。
- 执行备份恢复演练。
- 归档日志。

## 常用命令

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api --tail=200
infra/deploy/health-check.sh
infra/deploy/backup.sh
```

## 紧急情况

- 立即通知创始人。
- 触发 emergency。
- 暂停写接口。
- 保留证据。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
