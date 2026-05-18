# 20 知识系统 - Tasks

## 任务总数：10

- [x] **A1** Prisma：Policy / Performance / ContractClause / TenderStructure / CrawlJob + migration
- [x] **A2** 实现 `policies/` CRUD + 政策订阅 + 推送
- [x] **A3** 实现 `performances/` / `contract-clauses/` / `tender-structures/` services
- [x] **A4** 实现 `crawler/` 3 个 worker（政策 / 招标 / 业绩）+ 失败重试 + 告警
- [x] **A5** 实现 `extractor/extractor.service.ts`（AI 抽取 → pending_review）
- [x] **A6** 实现 `retrieval/embedding.service.ts`（DashVector 写入）+ `retrieval.service.ts`（RAG 查询）
- [x] **A7** 实现 `review/review.service.ts`（专家审核后端，前端在 [`24`]）
- [x] **A8** 起步内容 seed：50 条政策 + 50 条合同条款 + 20 条招标模板（创始人提供原文）
- [x] **A9** API + OpenAPI + 政策列表前端 + 政策推送
- [x] **A10** e2e：抓取 → 抽取 → 审核 → 发布 → RAG 调用

## 完成标准

- ✅ 4 大数据库可被业务模块查询
- ✅ 抓取 → 审核 → 发布闭环
- ✅ RAG 召回 ≤ top_k
- ✅ 专家审核台被 [`24`] 调用
