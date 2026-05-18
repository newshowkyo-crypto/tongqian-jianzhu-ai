# 27 通知中心 - Tasks

## 任务总数：8

- [x] **A1** Prisma：NotificationTemplate / Notification / NotificationPreference + migration + seed（30+ 起步模板）
- [x] **A2** 实现 6 个 channel：inbox / wechat-mp / work-wechat / sms / email / desktop
- [x] **A3** 实现 `dispatcher/dispatcher.service.ts`（多通道 + 失败降级 PBT）+ `dedupe.service.ts`（事件 hash）
- [x] **A4** 实现 `throttle/`（紧迫感 + 评分催评 + 系统级上限 PBT）
- [x] **A5** 实现 `preferences/`（用户偏好 + 政府版禁公众号 / 企微）
- [x] **A6** 实现 `stats/delivery-stats.service.ts` + 后台看板 API
- [x] **A7** API + 与全部业务模块集成（消费 send）
- [x] **A8** e2e（公众号 / 企微 mock 通道 + 桌面端通过 [`05`] 通道）

## 完成标准

- ✅ 6 通道全跑通
- ✅ 节流 + 去重 + 降级 PBT
- ✅ 政府版仅站内 + 邮件
