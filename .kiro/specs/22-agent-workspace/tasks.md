# 22 智能管家工作台 - Tasks

## 任务总数：22（核心模块）

## Phase A：数据层（3 个）

- [x] **A1** Prisma：AgentProfile / AgentRelation / ReputationScore / ReputationLog + migration
- [x] **A2** Prisma：Dispatch / DispatchQuote / AgentRating / ClientRating / RatingReminder + migration
- [x] **A3** Prisma：AgentAppeal / ReferralFee / PremiumServiceItem / PremiumServiceInquiry + migration + seed（10 类高端服务）

## Phase B：档案 + 裂变 + 分润（3 个）

- [x] **B1** 实现 `profile/agent-profile.service.ts` + 推广码生成
- [x] **B2** 实现 `fission/`（PBT：自引用 ≤ 2 级）+ `referral/referral.service.ts`（BR-305 邀请奖励）
- [x] **B3** 实现 `commission/calculator.service.ts`（30/20/15）+ `lifecycle.service.ts`（状态机，与 [`09`] 整合）

## Phase C：派单核心（5 个）

- [x] **C1** 实现 `dispatch/classifier.service.ts`（BR-307 PBT）
- [x] **C2** 实现 `dispatch/router.service.ts`（BR-308 池路由）+ `pool/owned-pool` / `cross-pool` / `public-pool`
- [x] **C3** 实现 `dispatch/scorer.service.ts`（BR-336 4 维加权 PBT，Top 3 顺序稳定）
- [x] **C4** 实现 `dispatch/quote.service.ts`（调 [`21`] 标色 PBT 4 档）+ `customer-pickup.service.ts`
- [x] **C5** 实现 `dispatch/takeover.service.ts`（BR-311 6 触发 + 推荐费触发原因区分）+ `customer-service-fallback.service.ts`

## Phase D：评分（2 个）

- [x] **D1** 实现 `rating/rating.service.ts` + `window-monitor.worker.ts`（30 天 + 自动 4★ + 防骚扰 PBT）
- [x] **D2** 实现 `client-reputation.service.ts`（BR-333 挂 tenant + 联动规则 < 300 / < 100）

## Phase E：信誉（4 个）

- [x] **E1** 实现 `reputation/event-bus/`（BullMQ reputation-events 队列 + applyDelta 服务，原子写）
- [x] **E2** 实现 `reputation/level-resolver.service.ts`（BR-332 + 新智能管家 30 天保护 + LV1 重启 PBT，终身 6 次）
- [x] **E3** 实现 `reputation/visibility.service.ts`（BR-334 公开度差异化）
- [x] **E4** 实现 `reputation/appeal/`（BR-335 反向事件 PBT，原 log 不修改）

## Phase F：申诉 + 推荐费 + 高端货架（3 个）

- [x] **F1** 实现 `appeal/appeal.service.ts`（BR-314 三级流程，复用 [`06`] 审批引擎）
- [x] **F2** 实现 `referral-fee/referral-fee.service.ts`（BR-313 比例 + 冻结期 7/30/45 + LV3 封顶 10% + 触发原因 100%/80%/0%）
- [x] **F3** 实现 `premium-shelf/`（10 类 + 询价 → 创建 consulting_order）

## Phase G：日报 + 联合品牌 + 排行（2 个）

- [x] **G1** 实现 `daily-card/daily-card.worker.ts`（cron 08:00）+ `co-brand/co-brand.service.ts`（联合品牌报告）
- [x] **G2** 实现 `ranking/ranking.service.ts`（月度按分润 + 信誉分双维度）+ `activity/activity-monitor.worker.ts`（BR-306 月活红线 cron）

## Phase H：API + 前端 + e2e（3 个）

- [x] **H1** 全部 API 实现 + OpenAPI 注册
- [x] **H2** apps/agent 前端：工作台 / 派单大厅 / 收益 / 信誉看板 / 客户管理 / 高端货架 / 申诉 / 排行
- [x] **H3** e2e：场景 2（A 类派单）+ 场景 3（B 类同乾方略 + 推荐费）+ 场景 4（二级裂变）

## 完成标准

- ✅ 全部 PBT 通过（13+ 项）
- ✅ 派单 A/B/C 分类 + 4 维加权 + 报价标色 + 6 触发接管
- ✅ 信誉分加减 + 等级 + 申诉反向 + 24h 缓冲
- ✅ 推荐费按类型冻结期 + LV3 封顶 + 触发原因
- ✅ 高端货架 10 类可询价
- ✅ e2e 场景 2/3/4 通过


---

## V4 升级新增任务（P3 / P7 补丁）

- [x] **22-V4-1** AgentClientSignal 模型 + migration + signal-detector.worker.ts cron 6 类信号扫描
- [x] **22-V4-2** AI 客户预警卡推送服务（站内 + 短信）+ 7 天 cooldown / 3 月拒绝周期 + 主动联系成功率 +5 信誉
- [x] **22-V4-3** AgentCaseStudy + AgentCaseDownload 模型 + migration + case-upload.service.ts（自审 3 项承诺）
- [x] **22-V4-4** case-ai-reviewer.service.ts AI 自动审（脱敏 / 重复 / 违规）
- [x] **22-V4-5** case-marketplace.service.ts 浏览 + 搜索 + 下载（5 点 / 次给上传方）
- [x] **22-V4-6** AgentConsent 模型 + 5 项合规承诺勾选 + 注册时强制
- [x] **22-V4-7** earnings-calendar 服务（S1 收益日历每天 0:00 短信）
- [x] **22-V4-8** client-health-dashboard 服务（S2 客户健康度仪表）
- [x] **22-V4-9** 智能管家学院 academy 模块骨架（6 节培训 + 通关检测）
- [x] **22-V4-10** e2e 测试：V4 R10 / R11 场景全流程


---

## V4 IMPROVEMENTS 新增任务（PARTNER 角色，二期 M4 启用）

- [x] **22-IMP-1** AgentSubtype enum 加 AGENT_PARTNER + Prisma migration
- [x] **22-IMP-2** AgentReferral / AgentReferralCommission / PartnerReputation 3 模型 + migration
- [x] **22-IMP-3** partner-registration.service.ts（无 training 阶段，注册即审）
- [x] **22-IMP-4** referral-tracking.service.ts（3 类推荐链追踪）
- [x] **22-IMP-5** commission-calculator.service.ts（5%/3%/5%/5% 分润）
- [x] **22-IMP-6** activation-checker.worker.ts（30 天激活检测）
- [x] **22-IMP-7** anti-fraud.service.ts（年 50 老板 + 20 智能管家限额 + 5 维去重）
- [x] **22-IMP-8** partner-reputation.service.ts（独立信誉计算）
- [x] **22-IMP-9** apps/agent PARTNER 工作台（仅推荐 + 分润页面，禁用派单大厅）
- [x] **22-IMP-10** Feature Flag 控制：一期关闭 PARTNER，M4 邀请制开放
- [x] **22-IMP-11** e2e：PARTNER 注册 → 推荐 → 30 天激活 → 分润 → 反作弊


---

## V4 IMPROVEMENTS 新增任务（漏洞 5 私下交易反作弊）

- [x] **22-IMP-12** 客户评分关键字检测（红包 / 礼物 / 私下）+ 风控告警
- [x] **22-IMP-13** 智能管家月外联次数限制（≤ 5 / 月，可后台调）
- [x] **22-IMP-14** 私下交易黑名单（智能管家终身封禁 / 客户派单限制）
- [x] **22-IMP-15** 双向举报通道（6 类理由 + 24-72h 处理）
- [x] **22-IMP-16** AI 助理对话主动检测"加微信 / 线下"+ 弹窗提醒（≤ 3 次 / 月）
