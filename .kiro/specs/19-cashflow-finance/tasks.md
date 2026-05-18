# 19 现金流 / 融资 - Tasks

## 任务总数：8

- [x] **A1** Prisma：Receivable / AgingAnalysis / CashflowForecast / FinancingDiagnosis + migration
- [x] **A2** 实现 `receivables/`（Excel 导入 + 账龄分桶 PBT）
- [x] **A3** PromptTemplate aging-analysis + 注册 + 报告
- [x] **A4** 实现 `cashflow-forecast/`
- [x] **A5** 实现 `financing-diagnosis/`（含 ABS/REITs/化债 强制 T3 PBT）
- [x] **A6** 实现 `dispatch-trigger/`（≥ ¥500w 推保理智能管家；≥ ¥5000w 推同乾方略）
- [x] **A7** 实现 `alert/cashflow-alert.worker.ts`
- [x] **A8** API + 前端（apps/web）应收看板 / 融资诊断 + e2e

## 完成标准

- ✅ 账龄 5 桶分析准确
- ✅ Tier 解析按金额准确
- ✅ ABS/REITs 强制 T3
- ✅ 派单按金额走 A / B
