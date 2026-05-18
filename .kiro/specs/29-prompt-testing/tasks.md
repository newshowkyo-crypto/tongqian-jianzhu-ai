# 29 Prompt 黄金测试集 - Tasks

## 任务总数：8

- [x] **29-A1** PromptGoldenTestRun + EmbeddingCache 模型 + migration
- [x] **29-A2** golden-test-runner.service.ts 测试执行引擎
- [x] **29-A3** similarity-calculator.service.ts 余弦相似度计算
- [x] **29-A4** embedding-cache.service.ts 24h TTL 缓存
- [x] **29-A5** test-report-renderer.service.ts diff 报告
- [x] **29-A6** ci-integration.service.ts PR comment + 阻止合并
- [x] **29-A7** CLI: pnpm test:prompts [prompt-name]
- [x] **29-A8** seed 5 个核心 Prompt 测试集骨架（专家后期填案例）：
  - contract-review-pro/_meta.json
  - tender-framework-pro/_meta.json
  - qualification-upgrade-pro/_meta.json
  - policy-fund-match/_meta.json
  - morning-briefing/_meta.json

## 后续（专家配合）

- [ ] **29-B1** 专家打 5 核心 Prompt × 10 案例 = 50 案例（M5-M8）
- [ ] **29-B2** 专家打剩 25 Prompt × 10 案例 = 250 案例（M9-M12）
- [ ] **29-B3** 上线后每月 +5-10 案例（持续）
