# 29 Prompt 黄金测试集 - Requirements

## Introduction

> **V4 IMPROVEMENTS 新增子 spec**：横向 QA 模块。所有 30+ AI Prompt 必须通过专家打标的黄金测试集才能上线。
>
> 与 PBT（结构正确性）并存：PBT 测 schema / 4 要素 / 红线话术；黄金测试集测**输出价值与专家答案的语义相似度**。
>
> 详见 [ADR-AUTO-2026-05-16-IMPROVEMENTS](../../../docs/decisions/2026-05-16-adr-auto-improvements-package.md) 决策 4。

**前置依赖**：[`04-ai-gateway`]（output-validator + provider-router）/ [`02-shared-contracts`]（types）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| 黄金测试集 | 由你团队咨询专家打标的真实场景案例集 |
| 语义相似度 | sentence-embedding 余弦相似度（≥ 0.7 视为通过）|
| 专家答案 | 专家亲自给的标杆输出（结构化 JSON）|
| min_passing_similarity | 每个测试集独立配置的通过阈值 |

---

## Requirements

### Requirement 1：测试集结构

#### Acceptance Criteria

1. 测试集目录：`.kiro/golden-test-sets/{prompt-name}/`
2. 每个 prompt ≥ 10 个真实场景案例
3. 每个案例 JSON 格式：
   ```json
   {
     "id": "contract-review-pro-001",
     "input": { /* 真实合同 / 招标 / 资质场景，已脱敏 */ },
     "expected_output": { /* 专家给的标杆答案，结构化 */ },
     "expert_id": "张律师",
     "expert_score_baseline": 90,
     "min_passing_similarity": 0.7,
     "tags": ["high-risk", "construction", "wuhan"]
   }
   ```
4. 案例覆盖：happy / 边界 / 错误 / 异常 4 种场景

### Requirement 2：测试运行

#### Acceptance Criteria

1. CLI 命令：`pnpm test:prompts [prompt-name]`
2. 自动遍历目录下所有案例
3. 跑当前 Prompt → 拿 AI 输出
4. 计算 sentence-embedding 余弦相似度
5. 通过率 ≥ 70% 案例 → 测试通过
6. < 70% → 测试失败 + 输出 diff 报告

### Requirement 3：CI/CD 集成

#### Acceptance Criteria

1. 每次 prompt 改动（apps/api/src/prompts/ 文件变更）→ 自动跑对应测试
2. 测试不通过 → 阻止 PR 合并
3. 测试通过 → 自动允许合并
4. 报告自动 comment 到 PR

### Requirement 4：embedding 模型选择

#### Acceptance Criteria

1. 主模型：阿里百炼 `text-embedding-v2`（国产，便宜）
2. 备选：OpenRouter `text-embedding-3-small`（OpenAI）
3. 缓存：相同 input 24h 内复用 embedding（省钱）

### Requirement 5：测试集生命周期

#### Acceptance Criteria

1. **W4-W8**：你团队咨询专家打标 5-10 个核心 Prompt 的测试集（约 50-100 个案例）
2. **W8-W12**：剩下 20+ Prompt 由 Codex 仿写测试集（专家 review）
3. **上线前**：30+ Prompt × 平均 10 案例 = 300+ 案例待打
4. **上线后**：每月专家新增 5-10 案例（持续打磨）

### Requirement 6：边界

1. SHALL NOT 替代 PBT（PBT 测结构 + 黄金测试集测内容）
2. SHALL NOT 在每个 PR 都跑全量（仅跑相关 prompt 的测试）
3. SHALL NOT 自动调高 min_passing_similarity（必须专家手动调）

### Requirement 7：依赖

- 强依赖：[`04-ai-gateway`]（调用 prompt + embedding API）
- 弱依赖：所有杀手锏 spec（11/12/13/14/15）的 prompt 模板
