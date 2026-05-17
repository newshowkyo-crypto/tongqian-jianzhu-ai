# 27 通知中心 - Design

## 1. 模块结构

```
apps/api/src/modules/notification/
├── notification.module.ts
├── notification.service.ts            # 主入口 send(template, ctx, channels)
├── channels/
│   ├── inbox.channel.ts               # 站内
│   ├── wechat-mp.channel.ts           # 公众号
│   ├── work-wechat.channel.ts
│   ├── sms.channel.ts                 # 阿里云
│   ├── email.channel.ts
│   └── desktop.channel.ts             # 桥接 [`05`]
├── templates/
│   ├── template.service.ts
│   └── seed/
├── dispatcher/
│   ├── dispatcher.service.ts          # 多通道分发 + 失败降级
│   └── dedupe.service.ts              # 事件去重
├── throttle/
│   ├── throttle.service.ts            # 紧迫感 + 评分催评 + 系统级上限
│   └── urgency-throttle.service.ts    # 与 [`26`] 共用
├── preferences/
│   └── preferences.service.ts
└── stats/
    └── delivery-stats.service.ts
```

## 2. 数据模型

```prisma
model NotificationTemplate {
  id              String   @id @default(cuid())
  scenario        String   @unique  // subscription_renew / qualification_expiring / ...
  inbox_template  Json
  wechat_mp_template Json?
  work_wechat_template Json?
  sms_template    Json?
  email_template  Json?
  level           String   // critical / high / normal / low
  is_active       Boolean  @default(true)
}

model Notification {
  id              String   @id @default(cuid())
  user_id         String
  scenario        String
  channel         String
  status          String   // queued / sent / delivered / failed / read
  content         Json
  external_id     String?  // 公众号 message_id / 短信 SerialNo
  event_hash      String   // 去重
  scheduled_at    DateTime?
  sent_at         DateTime?
  read_at         DateTime?
  failure_reason  String?
  trace_id        String
  created_at      DateTime @default(now())
  @@index([user_id, scenario, event_hash])
  @@index([user_id, channel, sent_at])
}

model NotificationPreference {
  id              String   @id @default(cuid())
  user_id         String   @unique
  inbox_enabled   Boolean  @default(true)
  wechat_mp_enabled Boolean @default(true)
  work_wechat_enabled Boolean @default(true)
  sms_enabled     Boolean  @default(true)
  email_enabled   Boolean  @default(false)
  desktop_enabled Boolean  @default(true)
}
```

## 3. 关键 API

```yaml
GET  /api/v1/notifications/me
PUT  /api/v1/notifications/:id/read
PUT  /api/v1/notifications/preferences
GET  /api/v1/admin/notifications/stats
POST /api/v1/admin/notifications/templates
```

## 4. 错误码 `NOTIF.*`

- `NOTIF.CHANNEL.UNAVAILABLE` (502)
- `NOTIF.THROTTLE.LIMIT_REACHED` (warning)
- `NOTIF.PREFERENCE.BLOCKED` (info, 用户偏好关闭)

## 5. PBT

| 属性 | 函数 |
|---|---|
| 同事件不重复（hash 去重）| dispatcher |
| 紧迫感节流 ≤ 3/日 | throttle |
| 失败自动降级到次优通道 | dispatcher |

## 6. 后台覆盖

| key | 内容 |
|---|---|
| `notification.templates.{scenario}` | 模板 |
| `notification.system_max_per_user_per_day` | 默认 50 |
| `notification.fallback_chain.{level}` | 降级顺序 |
