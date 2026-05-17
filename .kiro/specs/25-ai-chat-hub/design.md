# 25 AI 全局聊天 - Design

## 1. 模块结构

```
apps/api/src/modules/chat-hub/
├── chat-hub.module.ts
├── conversations/
│   ├── conversation.service.ts
│   └── conversation.controller.ts
├── intent-classifier/
│   ├── classifier.service.ts
│   └── prompts/intent.ts          # AI 意图识别
├── orchestrator/
│   ├── orchestrator.service.ts    # 调用业务模块
│   └── handlers/                  # 每个意图一个 handler
│       ├── kpi-query.handler.ts
│       ├── contract-review.handler.ts
│       ├── reminder-letter.handler.ts
│       └── ...
├── memory/
│   ├── memory.service.ts          # 历史 + 摘要
│   └── summary-worker.ts
├── channels/
│   ├── web-channel.controller.ts
│   ├── wechat-channel.controller.ts   # 公众号
│   ├── work-wechat-channel.controller.ts  # 企微
│   └── api-channel.controller.ts      # 外部 API + OAuth
└── streaming/
    └── sse.service.ts             # SSE 推送响应
```

## 2. 数据模型

```prisma
model Conversation {
  id              String   @id @default(cuid())
  user_id         String
  tenant_id       String
  title           String?
  channel         String   // web / desktop / wechat / work_wechat / api
  status          String   @default("active")
  last_at         DateTime @default(now())
  created_at      DateTime @default(now())
  @@index([user_id, last_at])
}

model ConversationMessage {
  id              String   @id @default(cuid())
  conversation_id String
  role            String   // user / assistant / system
  content         String   @db.Text
  intent          String?  // 识别到的意图
  triggered_task_id String?  // 关联 ai_tasks
  meta            Json?
  created_at      DateTime @default(now())
  @@index([conversation_id, created_at])
}

model ConversationSummary {
  id              String   @id @default(cuid())
  conversation_id String
  range_from      DateTime
  range_to        DateTime
  summary         String   @db.Text  // 200 字以内
  created_at      DateTime @default(now())
}

model ChatChannelBinding {
  id              String   @id @default(cuid())
  user_id         String
  channel         String
  external_id     String   // 公众号 openid / 企微 userid
  is_active       Boolean  @default(true)
  bound_at        DateTime @default(now())
  @@unique([channel, external_id])
}
```

## 3. 意图编排

```ts
class OrchestratorService {
  async dispatch(intent: string, slots: object, ctx: ChatCtx): Promise<DispatchResult> {
    const handler = this.handlers.get(intent);
    if (!handler) return this.fallbackToGenericChat(slots, ctx);
    return handler.handle(slots, ctx);
  }
}

// 例：合同审查 handler
class ContractReviewHandler implements IntentHandler {
  async handle(slots: { contractFileId: string }, ctx) {
    // 触发 [`13-risk-review`] 异步任务
    const task = await this.contractReviewService.create(slots, ctx);
    return {
      replyText: `已为您启动合同审查，预计 30 秒后给出老板版报告。`,
      followUp: { type: 'task_progress', taskId: task.id, redirectUrl: `/contracts/${task.contract_id}` },
    };
  }
}
```

## 4. 关键 API

```yaml
POST /api/v1/chat/conversations
GET  /api/v1/chat/conversations/me
POST /api/v1/chat/conversations/:id/messages
GET  /api/v1/chat/conversations/:id/messages?cursor=...
GET  /api/v1/chat/conversations/:id/stream  # SSE

# 公众号回调
POST /api/v1/chat/channels/wechat/webhook
POST /api/v1/chat/channels/work-wechat/webhook

# 外部 API
POST /api/v1/openapi/chat            # OAuth + 限流
```

## 5. 错误码 `CHAT.*`

- `CHAT.INTENT.UNKNOWN` (200, fallback to generic)
- `CHAT.CHANNEL.UNAUTHORIZED` (401)

## 6. PBT

| 属性 | 函数 |
|---|---|
| 历史窗口 ≤ 3 轮原文 | memory.service |
| 意图识别 → 业务调度幂等 | orchestrator |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `chat.history.recent_turns` | 默认 3 |
| `chat.intent_handlers` | 启用 / 禁用某 handler |
