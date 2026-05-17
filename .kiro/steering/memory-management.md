---
inclusion: always
---

# 记忆管理（Memory Management）

> Codex / Claude Code 是无状态的，每次会话独立。本规则告诉 AI 助手如何**外置记忆**，避免长任务失忆 + 跨任务遗忘。

## 1. 记忆五层架构

```
Layer 1：永久法则（每次会话强制读）
  AGENTS.md
  .kiro/steering/*.md
       ↓
Layer 2：项目蓝图（每次会话强制读）
  docs/architecture.md
  docs/business-model.md
  docs/glossary.md
       ↓
Layer 3：模块契约（按需读）
  .kiro/specs/{module}/requirements.md
  .kiro/specs/{module}/design.md
  .kiro/specs/{module}/tasks.md
       ↓
Layer 4：物理边界（写代码必 import）
  packages/types/
  packages/contracts/
  packages/permissions/
  packages/errors/
  packages/constants/
  prisma/schema.prisma
       ↓
Layer 5：决策与历史（按需查）
  docs/decisions/    (ADR)
  docs/changelog/    (变更日志)
  docs/known-issues.md
  apps/api/src/{module}/README.md  (模块自述)
```

## 2. 每次任务的记忆加载顺序（强制）

```
开始任务
   ↓
1. 读 AGENTS.md（5 分钟）
2. 读 .kiro/steering/ 下所有 .md（10 分钟）
3. 读 docs/architecture.md + business-model.md + glossary.md
4. 读当前任务的 .kiro/specs/{module}/{requirements,design,tasks}.md
5. 读 packages/types/ 中相关类型
6. 读相关 ADR（docs/decisions/）
7. 读现有相关代码（用 grep / fileSearch 定位）
   ↓
开始写代码
   ↓
完成任务
   ↓
1. 跑 lint + typecheck + test
2. 更新 .kiro/specs/{module}/tasks.md（勾选完成）
3. 写 ADR（如有重大决策）
4. 更新 docs/changelog/（重大变更）
5. 更新 apps/api/src/{module}/README.md（模块完成时）
6. 提交 git commit
```

## 3. 任务粒度（防失忆核心）

### 3.1 单次任务约束

| 项 | 约束 |
|---|---|
| 工作量 | ≤ 2 人天 |
| 修改文件数 | ≤ 5 |
| 修改行数 | ≤ 500 行 |
| 单文件大小 | ≤ 500 行 |

超出必须拆分。

### 3.2 任务粒度示例

❌ 不好（太大）：
```
任务：实现合同审查模块
```

✅ 好（拆开）：
```
任务 A1：在 prisma 添加 Contract / ContractReview / ContractRisk model
任务 A2：实现 ContractRepository
任务 A3：实现 ContractReviewService（不含 AI 调用）
任务 A4：在 AI Gateway 注册 CONTRACT_REVIEW_PRO 任务类型
任务 A5：实现 ContractReviewService.invokeAi（接 AI Gateway）
任务 B1：实现 POST /api/v1/contracts/review controller
任务 B2：实现 GET /api/v1/contracts/:id controller
任务 C1：前端创建合同上传页
任务 C2：前端创建合同详情页
...
```

## 4. ADR（Architecture Decision Record）

### 4.1 何时写 ADR

任何以下情况必须写 ADR：
- 引入新技术 / 库
- 修改架构 / 数据流
- 修改共享契约（types / errors）
- 修改安全策略
- 修改商业规则（定价 / 分润 / 保护期）
- 修改部署方式
- 暂时妥协方案 / TODO 大改

### 4.2 ADR 模板

文件名：`docs/decisions/{YYYY-MM-DD}-{kebab-topic}.md`

```markdown
# ADR-{编号}：{标题}

**日期**：YYYY-MM-DD
**决策人**：{xxx}
**状态**：proposed / accepted / superseded by ADR-X / deprecated

## 背景
- 为什么要做这个决策
- 现状是什么

## 决策
- 我们决定 XXX
- 为什么选这个方案

## 备选方案（可选）
- 方案 A：xxx，优点 / 缺点
- 方案 B：xxx，优点 / 缺点

## 影响
- 对代码的影响
- 对架构的影响
- 对部署 / 运营的影响

## 后续
- 是否需要 follow-up
- 是否阻塞其他工作
```

## 5. 模块自述（Module README）

每个完成的模块 `apps/api/src/modules/{module}/` 必须有 `README.md`：

```markdown
# {模块名}

## 职责
一句话说明本模块做什么

## 主要文件
- `xxx.controller.ts`：API 入口
- `xxx.service.ts`：业务逻辑
- `xxx.repository.ts`：数据访问
- `dto/`：DTO 定义
- `entities/`：实体

## 依赖
- 依赖模块：xxx, yyy
- 被依赖：aaa, bbb

## 关键逻辑
- 状态机：见 design.md
- 关键算法：xxx
- 边界条件：xxx

## API
- POST /xxx
- GET /xxx/:id

## 配置
- 需要环境变量：xxx
- 需要数据库表：xxx

## 已知问题
- TODO：xxx
- 待优化：xxx

## 相关 ADR
- ADR-001
- ADR-005
```

## 6. 任务勾选规范

每个 task 完成后立即更新 `.kiro/specs/{module}/tasks.md`：

```markdown
## Phase A：数据层

- [x] A1. 添加 Contract model
  - 文件：prisma/schema.prisma
  - 完成时间：2026-05-20
  - 提交：abc1234

- [x] A2. 实现 ContractRepository  
  - 文件：apps/api/src/modules/contract/contract.repository.ts
  - 完成时间：2026-05-21
  - 提交：def5678
  - 备注：查询自动过滤 deleted_at

- [-] A3. 实现 ContractService.createReview  ← 当前进行中

- [ ] A4. ...
```

勾选状态：
- `[ ]` 未开始
- `[~]` 已排队
- `[-]` 进行中
- `[x]` 已完成

## 7. 变更日志（Changelog）

**重大变更**必须记入 `docs/changelog/{YYYY-MM-DD}-{title}.md`：

```markdown
# 2026-05-20 实现合同审查模块

## 新增
- Contract / ContractReview / ContractRisk 数据模型
- POST /api/v1/contracts/review API
- 合同上传 + AI 审查全链路

## 修改
- packages/types：新增 ContractReviewDto

## 影响
- 数据库 migration：是
- API 契约更新：是
- 需要重启 worker：是

## 部署步骤
1. 跑 prisma migrate
2. 重启 api / worker
3. 重启前端
```

## 8. 已知问题清单

`docs/known-issues.md` 维护未解决问题：

```markdown
# 已知问题

## OPEN

### KI-001：长合同（>100 页）AI 审查超时
- 状态：调研中
- 影响：用户上传超长合同时报错
- 临时方案：限制上传 ≤ 100 页
- 计划：模型级联策略（先抽关键章节）

## RESOLVED

### KI-000：JWT refresh 过期未自动续期 ✅ 2026-05-15
- 修复 commit：abc123
```

## 9. 跨任务沟通

- 任务 A 留给任务 B 的"传话"必须写到 ADR / changelog / known-issues
- 不依赖会话记忆（即便看似下一个任务马上做）
- 任何"约定俗成"必须文字化

## 10. 每个 spec 三阶段产物

每个 `.kiro/specs/{module}/` 完成后必有：

```
{module}/
├── requirements.md      # 需求（必）
├── design.md            # 设计（必）
├── tasks.md             # 任务清单（必）
├── prompts.md           # AI Prompt 文档（如本模块涉及 AI）
└── README.md            # 模块概述（建议）
```

## 11. 失忆 / 错乱预防机制

### 11.1 共享类型先行
跨模块改动，**先改 packages/types**，commit 后再改业务代码。这样多个并行任务用的是同一个类型版本。

### 11.2 OpenAPI 先行
新加 API 必须先在 `packages/contracts/openapi.yaml` 声明，再写后端实现，最后前端从 OpenAPI 生成 client。

### 11.3 数据库先行
schema 改动必须先合并 prisma migration，其他依赖此 schema 的代码后合并。

### 11.4 spec 先行
代码实现严格按 spec，不得超出 spec 范围。
- 发现 spec 缺漏：先补 spec → 再写代码
- 发现 spec 错误：先改 spec + ADR → 再写代码
- 发现需要改架构：先 ADR → 再改 spec → 再写代码

## 12. 多 AI 助手协作（同时开多个 Codex 会话）

如果你同时开 2+ 会话并行做不同模块：

- 每个会话只动**自己模块的目录**
- 修改共享文件（types / contracts / schema）必须在主会话集中改
- 每个会话开始前 `git pull` 拉最新
- 完成后立即 commit + push 避免冲突
- 跨模块依赖：通过 spec / ADR 沟通，不通过会话内对话

## 13. 失误恢复

### 13.1 写错了
```
git diff             # 看改了什么
git checkout -- .   # 撤销未提交
```

### 13.2 commit 了但还没 push
```
git reset --soft HEAD~1   # 撤销 commit 保留改动
```

### 13.3 push 了但有问题
```
git revert <commit>       # 反向 commit
```

**禁止**：`git reset --hard` 已 push 的提交、`git push -f` 共享分支。

## 14. 强制自检（每次任务结束前）

```
□ 是否更新了 .kiro/specs/{module}/tasks.md？
□ 是否写了 ADR（如有重大决策）？
□ 是否写了 changelog（如有重大变更）？
□ 是否更新了模块 README？
□ 是否跑了 lint + typecheck + test？
□ 是否更新了相关 OpenAPI / Prisma schema？
□ 是否清理了 console.log / TODO / @ts-ignore？
□ commit message 是否符合 Conventional Commits？
```

少一项不算完成。
