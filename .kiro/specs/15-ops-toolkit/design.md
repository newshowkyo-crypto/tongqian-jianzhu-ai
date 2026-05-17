# 15 经营成本工具集 - Design

## 1. 模块结构

```
apps/api/src/modules/ops-toolkit/
├── ops-toolkit.module.ts
├── boss-assistant/
│   ├── kpi-query.service.ts          # 内部数据问答（限定 SQL 模板）
│   └── prompts/kpi-query.ts
├── reminder-letter/
│   ├── reminder.service.ts
│   └── prompts/reminder-letter.ts
├── doc-generator/
│   ├── meeting-minutes.service.ts
│   ├── work-report.service.ts
│   ├── business-letter.service.ts
│   └── prompts/
├── policy-interpreter/
│   ├── policy.service.ts             # 调 [`20-knowledge-system`]
│   └── prompts/policy-impact.ts
└── audio-transcribe/
    └── transcribe.service.ts         # 阿里云语音转文字
```

## 2. 数据模型

```prisma
model AssistantQuery {
  id              String   @id @default(cuid())
  user_id         String
  question        String
  ai_task_id      String   @unique
  result_data     Json
  query_template  String?  // 触发的 SQL 模板（限定列表）
  created_at      DateTime @default(now())
}

model GeneratedDocument {
  id              String   @id @default(cuid())
  tenant_id       String
  user_id         String
  doc_type        String   // reminder_letter / meeting_minutes / work_report / business_letter
  content         String   @db.Text
  pdf_url         String?
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model PolicySubscription {
  id              String   @id @default(cuid())
  tenant_id       String
  topics          Json     // ['基建', '化债', '专项债']
  level           Json     // ['中央', '省', '市']
  push_enabled    Boolean  @default(true)
}

model PolicyImpactAnalysis {
  id              String   @id @default(cuid())
  tenant_id       String
  policy_id       String
  ai_task_id      String   @unique
  impact_summary  String
  actions         Json
  created_at      DateTime @default(now())
}
```

## 3. KPI Query 安全设计

⚠️ AI 老板助理**禁止**直接生成 SQL（防注入）。改为：
- AI 输出"意图 + 实体"结构化结果（如 `{intent: 'top_profit_project', period: 'last_month'}`）
- 后端按白名单 SQL 模板执行
- 模板列表后台可扩展（[`24-admin-console`]）

## 4. 关键 API

```yaml
POST /api/v1/assistant/queries          # AI 老板助理
POST /api/v1/docs/reminder-letter
POST /api/v1/docs/meeting-minutes       # 含音频上传
POST /api/v1/docs/work-report
POST /api/v1/docs/business-letter
GET  /api/v1/policies                    # 政策列表
POST /api/v1/policies/:id/impact        # 影响分析
PUT  /api/v1/policies/preferences
```

## 5. 错误码

`OPS.*` / `KB.*`：
- `OPS.ASSISTANT.QUERY_TEMPLATE_NOT_FOUND` (422，意图未匹配模板)
- `OPS.AUDIO.TRANSCRIBE_FAILED` (502)
- `OPS.AUDIO.TOO_LARGE` (413)

## 6. PBT

| 属性 | 函数 |
|---|---|
| 仅白名单 SQL 模板可执行 | KPI Query |
| 催收函语气随账龄变化 | reminder.service |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `ops.boss_assistant.query_templates` | 白名单 SQL 模板 |
| `ops.reminder_letter.cost` | 默认 30 点 |
| `ops.audio.max_mb` | 默认 100 |


---

## V4 升级·AI 老板助理 + 6 钩子 + 5 性格（R1-R7 设计）

### V4.1 入口分发（R1.1 BR-325 V4 红线 1）

```
apps/api/src/modules/ops-toolkit/orchestrator/
├── intent-classifier.service.ts      # 意图识别（10 点 / 次）
├── route-dispatcher.service.ts       # 分发到 ABCDE 5 大模块
└── conversation-context.service.ts    # 对话上下文（最近 3 轮原文 + 早摘要 200 字）
```

意图路由：
- 资质相关 → 调 14 数据 + 用 E 语气回
- 招标 / 项目 → 调 11 数据
- 合同 / 风险 → 调 13 数据
- 标书 / 续写 → 调 12 数据
- 政策 / 内部 → 直接 E 处理

### V4.2 5 个聊天上瘾钩子（R1.3 实现）

```prisma
model AssistantConversationStreak {
  id            String   @id @default(cuid())
  user_id       String   @unique
  current_streak Int     @default(0)
  longest_streak Int     @default(0)
  last_chat_at  DateTime?
  unlocked_tags String[]  // ["了解你的公司", "懂你脾气", "老搭档", "365 天"]
  reward_claims Json[]
  
  @@index([user_id])
}

model UserAssistantPersonality {
  id            String   @id @default(cuid())
  user_id       String   @unique
  current_personality String  // strict / brotherly / academic / housekeeper
  switch_history Json[]   // 切换历史，每周 1 次
  last_switched_at DateTime?
}

model InspirationCard {
  id            String   @id @default(cuid())
  user_id       String
  card_content  Json
  trigger_reason String   // 4 条件触发判定
  pushed_at     DateTime @default(now())
  user_action   String?  // viewed / clicked / dismissed / closed_forever
}
```

```
apps/api/src/modules/ops-toolkit/assistant/
├── chat.service.ts                   # AI 对话主入口
├── personality/                       # 4 性格风格
│   ├── strict.prompt.ts
│   ├── brotherly.prompt.ts
│   ├── academic.prompt.ts
│   └── housekeeper.prompt.ts
├── streak/
│   ├── streak-tracker.service.ts     # 7/30/100/365 天连续
│   ├── unlock-tag.service.ts          # 解锁标签 + 实物
│   └── memory-recall.service.ts       # 历史话题主动提
├── inspiration-card/
│   ├── trigger-checker.service.ts     # 4 条件触发判定
│   ├── card-renderer.service.ts       # 灵感卡 UI
│   └── content-source.service.ts      # 调用本周本地真实情报
└── daily-task/
    └── daily-task-tracker.service.ts  # 对话连胜任务（聊 3 句 / 查数据 / 写文档）
```

### V4.3 6 个高频钩子（R2 实现，与 26 spec 协同）

| 钩子 | 服务 | 扣点 |
|---|---|---|
| 12.1 早安 AI 简报 | morning-briefing.service.ts（在 26 spec）| 50 |
| 决策小测 | daily-quiz.service.ts（在 26 spec）| 50 |
| 同行情报快闪 | peer-intel.service.ts（本 spec）| 100 |
| AI 周报 | weekly-report.service.ts（本 spec）| 200 |
| 公文 / 商务函代写 | document-writer.service.ts（本 spec）| 30-200 |
| 灵感卡 | inspiration-card（已上面）| 30 |

### V4.4 财务 / 商务 / 资料员 / 法务工具（R3-R6）

```
apps/api/src/modules/ops-toolkit/finance/
├── ar-aging.service.ts                # 应收账龄分析（200）
├── reminder-letter.service.ts          # 催款函（30）
├── cashflow-forecast.service.ts        # 现金流预测（300）
└── financing-diagnosis-bridge.ts       # 融资诊断（500，桥接 19 spec）

apps/api/src/modules/ops-toolkit/business/
├── invitation-letter.service.ts
├── client-memo.service.ts
└── tender-prep-list.service.ts

apps/api/src/modules/ops-toolkit/document/  # 资料员 ¥499+
├── archive-catalog.service.ts
├── completeness-check.service.ts
└── personnel-form-batch.service.ts

apps/api/src/modules/ops-toolkit/legal/
├── consult.service.ts                  # 法律咨询对话（100/轮）
└── monthly-review.service.ts            # 月度风险体检（500）
```
