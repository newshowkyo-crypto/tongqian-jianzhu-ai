# 23 政府 / 央国企 - Tasks

## 任务总数：9

- [ ] **A1** Prisma：GovProjectSourcing / GovProjectIntent / SecureChatMessage / GovDocumentDraft / GovConsultIntent / GovAuditLog + migration
- [ ] **A2** 实现 `compliance/domestic-only.guard.ts`（强制国产 PBT）+ `field-mask.service.ts`
- [ ] **A3** 实现 `compliance/gov-audit.service.ts`（独立审计 6 年留存）
- [ ] **A4** 实现 `policy-learning/`（限政府用户访问 [`20`] 政策库 + 影响 AI 解读）
- [ ] **A5** 实现 `document-drafting/` + 5 类公文 PromptTemplate（强制国产）
- [ ] **A6** 实现 `project-sourcing/`（双边发布 + 脱敏聊天 + 见证 hash）
- [ ] **A7** 实现 `consult-entry/`（≥ ¥15w 自动转 [`22`] premium-shelf）
- [ ] **A8** apps/gov 独立前端（4 模块入口 + 庄重视觉）
- [ ] **A9** API + e2e（含 PBT：政府用户 AI 任务必走国产）

## 完成标准

- ✅ apps/gov 与 apps/web 物理隔离
- ✅ 政府用户 AI 强制国产
- ✅ 项目寻源揭示前不泄漏联系方式
- ✅ 独立审计 6 年留存


---

## V4 升级新增任务（P2 / P4 / P8 补丁）

- [ ] **23-V4-1** PolicyFund / PolicyFundUserFollow / PolicyFundApplication 模型 + migration
- [ ] **23-V4-2** policy-fund-crawler.worker.ts（Layer 1 每日 6/12/18 三次）
- [ ] **23-V4-3** policy-fund-extractor.service.ts（Layer 2 AI 抽取入待审池）
- [ ] **23-V4-4** manual-trigger.service.ts（Layer 3 admin 红色"立即扫描"按钮）
- [ ] **23-V4-5** expert-review.service.ts（Layer 4 专家审 + 5/25/50/100% 灰度）
- [ ] **23-V4-6** 30+ 资金 seed 数据（11 国家 + 9 部委 + 8 省级 + 4 行业 + 4 政策性银行）
- [ ] **23-V4-7** fund-list / fund-match / fund-evaluation / fund-template 4 大公开 API
- [ ] **23-V4-8** window-notifier.worker.ts（30/14/7/1 天节点提醒）
- [ ] **23-V4-9** 一案两书：implementation-plan / financial-eval / legal-eval / package-builder（强制国产模型 + 水印）
- [ ] **23-V4-10** 项目寻源双向脱敏 + 国产模型强制（P8 补丁）
- [ ] **23-V4-11** 政企版 5 引导按钮（自己执行 / 同乾方略 / 专家咨询）
- [ ] **23-V4-12** 政企版禁游戏化校验（注册时 enforce）
- [ ] **23-V4-13** e2e：30+ 资金 + 资金匹配 + 一案两书 + 项目寻源
