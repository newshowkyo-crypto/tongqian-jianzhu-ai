# 13 风险审查 - Tasks

## 任务总数：8

- [x] **A1** Prisma：ContractReview / ContractRiskFinding / ModificationLetter / ClaimStrategy + migration
- [x] **A2** PromptTemplate：contract.review.basic / contract.review.pro + 注册
- [x] **A3** 实现 `contract-review/basic.service.ts` + `pro.service.ts`（异步 → [`10`] 报告）
- [x] **A4** 实现 `tender-review/tender-risk.service.ts`
- [x] **A5** 实现 `modification-letter/`（letter.service + prompts）
- [x] **A6** 实现 `claim-strategy/`（涉诉强制 T4 PBT）
- [x] **A7** 实现 `rules-bridge/`（调 [`21-rules-engine`] 取合同风险规则）
- [x] **A8** API + 前端（apps/web）合同上传 / 报告查看 / 修改函下载 / 索赔策略 + e2e

## 完成标准

- ✅ 基础版 ≤ 30s 返回老板版 H5
- ✅ 专业版 ≤ 5min 返回详细 PDF + 修改函
- ✅ 涉诉自动 T4
- ✅ 6 大风险类型识别准确率（用 fixture 验证）


---

## V4 升级新增任务（杀手锏 C 精细化）

- [x] **13-V4-1** thirty-second-review（30 秒老板版 < 1000w 300 / 1000-5000w 500）
- [x] **13-V4-2** h5-card-renderer + color-coded-finding（红黄绿 5 关键发现）
- [x] **13-V4-3** five-min-pdf（5 分钟详细版 1500 点）
- [x] **13-V4-4** modification-letter（修改意见函可直接发对方）
- [x] **13-V4-5** tender-risk-review（招标文件 800 点）
- [x] **13-V4-6** claim-strategy（T2 起 1000 点）
- [x] **13-V4-7** legal-workbench + batch-review + monthly-review + consult-chat
- [x] **13-V4-8** 6-risk-types 识别引擎
- [x] **13-V4-9** gov-enforcement（政企强制国产 + 水印 + 涉诉强制人工）
- [x] **13-V4-10** 5 引导按钮按角色裁剪（与 10 spec 协同）
- [x] **13-V4-11** 5 档订阅功能墙
- [x] **13-V4-12** e2e：基础 + 专业 + 政企 + 法务批量
