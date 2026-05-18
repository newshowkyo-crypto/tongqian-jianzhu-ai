# 25 AI 全局聊天 - Tasks

## 任务总数：8

- [x] **A1** Prisma：Conversation / ConversationMessage / ConversationSummary / ChatChannelBinding + migration
- [x] **A2** 实现 `intent-classifier/`（AI 意图识别 PromptTemplate `chat.intent` + 注册 [`04` R14](../04-ai-gateway/requirements.md)）
- [x] **A3** 实现 `orchestrator/` + 6+ 起步 handler（KPI 调 [`15`] / 合同 调 [`13`] / 催款 调 [`15`] / 政策 调 [`20`] / 资质 调 [`14`] / 可投性 调 [`11`]）
- [x] **A4** 实现 `memory/`（最近 3 轮 + 摘要 worker）+ `chat.short` / `chat.long` PromptTemplate 注册
- [x] **A5** 实现 `channels/`：web + 公众号 + 企微 webhook + 外部 API（OAuth + 限流）
- [x] **A6** 实现 `streaming/sse.service.ts`
- [x] **A7** apps/web 浮窗组件 + apps/agent / gov 接入（gov 仅触发限政府 handler）
- [x] **A8** API + e2e（多通道收敛到同一对话流）

## 完成标准

- ✅ 浮窗 + 公众号 + 企微 + 桌面 4 通道收敛
- ✅ 意图识别 → 业务任务触发
- ✅ 历史 + 摘要正确
- ✅ chat.short / chat.long / chat.intent 全部在 [`04` R14](../04-ai-gateway/requirements.md) 表中注册
