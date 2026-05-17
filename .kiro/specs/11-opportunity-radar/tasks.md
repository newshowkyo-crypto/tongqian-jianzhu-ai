# 11 经营机会雷达 - Tasks

## 任务总数：9

- [ ] **A1** Prisma：Opportunity / OpportunityPreference / OpportunityMatch / InvestabilityReport / OwnerVerifyResult + migration
- [ ] **A2** 实现 `radar/matcher.service.ts`（偏好 ↔ 机会匹配）+ `radar/push.worker.ts`（cron 08:00，PBT：上限 5 条）
- [ ] **A3** 实现 `prompts/investability.ts` PromptTemplate + 注册到 [`04-ai-gateway`]
- [ ] **A4** 实现 `investability/investability.service.ts`（调 ai-gateway + 写报告 [`10`]）
- [ ] **A5** 实现 `owner-verify/`（数据获取 from [`20`] + 缓存 30 天）
- [ ] **A6** 实现 `owner-profile/` + `peer-radar/`（数据来自 [`20`]，AI 总结）
- [ ] **A7** 实现 `pricing/recommended-price.service.ts`（参考价库 from [`21`] + 同行中标价）
- [ ] **A8** API + OpenAPI + 前端机会雷达页（apps/web）+ 偏好设置页
- [ ] **A9** e2e：偏好设置 → 推送 → 可投性评分 → 报告 → 业主核验

## 完成标准

- ✅ 每日推送上限严格执行（PBT）
- ✅ Tier 1/2/3 报告各 1 个 e2e 场景
- ✅ 业主核验缓存生效


---

## V4 升级新增任务（杀手锏 A 精细化）

- [ ] **11-V4-1** opportunity-pusher.worker.ts 每天 8:00 推送 5 个机会
- [ ] **11-V4-2** matcher 4 维匹配（地区 / 业务线 / 金额 / 偏好）
- [ ] **11-V4-3** card-renderer + 4 维雷达图（资金/资质/关系/业绩）
- [ ] **11-V4-4** investability/score-calculator + Tier 分级
- [ ] **11-V4-5** reality-check 业主真假性（信用中国 + gsxt + 裁判文书网 RAG）
- [ ] **11-V4-6** peer-radar + 推荐报价区间
- [ ] **11-V4-7** tender-blind-box 招标盲盒
- [ ] **11-V4-8** follow-tracker 收藏 + 招标变更 / 截止前 3/1 天提醒
- [ ] **11-V4-9** 5 档订阅功能墙 enforcement
- [ ] **11-V4-10** e2e：机会推送 + 投性评分 + 业主核验 + 同行雷达
