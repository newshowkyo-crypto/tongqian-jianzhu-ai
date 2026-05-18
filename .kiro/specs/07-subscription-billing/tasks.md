# 07 订阅与计费 - Tasks

## 任务总数：10

- [x] **A1** 实现 SubscriptionPlan / Subscription / SubscriptionChange / RenewalAttempt / Invoice 表 + migration + seed（5 档默认）
- [x] **A2** 实现 `plans/plan.service.ts`（含 system_configs 覆盖逻辑）+ `GET /subscriptions/plans` API
- [x] **A3** 实现 `subscription.service.ts` 首次订阅 + 状态机 + 升降档（BR-407）+ 复活（BR-406）
- [x] **A4** 实现 `ladder.service.ts`（阶梯优惠 counter，PBT 强制）+ `discount-rebate.service.ts`（BR-205 返点）
- [x] **A5** 实现 `auto-renewal.worker.ts`（BullMQ cron + 提醒 + 重试 3 + past_due 转移）
- [x] **A6** 实现 `concierge.service.ts`（旗舰版顾问分配 BR-409）+ 顾问负载查询
- [x] **A7** 实现 `invoice.service.ts`（开票 + 邮箱发送 + OSS 存储）
- [x] **A8** 实现 `status-machine.ts`（BR-408 完整状态转移 + PBT）
- [x] **A9** 控制器：subscription.controller / invoice.controller + OpenAPI 注册
- [x] **A10** e2e：注册 → 试用 → 订阅 ¥199 → 阶梯优惠 → past_due → 复活 → canceled → expired 完整链路

## 完成标准

- ✅ 5 档订阅 API 可调
- ✅ 阶梯优惠 PBT 通过
- ✅ 自动续费 cron 跑通 + 失败转 past_due
- ✅ 旗舰版顾问自动分配 + 30 客户上限
