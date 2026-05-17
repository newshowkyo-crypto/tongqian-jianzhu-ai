# 24 平台后台 - Tasks

## 任务总数：14

## Phase A：核心配置层（3 个）

- [ ] **A1** 完整化 `system-config/system-config.service.ts`（接续 [`02`] G1）+ `config-history.service.ts` + `cache-invalidator.service.ts`（Redis pub/sub）
- [ ] **A2** 实现配置审批锁（高敏感 key 必须经 [`06`] 审批 + 2FA）+ 审计
- [ ] **A3** Prisma：SystemConfig / SystemConfigHistory / RedLineAlert / MonthlyReview / PromptABTest + migration

## Phase B：业务运营（3 个）

- [ ] **B1** 实现 `business-ops/red-line-monitor.service.ts`（cron 5min + 6 条红线 + 告警）
- [ ] **B2** 实现 `business-ops/kpi-dashboard.service.ts`（订阅 / 退款 / AI 延迟 / 单点成本）
- [ ] **B3** 实现 `monthly-review/monthly-review.worker.ts`（每月 1 号自动生成，BR-902）

## Phase C：7 大可视化模块后端（4 个）

- [ ] **C1** 数据源管理（[`20`] 抓取监控 + 手动触发）+ 规则审核（[`20`] / [`21`]）
- [ ] **C2** Prompt 管理 + A/B 测试 + 满意度对比
- [ ] **C3** 模型路由（覆盖 [`04`]）+ 报告模板（[`10`]）+ 审批流配置（[`06`]）
- [ ] **C4** 智能管家管理 + 客户管理 + 申诉处理工作台

## Phase D：审批 + 财务（2 个）

- [ ] **D1** 审批工作台（退款 / 提现 / 用印 / 数据导出 / 申诉 / 平台用户创建）
- [ ] **D2** 财务对账（[`09`] 流水 + 月度分润报表 + 批量打款）

## Phase E：前端 + e2e（2 个）

- [ ] **E1** apps/admin 前端：业务运营首页 + 7 大模块 + 智能管家 / 客户 / 财务 / 审计 / system-config 编辑器
- [ ] **E2** e2e：红线触发 + 告警 + 月报生成 + 配置改动审批

## 完成标准

- ✅ 7 大模块全部可视化操作（OPC 模式不改代码）
- ✅ 6 条红线实时监控 + 月报自动生成
- ✅ system_configs 改动覆盖业务行为（如改派单权重 60s 内生效）
- ✅ 高敏感配置走审批 + 2FA


---

## V4 升级新增任务（P1 / P6 / P7 补丁）

- [ ] **24-V4-1** FeatureFlag + FeatureFlagAuditLog 模型 + migration + flag-evaluator service
- [ ] **24-V4-2** PlatformAnnouncement 模型 + 模板库 20+ 类 + 多通道分发
- [ ] **24-V4-3** 数据库管理（备份历史 / 一键恢复 / 6 年滚动清理）
- [ ] **24-V4-4** 系统日志可视化（错误 / 慢 / 安全 / traceId 全链路）
- [ ] **24-V4-5** 性能仪表盘（QPS / 延迟 / 错误率 / AI 成本曲线 / provider 健康）
- [ ] **24-V4-6** AgentReviewQueue 模型 + 智能管家审核工作台（24-72h 队列）
- [ ] **24-V4-7** 案例市场审核工作台（连接 22-spec AgentCaseStudy）
- [ ] **24-V4-8** 政策资金管理工作台（连接 23-spec PolicyFund 4 层流水线）
- [ ] **24-V4-9** AddictionConfig + RewardClaim 模型 + 上瘾机制后台（16 钩子开关 + 阈值）
- [ ] **24-V4-10** 奖励清算服务（点数实时 / 实物物流 / 现金 ≥¥800 对公 + 20% 代扣）
- [ ] **24-V4-11** e2e：Feature Flag 灰度回滚 + 智能管家审核 + 案例审核 + 政策资金更新


---

## V4 IMPROVEMENTS 新增任务

- [ ] **24-IMP-1** PARTNER 管理工作台（subtype 筛选 + 列表 + 详情）
- [ ] **24-IMP-2** PARTNER 反作弊告警仪表盘（一年限额 / 同手机 / 异常推荐）
- [ ] **24-IMP-3** PARTNER 分润审批 + 批量打款（与接单类合并审批流）
- [ ] **24-IMP-4** PARTNER UI 与接单类区分 tab


- [ ] **24-IMP-5** BR-903 4 条运营成本红线仪表盘
- [ ] **24-IMP-6** 月赠送点池 ≥ ¥30,000 自动暂停早安简报
- [ ] **24-IMP-7** 月度自检报告新增 BR-903 段
