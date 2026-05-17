---
inclusion: manual
---

# Codex 任务执行模板

> 这是给 Codex / Claude Code 单次任务执行的标准模板。每个任务的描述都按这个格式给。

## 模板结构

```markdown
# 任务：{编号} {简短描述}

## 0. 必读文档（按顺序加载）
- AGENTS.md
- .kiro/steering/coding-standards.md
- .kiro/steering/security-rules.md
- .kiro/steering/api-conventions.md
- .kiro/steering/database-conventions.md
- .kiro/steering/ai-gateway-rules.md
- .kiro/steering/frontend-rules.md
- .kiro/steering/ui-ux-rules.md
- .kiro/steering/prompt-engineering.md
- .kiro/steering/testing-rules.md
- .kiro/steering/memory-management.md
- docs/architecture.md
- docs/glossary.md
- docs/business-model.md
- .kiro/specs/{module}/requirements.md
- .kiro/specs/{module}/design.md
- .kiro/specs/{module}/tasks.md（重点看本任务对应的条目）
- packages/types/{relevant}.ts
- 相关 ADR：docs/decisions/
- 相关现有代码：用 grep / fileSearch 找

## 1. 任务描述
{用一段话说清楚要做什么 + 为什么}

## 2. 输入
- 业务规则：{从 spec 引用}
- 数据模型：{从 prisma schema 引用}
- 接口契约：{从 openapi.yaml 引用}
- UI 设计：{从 design.md 引用}

## 3. 期望输出
- 文件 1：路径 + 简述
- 文件 2：路径 + 简述
- ...

## 4. 验收标准
- [ ] 编译通过（pnpm typecheck）
- [ ] lint 通过（pnpm lint）
- [ ] 测试通过（pnpm test）
- [ ] 测试覆盖率 ≥ 70%
- [ ] {业务验收点 1}
- [ ] {业务验收点 2}
- [ ] OpenAPI 已更新（如涉及 API）
- [ ] tasks.md 已勾选

## 5. 边界 / 约束
- 不要做的事：xxx
- 必须遵守：xxx

## 6. 完成后操作
1. 更新 .kiro/specs/{module}/tasks.md
2. 跑测试
3. git commit -m "feat({module}): {简述}"
4. 写 ADR / changelog（如有重大变更）
```

## 实例：合同审查模块的一个任务

```markdown
# 任务：B2 实现合同审查 service.invokeAi 方法

## 0. 必读文档
- AGENTS.md
- .kiro/steering/ai-gateway-rules.md（重点）
- .kiro/steering/prompt-engineering.md（重点）
- .kiro/specs/risk-review/requirements.md（合同审查需求）
- .kiro/specs/risk-review/design.md §6（AI 调用设计）
- .kiro/specs/risk-review/prompts.md（Prompt 模板设计）
- packages/types/contract.ts
- packages/types/ai-task.ts
- apps/api/src/ai-gateway/README.md（Gateway 用法）

## 1. 任务描述
为合同审查模块接入 AI Gateway。
当用户上传一份合同后，service 调用 Gateway 触发 CONTRACT_REVIEW_PRO 任务，
拿到结构化的风险报告并保存。

## 2. 输入

### 2.1 业务规则（spec §3 §6）
- 文件 ≤ 50MB
- 用户余额 ≥ 1500 点
- 长合同（>50 页）启用模型级联（先 Qwen-Max 抽关键章节，再 Claude 分析）
- 输出按 ContractReviewOutputSchema 强校验

### 2.2 数据模型
- ContractReview（已有，见 prisma schema）
- 字段：id, contract_id, status, risks (jsonb), summary (jsonb), ai_cost, ai_model, ...

### 2.3 接口契约（已在 openapi.yaml 声明）
- POST /api/v1/contracts/:id/review
- Response: { taskId, status }（异步任务）

## 3. 期望输出
- apps/api/src/prompts/contract/review-pro.ts （Prompt 模板）
- apps/api/src/modules/contract/contract.service.ts （新增 invokeAiReview 方法）
- apps/api/src/modules/contract/contract.service.spec.ts （单测）
- apps/api/src/prompts/contract/review-pro.spec.ts （Prompt 测试）

## 4. 验收标准
- [ ] pnpm typecheck 通过
- [ ] pnpm lint 通过
- [ ] pnpm test 通过
- [ ] 覆盖率 ≥ 70%
- [ ] 调用 AI Gateway 用 CONTRACT_REVIEW_PRO 任务类型
- [ ] 失败自动退点
- [ ] 长合同（>50 页）走模型级联
- [ ] 输出严格按 ContractReviewOutputSchema 校验
- [ ] 结果保存到 ContractReview 表
- [ ] 调用前后写审计日志
- [ ] tasks.md 已勾选 B2

## 5. 边界 / 约束
- 不要直接 import OpenAI / Anthropic SDK，必须经 Gateway
- 不要在 service 写 Prompt 字符串，必须导入 Prompt 模板
- 不要把合同原文直接发海外模型，Gateway 会做 sanitize（不需要重复实现）
- 不要在事务内调 AI（事务超时风险）

## 6. 完成后
1. 更新 .kiro/specs/risk-review/tasks.md：勾选 B2
2. 跑 pnpm test 验证
3. git commit -m "feat(contract): implement ai review invocation"
4. 不需要写 ADR（按既定 spec 实现，无新决策）
```

## Codex 收到任务后的工作流

1. **读完所有必读文档**（不能跳）
2. **理解输入 → 输出 → 验收**
3. **写代码** → 严格按 steering 规则
4. **测试** → 写单测 + 跑测试
5. **自检** → 按"完成自检"清单逐项核对
6. **提交** → 按 commit 规范

## 任务执行检查表（Codex 自查）

每个任务结束前自查：

```
□ 必读文档全部加载
□ 代码符合 coding-standards
□ 数据库改动符合 database-conventions  
□ API 契约符合 api-conventions
□ AI 调用符合 ai-gateway-rules
□ 前端代码符合 frontend-rules + ui-ux-rules
□ Prompt 模板符合 prompt-engineering
□ 测试符合 testing-rules
□ 安全符合 security-rules
□ git 符合 git-workflow
□ tasks.md 已勾选
□ 必要文档已更新
□ 测试全部通过
□ commit 信息规范
```

任意一项不达标，**回去补**，不交付。
