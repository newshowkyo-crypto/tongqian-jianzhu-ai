# 15 经营成本工具集 - Tasks

## 任务总数：8

- [ ] **A1** Prisma：AssistantQuery / GeneratedDocument / PolicySubscription / PolicyImpactAnalysis + migration
- [ ] **A2** 实现 `boss-assistant/`（意图识别 + 白名单 SQL 模板执行 + PBT 防注入）
- [ ] **A3** 实现 `reminder-letter/`（含 3 档语气 PBT）
- [ ] **A4** 实现 `doc-generator/`（meeting-minutes / work-report / business-letter）
- [ ] **A5** 实现 `audio-transcribe/`（阿里云语音转文字 + ≤ 100MB）
- [ ] **A6** 实现 `policy-interpreter/`（调 [`20`] 政策库 + 影响分析）
- [ ] **A7** PromptTemplate 全部注册到 [`04-ai-gateway`]
- [ ] **A8** API + 前端（apps/web）AI 助理 / 文档生产 / 政策中心 + e2e

## 完成标准

- ✅ AI 助理仅能执行白名单 SQL（PBT 防注入）
- ✅ 催收函语气按账龄变化（PBT）
- ✅ 政策推送 24h 内
- ✅ 音频转文字 ≤ 100MB 限制


---

## V4 升级新增任务（杀手锏 E 重写）

- [ ] **15-V4-1** intent-classifier + route-dispatcher（10 点入口分发）
- [ ] **15-V4-2** AssistantConversationStreak 模型 + 7/30/100/365 天解锁
- [ ] **15-V4-3** UserAssistantPersonality 模型 + 4 性格 prompt（默认严谨型）
- [ ] **15-V4-4** memory-recall.service.ts 历史话题主动提
- [ ] **15-V4-5** InspirationCard 模型 + trigger-checker（4 条件）+ 内容源
- [ ] **15-V4-6** daily-task-tracker（聊 3 句 / 查数据 / 写文档 + 周末抽 1000 点）
- [ ] **15-V4-7** 早安 / 决策小测 / 同行情报 / AI 周报 / 公文 / 灵感卡 6 钩子（与 26 spec 协同）
- [ ] **15-V4-8** 财务工具（应收 / 催款 / 现金流）
- [ ] **15-V4-9** 商务工具（邀请函 / 客户备忘 / 投标准备）
- [ ] **15-V4-10** 资料员工具 ¥499+（归档 / 完整性 / 八大员）
- [ ] **15-V4-11** 法务工具（咨询对话 / 月度风险体检）
- [ ] **15-V4-12** 5 引导按钮按角色裁剪（与 10-report-center 协同）
- [ ] **15-V4-13** 5 档订阅功能墙 enforcement
- [ ] **15-V4-14** e2e：AI 助理 + 6 钩子 + 5 引导 + 4 性格 + 养成系
