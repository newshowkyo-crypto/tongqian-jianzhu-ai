# 12 标书工厂 - Tasks

## 任务总数：10

- [x] **A1** Prisma：TenderProject / TenderSummary / TenderEligibility / TenderFramework / TenderSectionDraft / TenderPackage / TenderScorePrediction + migration
- [x] **A2** 实现 `upload/tender-upload.service.ts`（≤ 50MB + magic / 病毒扫描可选 + OSS）
- [x] **A3** 实现 `summary/` + Prompt 注册（招标速读）
- [x] **A4** 实现 `eligibility/` + Prompt + 与 [`14`] 对接
- [x] **A5** 实现 `framework/` + 房建 / 市政 / 公路 模板（seed）
- [x] **A6** 实现 `section/section-writer.service.ts` + 10 个起步章节 Prompt
- [x] **A7** 实现 `packaging/document-packager.service.ts`（PDF 合并 from [`14`]）
- [x] **A8** 实现 `scoring/score-predictor.service.ts`
- [x] **A9** 实现 `dispatch-trigger/`（自动调 [`22`] 触发 A 类标书代写）
- [x] **A10** API + 前端（apps/web）标书工作台 + e2e

## 完成标准

- ✅ 上传招标文件 5 分钟内速读 + 资格自查 + 框架
- ✅ 章节续写按 key 单独扣点
- ✅ ≥ ¥1000 万项目自动派单


---

## V4 升级新增任务（杀手锏 B 精细化）

- [x] **12-V4-1** tender-reading.service.ts（< 50 页 800 点）
- [x] **12-V4-2** tender-reading-cascade（≥ 50 页 模型级联 1500 点）
- [x] **12-V4-3** eligibility-check + 缺失补救建议
- [x] **12-V4-4** framework-generator（双框架）
- [x] **12-V4-5** chapter-writer（按章节扣点 300-800）
- [x] **12-V4-6** tender-staff-workbench + daily-quiz（每日真题）
- [x] **12-V4-7** resource-pack（资料打包按招标顺序）
- [x] **12-V4-8** score-prediction（评分预判 500 点）
- [x] **12-V4-9** ai-quote-tool（智能管家 AI 报价工具 50 点）
- [x] **12-V4-10** co-brand-report（¥499+ 联合品牌）
- [x] **12-V4-11** tender-dispatch（≥ 1000w A 类派单 / ≥ 5000w B 类同乾方略）
- [x] **12-V4-12** 5 档订阅功能墙
- [x] **12-V4-13** e2e：速读 + 资格 + 框架 + 续写 + 派单触发
