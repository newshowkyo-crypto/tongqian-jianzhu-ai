# 灾备与回滚 SOP

## 恢复目标

- RTO：≤ 4 小时
- RPO：≤ 1 小时
- 备份保留：30 天

## 备份策略

- 每日 03:00 全量 `pg_dump`。
- 每小时增量备份。
- OSS 跨区域复制。
- 业务文件单独进入 OSS bucket。

## 事故等级

- P0：数据泄漏、资金异常、跨租户访问。
- P1：API 大面积不可用、数据库不可写。
- P2：单端前端不可用、单 provider 故障。

## P0 处理

1. 触发 emergency circuit breaker。
2. 暂停 AI、支付、派单写接口。
3. 保留只读访问。
4. 通知创始人、法务、客服。
5. 导出审计日志。
6. 确认影响范围。
7. 选择恢复点。
8. 执行 restore。
9. 复核数据一致性。
10. 发布用户公告。

## 回滚部署

1. 找到上一稳定镜像 tag。
2. `TAG=[PLACEHOLDER_PREVIOUS_TAG] docker compose -f docker-compose.prod.yml up -d`
3. 执行 health check。
4. 观察 30 分钟。

## 数据恢复

1. 下载备份：`ossutil cp oss://[PLACEHOLDER_BUCKET]/pg/[PLACEHOLDER_FILE] .`
2. 解压。
3. 停写服务。
4. restore 到临时库。
5. 校验核心表行数。
6. 切换 DATABASE_URL 或恢复正式库。

## 演练记录

- 演练日期：[PLACEHOLDER_DATE]
- 恢复点：[PLACEHOLDER_BACKUP_FILE]
- 耗时：[PLACEHOLDER_DURATION]
- 问题：[PLACEHOLDER_ISSUES]

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
