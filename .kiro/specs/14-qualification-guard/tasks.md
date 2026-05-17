# 14 资质智能管家 - Tasks

## 任务总数：10

- [ ] **A1** Prisma：QualificationCert / SafetyLicense / KeyPersonnel / PerformanceRecord / QualificationCheckup / UpgradePathReport + migration
- [ ] **A2** 实现 `archive/ocr.service.ts`（调阿里云 OCR）+ `archive.service.ts`（CRUD）
- [ ] **A3** PromptTemplate：checkup / upgrade-path / dynamic-review + 注册
- [ ] **A4** 实现 `checkup/checkup.service.ts`（健康度评分 + 报告 [`10`]）
- [ ] **A5** 实现 `upgrade-path/`（按 from+to Tier 解析）
- [ ] **A6** 实现 `performance/performance.service.ts` + `matcher.service.ts`（业绩 ↔ 资质）
- [ ] **A7** 实现 `personnel/personnel.service.ts`（含挂证识别 + 警告）
- [ ] **A8** 实现 `expiry-monitor/expiry-monitor.worker.ts`（cron + 90/60/30/7 天 + 上限 3/日 PBT）
- [ ] **A9** 实现 `dispatch-trigger/`（金额阈值 < ¥10w → A 类；≥ ¥10w → B 类）
- [ ] **A10** API + 前端（apps/web）资质中心 / 业绩库 / 体检报告 + e2e

## 完成标准

- ✅ OCR 抽取证书关键字段
- ✅ 体检 / 升级路径分 Tier 输出
- ✅ 到期推送上限 PBT 通过
- ✅ 资质代办派单按金额走 A / B


---

## V4 升级新增任务（智能管家延伸 + 挂证规避）

- [ ] **14-V4-1** classify-need.service.ts A/B 类需求分类
- [ ] **14-V4-2** route-to-agent / route-to-tongqian 流量分配
- [ ] **14-V4-3** 智能管家专属工具 5 件套（client-archive / upgrade-planner / personnel-pool / performance-matcher / earnings-aggregator）
- [ ] **14-V4-4** PersonnelComplianceCheck 模型 + personnel-checker.worker.ts 自动核验四库一平台
- [ ] **14-V4-5** alert-render.service.ts 异常预警 + blacklist-share.service.ts 跨域共享
- [ ] **14-V4-6** QualificationServiceOrder 模型 + 接单要求 ≥ 200 字 / 失败赔付 / 里程碑 30%/30%/40%
- [ ] **14-V4-7** 30 天客户验收期 + 解冻流程
- [ ] **14-V4-8** SHALL NOT 校验（无挂证撮合 / 假社保渠道）
- [ ] **14-V4-9** e2e：A 类派单 + B 类同乾方略 + 挂证检测 + 合规约束
