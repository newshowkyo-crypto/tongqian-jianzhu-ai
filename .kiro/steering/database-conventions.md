---
inclusion: always
---

# 数据库规范（Database Conventions）

## 1. 数据库选型

- 主库：PostgreSQL ≥ 15
- 缓存：Redis ≥ 7（业务缓存 + 队列 + 限流）
- 向量库：DashVector（阿里云）/ Qdrant（备用）
- 文件存储：阿里云 OSS（私有桶）

## 2. 命名规范

- 表名：snake_case 复数 → `user_profiles`、`contract_reviews`
- 字段：snake_case → `created_at`、`tenant_id`
- 索引：`idx_{table}_{fields}` → `idx_users_email`
- 唯一索引：`uq_{table}_{fields}` → `uq_users_email`
- 外键：`fk_{table}_{ref_table}` → `fk_orders_users`
- 主键：所有表用 `id` 字段，类型 `cuid()`（兼容分布式 + 可读性）

## 3. 通用字段（每张业务表必有）

```prisma
id          String   @id @default(cuid())
tenant_id   String   // 多租户隔离
created_at  DateTime @default(now())
updated_at  DateTime @updatedAt
deleted_at  DateTime?  // 软删除
created_by  String?  // 用户 ID
updated_by  String?
version     Int      @default(0)  // 乐观锁
```

## 4. 多租户隔离

**所有业务表必带 `tenant_id`，所有查询必带 WHERE tenant_id**。

例外：
- 系统级表（用户表、企业表本身）
- 全局配置表
- 平台运营表

## 5. 软删除

- 不允许物理删除业务数据
- 用 `deleted_at` 字段标记
- 所有查询默认 WHERE `deleted_at IS NULL`
- 30 天后由 cron job 清理

## 6. 时间字段

- 所有时间字段用 `TIMESTAMPTZ`（带时区）
- 存储用 UTC
- 查询前端用 Asia/Shanghai

## 7. 索引

### 必加索引
- 所有外键
- 所有查询常用字段（`tenant_id`、`status`、`created_at`）
- 排序字段
- 分页字段

### 避免
- 在低基数字段建独立索引（如 boolean，应组合）
- 重复索引
- 超过 5 个字段的复合索引

## 8. JSON 字段

- 用 PostgreSQL `jsonb`（不是 `json`）
- 频繁查询的内嵌字段用 GIN 索引
- 不可变结构 → 改用独立表

## 9. 状态机字段

- 所有 status 字段必须用枚举（Prisma `enum`）
- 状态字段命名：`status` / `{noun}_status`（`order_status`）
- 状态变更必须在 service 层校验合法转移

## 10. 软外键 vs 硬外键

- 同一聚合根内：用硬外键（`@relation`）+ `onDelete: Cascade`
- 跨聚合根：用软外键（仅存 ID，不建 DB 约束）

## 11. 事务

- 涉及多张表的写操作必须用 `prisma.$transaction`
- 分布式事务用 Saga 模式（队列驱动）
- 幂等性必须用 Idempotency-Key + 数据库唯一约束

## 12. 分库分表（暂不需要）

- 一期单库单实例
- 上线后客户数 ≥ 5 万再考虑分表
- 大数据量表（审计日志、AI 调用日志）按月分区

## 13. Migration

- 用 `prisma migrate dev --name {description}`
- 迁移文件名：`{timestamp}_{snake_case_description}/`
- 生产环境用 `prisma migrate deploy`
- 重大数据迁移分两步：先加字段（向后兼容）→ 部署代码 → 再删旧字段

## 14. 数据完整性

- 字段约束在 DB 层定义（NOT NULL、UNIQUE、CHECK）
- 业务约束在 service 层校验
- 不依赖 trigger（除审计触发器）

## 15. 备份策略

- 全量备份：每天凌晨 3 点
- 增量备份：每小时
- 备份保留：30 天
- 备份地点：阿里云 OSS 跨区域复制
- 季度恢复演练

## 16. 性能基线

- 单查询 ≤ 100ms
- 单事务 ≤ 1s
- 锁等待 ≤ 100ms
- 慢查询日志阈值 500ms
- 主从复制延迟 ≤ 1s

## 17. 敏感字段

| 字段 | 处理 |
|---|---|
| 密码 | bcrypt 加密 |
| 银行卡号 | AES-256-GCM 加密 |
| 身份证号 | AES-256-GCM 加密 |
| 手机号 | 明文 + 单独索引 |
| API Key | AES-256-GCM 加密 |

## 18. 审计触发器

关键表（订单、合同、点数、佣金、提现）必须有审计触发器，自动写 `audit_log` 表：

```sql
-- 触发器自动记录每次 INSERT / UPDATE / DELETE
old_value (jsonb)
new_value (jsonb)
operation
operator_id
timestamp
```

## 19. 字符集

- 数据库：UTF-8
- 字段：默认 collation `zh_CN.UTF-8`
- 全文搜索字段额外建 `tsvector` 索引

## 20. 禁止行为

❌ 在 controller / service 直接调 PrismaClient（必须经 repository）
❌ 用 `findMany({})` 不带 WHERE 全表扫描
❌ 用 SELECT \*（必须显式列字段）
❌ 跨租户 JOIN
❌ 在事务里调 AI / 第三方 API（事务超时）
❌ 物理删除（必须软删）
❌ 不带 tenant_id 的查询

## 21. Prisma 最佳实践

- 使用 `select` 只取需要的字段
- 用 `include` 一次取关联数据，避免 N+1
- 大列表用 `cursor` 分页
- 频繁查询用 `@@index` 加复合索引
- 用 `Prisma.Decimal` 处理金额（不用 Float / Number）
