# 28 合规与安全 - Design

## 1. 模块结构

```
apps/api/src/modules/security-compliance/
├── audit/
│   ├── audit.service.ts                # 协议 P-2
│   ├── audit-partition.worker.ts       # 月度分区维护
│   └── audit-query.controller.ts
├── anti-fraud/
│   ├── device-fingerprint.service.ts
│   ├── blacklist.service.ts
│   ├── registration-fraud-detector.service.ts
│   ├── rating-fraud-detector.service.ts
│   ├── quote-anomaly-detector.service.ts
│   ├── refund-fraud-detector.service.ts
│   ├── invitation-fraud-detector.service.ts
│   └── risk-dashboard.service.ts
├── data-export/                        # BR-104（与 [`06`] 协作）
├── sanitizer-audit/                    # 出境审计统计
├── backup/
│   ├── backup-monitor.service.ts       # 监控备份成功
│   └── restore-drill.service.ts
├── emergency/
│   ├── incident.service.ts
│   └── circuit-breaker.service.ts      # 4 类紧急停服
└── compliance-self-check/
    └── self-check.worker.ts            # 季度自查 cron
```

## 2. 数据模型

```prisma
model AuditLog {
  id           String   @id @default(cuid())
  trace_id     String
  user_id      String?
  tenant_id    String?
  action       String
  resource     String
  resource_id  String?
  before       Json?
  after        Json?
  ip           String?
  user_agent   String?
  created_at   DateTime @default(now())
  // 月度分区：audit_log_2025_05 / 2025_06 / ...
  @@index([action, created_at])
  @@index([resource, resource_id])
  @@index([trace_id])
}

model DeviceFingerprint {
  id           String   @id @default(cuid())
  fingerprint  String   @unique
  device_type  String
  ip           String?
  user_agent   String?
  first_seen_at DateTime @default(now())
  last_seen_at DateTime
  associated_users Json
  is_blacklisted Boolean @default(false)
}

model FraudSignal {
  id           String   @id @default(cuid())
  type         String   // 多账号 / 异常评分 / 报价异常 / 退款滥用 / 邀请滥用
  level        String   // low / medium / high
  subject_id   String   // user_id / agent_id / device_fp / phone
  evidence     Json
  status       String   // open / investigated / dismissed / confirmed
  created_at   DateTime @default(now())
  resolved_at  DateTime?
}

model BlacklistEntry {
  id           String   @id @default(cuid())
  type         String   // phone / id_card / business_license / device_fp / ip
  value        String
  reason       String
  added_by     String
  added_at     DateTime @default(now())
  @@unique([type, value])
}

model BackupRun {
  id           String   @id @default(cuid())
  run_type     String   // full / incremental
  status       String   // success / failed
  size_bytes   BigInt?
  oss_path     String?
  started_at   DateTime
  ended_at     DateTime?
  error        String?
}

model EmergencyIncident {
  id           String   @id @default(cuid())
  type         String   // data_leak / mass_unauthorized / model_account_stolen / fund_anomaly
  severity     String
  triggered_at DateTime @default(now())
  service_paused Boolean
  resolved_at  DateTime?
  notes        String?
}

model ComplianceSelfCheck {
  id           String   @id @default(cuid())
  quarter      String   // 2025-Q2
  items        Json     // { item_name, status, notes }
  created_at   DateTime @default(now())
}
```

## 3. 月度分区维护

```sql
-- prisma migration 写
CREATE TABLE IF NOT EXISTS audit_log_2025_05 PARTITION OF audit_log
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
```

worker 每月 1 号自动建下月分区 + 6 年前分区 detach 归档（OSS）。

## 4. 4 类紧急停服

```ts
async triggerEmergency(type: EmergencyType): Promise<void> {
  await this.repo.create({ type, severity: 'critical', service_paused: true });
  // 1. 切熔断器（停 AI / 支付 / 智能管家派单 写接口，保留只读）
  await this.circuitBreaker.cutWriteEndpoints();
  // 2. 通知（短信 + 企业微信 + 用户公告）
  await this.notify.broadcastEmergency(type);
  // 3. 等待人工介入
}
```

## 5. 关键 API

```yaml
GET  /api/v1/admin/audit-logs?trace_id=...
GET  /api/v1/admin/fraud/signals
POST /api/v1/admin/blacklist
GET  /api/v1/admin/backup/runs
GET  /api/v1/admin/compliance/self-check/:quarter
POST /api/v1/admin/emergency/trigger     # PLATFORM_OWNER + 2FA
POST /api/v1/admin/emergency/resolve
```

## 6. 错误码 `SEC.*` / `FRAUD.*` / `AUDIT.*` / `EXPORT.*`

- `FRAUD.BLOCKED` (422)
- `FRAUD.RATING_DISCARDED` (warning)
- `SEC.EMERGENCY.SERVICE_PAUSED` (503)
- `AUDIT.LOG.IMMUTABLE_VIOLATION` (内部错，不应发生)

## 7. PBT

| 属性 | 函数 |
|---|---|
| 审计日志不可修改 / 不可删除 | audit.service |
| 反薅幂等 | fraud detectors |
| 备份失败立即告警 | backup-monitor |

## 8. 后台覆盖

| key | 内容 |
|---|---|
| `security.fraud.thresholds` | 各 detector 阈值 |
| `security.backup.retention_days` | 默认 30 |
| `security.emergency.services_to_pause` | 哪些服务在紧急时停 |

## 9. 上线前合规自查清单（创始人 + 法务）

- [ ] ICP 备案完成
- [ ] 用户协议 / 隐私政策 / 智能管家合作协议 / 数据出境授权书 全部上线
- [ ] 4 道防线跨租户测试通过
- [ ] 数据出境脱敏 PBT 通过
- [ ] 备份恢复演练通过
- [ ] 6 条红线监控配置
- [ ] 紧急响应预案演练
- [ ] 创始人准备清单 [`docs/owner-preparation-checklist.md`](../../../docs/owner-preparation-checklist.md) 全部 P0 完成


---

## V4 升级·5 项合规扩展（R5-R9 设计）

### V4.1 智能管家服务协议合规（R5）

复用 22-spec AgentConsent 模型 + 服务：
- 注册时强制勾选 5 项承诺
- 违反 → 立即清退 + 信誉一票否决 + 全网黑名单
- 后台可视化签订时间 + 协议版本

### V4.2 AI 数据源合规（R6）

```prisma
model AIDataSource {
  id           String   @id @default(cuid())
  source_name  String   @unique  // 招投标平台 / 信用中国 / 四库一平台
  source_url   String
  source_type  String   // public_government / public_industry
  authorized   Boolean  @default(false)  // 是否签订授权
  qps_limit    Int      @default(1)
  user_agent   String   // "同乾方略科研爬虫 + biz@tongqian.io"
  robots_compliant Boolean @default(true)
  last_audit_at DateTime?
}
```

```
apps/api/src/modules/security/data-source-audit/
├── source-registry.service.ts         # 11 大权威源注册
├── compliance-check.worker.ts         # 季度自查
└── unauthorized-block.service.ts      # 阻止爬非法源
```

### V4.3 政企公文水印（R7）

复用 23-spec watermark 模块：
- 45° 倾斜 5% 透明度
- 嵌入式水印（PDF 内层）
- 末页 traceId 二维码
- 检测尝试去水印 → 写审计

### V4.4 AI 输出免责强制（R8 / BR-322）

复用 10-spec required-elements + 04-spec output-validator：
- 自动校验 4 强制要素
- 数据源声明含具体来源
- 5 引导按钮按角色裁剪
- 缺失任一 → 拒绝输出

### V4.5 项目寻源数据流约束（R9）

```
apps/api/src/modules/security/project-sourcing-guard/
├── desensitize.service.ts             # 双向脱敏
├── chat-channel.service.ts            # 双向脱敏聊天通道
├── domestic-only-router.service.ts    # 强制国产模型（即使 BR-505 授权）
└── audit-recorder.service.ts          # 6 年留存
```
