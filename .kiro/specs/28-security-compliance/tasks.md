# 28 合规与安全 - Tasks

## 任务总数：10

- [x] **A1** Prisma：AuditLog（含分区）/ DeviceFingerprint / FraudSignal / BlacklistEntry / BackupRun / EmergencyIncident / ComplianceSelfCheck + migration
- [x] **A2** 实现 `audit/audit.service.ts` + `audit-partition.worker.ts`（月度分区 + 6 年归档 OSS）
- [x] **A3** 实现 `anti-fraud/` 6 个 detector（注册 / 评分 / 报价 / 退款 / 邀请 / 设备指纹）+ `blacklist.service.ts`
- [x] **A4** 实现 `anti-fraud/risk-dashboard.service.ts`（[`24`] 风控仪表盘消费）
- [x] **A5** 实现 `data-export/`（[`06`] BR-104 协作 + 异步导出 OSS）
- [x] **A6** 实现 `backup/backup-monitor.service.ts`（监控备份成功）+ `restore-drill.service.ts`（季度演练）
- [x] **A7** 实现 `emergency/`（4 类紧急停服 + 熔断器 + 用户广播）
- [x] **A8** 实现 `compliance-self-check/`（季度自查 cron + 清单）
- [x] **A9** 横向总审：检查 4 道防线 + 出境脱敏 + Prompt 红线 + 审计完整 + 备份成功率
- [x] **A10** 上线前合规自查清单（创始人 + 法务） + e2e 4 道防线 + 紧急停服演练

## 完成标准

- ✅ 全部模块的越权 / 防薅 / 出境 测试通过
- ✅ 备份恢复演练通过
- ✅ 紧急停服可在 60 秒内生效
- ✅ ICP / 5 项法律文件就绪
- ✅ 创始人准备清单 P0 完成


---

## V4 升级新增任务（5 项合规扩展）

- [x] **28-V4-1** AgentConsent 5 项合规承诺集成（与 22-V4-6 对接）
- [x] **28-V4-2** AIDataSource 11 大权威源注册 + 季度自查 worker
- [x] **28-V4-3** unauthorized-block 阻止爬非法源
- [x] **28-V4-4** 政企公文水印（与 23-V4-9 对接，PDF 内层嵌入式）
- [x] **28-V4-5** AI 输出强制 4 要素自动校验（与 10-V4-8 对接 + 04 spec output-validator）
- [x] **28-V4-6** 项目寻源数据流：双向脱敏 + 强制国产模型 + 6 年留存
- [x] **28-V4-7** 数据源合规审计 e2e
