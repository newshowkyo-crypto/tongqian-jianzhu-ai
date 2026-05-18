# 26 上瘾系统 - Tasks

## 任务总数：8

- [x] **A1** Prisma：UserCheckin / LotteryEvent / LotteryDraw / BuildingLevel / MonthlyGrowthReport / UrgencyPushLog + migration
- [x] **A2** 实现 `checkin/`（连续 7/14/30/90 天 + 断签 PBT）
- [x] **A3** 实现 `lottery/`（周二 / 周五 + 转盘 + 奖品池 PBT）
- [x] **A4** 实现 `building-level/`（5 级 exp 累加 + 解锁特权）
- [x] **A5** 实现 `monthly-growth-report/`（cron 月初 + AI 生成 H5）
- [x] **A6** 实现 `urgency-push/`（节流 PBT 上限 3 / 日 + 优先级合并）+ 与 [`27`] 联动
- [x] **A7** 实现 `share-unlock/` + `boss-assistant-maturity/` + `content-matrix/`（公众号文章 seed）
- [x] **A8** 前端动效（[`packages/ui`] AnimatedNumber + 签到金币 + 转盘 + 等级升级）+ e2e

## 完成标准

- ✅ 9 大上瘾机制全部上线
- ✅ 紧迫感节流 PBT
- ✅ 抽点仅周二 / 周五
- ✅ 月度成长报告 cron 通过
- ✅ 政府版（apps/gov）禁用上瘾机制


---

## V4 升级新增任务（钩子重审 + 清算 + 政企不游戏化）

- [x] **26-V4-1** AddictionHook + HookTriggerLog 模型 + migration + 16 个钩子 seed
- [x] **26-V4-2** 16 个钩子分组实现（A/B/C/D/E/F 6 组）
- [x] **26-V4-3** 一期 9 个钩子优先实现（12.1/12.4/12.5/12.6/12.7/12.9/12.12/12.13/S1）
- [x] **26-V4-4** output-validator.service.ts 输出价值标杆校验（每个钩子单独红线）
- [x] **26-V4-5** 早安 AI 简报：50 点 / 天 + 月度按档限免 + 5 条干货红线
- [x] **26-V4-6** 决策小测：每天 1 题免 + 第 2 题 50 点 + 4 选项有迷惑性 + AI 详解 4 要素
- [x] **26-V4-7** 灵感卡：4 条件触发 + 默认每天 1 张 + 可关闭
- [x] **26-V4-8** 同行情报：上限 ≤ 3 / 天 + 真实数据校验
- [x] **26-V4-9** AI 周报：本租户真数据 + 5 KPI / 3 待办 / 2 建议 / 环比
- [x] **26-V4-10** 公文代写：符合党政 / 商务格式 + 完整要素
- [x] **26-V4-11** reward-clearing 三层清算（点数 90 天 / 实物 / 现金 ≥¥800 对公 + 20% 代扣）
- [x] **26-V4-12** 政企不游戏化 enforce（hook-eligibility.service.ts）
- [x] **26-V4-13** e2e：所有一期钩子完整推送 + 输出红线校验通过


---

## V4 IMPROVEMENTS 新增任务（Onboarding 用户旅程，漏洞 2）

- [x] **26-IMP-1** OnboardingProgress 模型 + migration
- [x] **26-IMP-2** D1 欢迎触达（短信 + 站内 + 5 步清单）
- [x] **26-IMP-3** 5 步激活完成检测 + 100 点奖励
- [x] **26-IMP-4** D3-D7 AI 助理主动对话（24h 未对话触发）
- [x] **26-IMP-5** D7-D30 功能引导推送（4 条）
- [x] **26-IMP-6** D30 首份"月度经营成长报告"自动生成
- [x] **26-IMP-7** Onboarding 失败兜底（CSM 介入）
- [x] **26-IMP-8** 政企版 Onboarding 简化版（3 触点）
- [x] **26-IMP-9** e2e：完整客户旅程触达
