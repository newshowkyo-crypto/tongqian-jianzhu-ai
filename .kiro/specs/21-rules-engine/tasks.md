# 21 规则引擎 + 参考价库 - Tasks

## 任务总数：8

- [x] **A1** Prisma：QualificationRule / ContractRule / TenderRule / ReferencePrice / RuleVersion + migration
- [x] **A2** 实现 `qualification-rules/` + 50 条起步规则 seed（专家提供）
- [x] **A3** 实现 `contract-rules/` + 50+ 条规则 seed（6 大风险类型覆盖）
- [x] **A4** 实现 `tender-rules/` + 起步规则 seed（房建 / 市政 / 公路）
- [x] **A5** 实现 `reference-prices/`（含 PBT 标色 4 档）+ 起步参考价 seed
- [x] **A6** 实现 `extractor/rule-extractor.service.ts`（从 [`20`] 抽取规则候选）
- [x] **A7** 实现 `review/rule-review.service.ts`（专家审核 + 版本化）
- [x] **A8** API + e2e（被 [`13`] / [`14`] / [`22`] 调通）

## 完成标准

- ✅ 4 类规则可被业务调用
- ✅ 报价标色 PBT 通过
- ✅ 版本回滚可用
