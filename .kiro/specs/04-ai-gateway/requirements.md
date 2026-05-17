# 04 AI Gateway - Requirements

## Introduction

> AI 调用的**唯一入口**。落地 [`design.md` §5.7 BR-501 至 BR-508](../00-project-overview/design.md) + [`§5.10 BR-321 至 BR-324`](../00-project-overview/design.md) + [`design-flows.md` §9](../00-project-overview/design-flows.md) AI Tier 实现机制。
>
> **本 spec 是 5 大杀手锏 + 报告中心 + 全局聊天 + 政府版 全部 AI 任务的关键阻塞节点**。

**关联顶层 spec**：[`00-project-overview`](../00-project-overview/) — D-5 AI 调用收口。

**核心理念**（[`ai-gateway-rules.md`](../../steering/ai-gateway-rules.md)）：
- 业务代码**SHALL NOT** import 模型 SDK / 直接 fetch 模型 API
- 每次 AI 调用必经 9 步：鉴权 → 配额 → 预扣 → 缓存 → 模型路由 → 脱敏 → 调用 → 安全过滤 → 实扣 + 审计

**前置依赖**：[`02-shared-contracts`] 完成（types / errors / constants）

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| Provider | 模型供应商渠道（阿里百炼 / 火山方舟 / OpenRouter / B.AI 等）|
| Tier 1-4 | AI 输出深度等级（BR-321：主动给方案 / 建议人工复核 / 引导咨询 / 强制人工接管）|
| RequiredElements | AI 报告 4 强制要素（BR-322：disclaimer / tier / confidence / nextStepHint）|
| Sanitizer | 数据出境脱敏器（BR-504）|
| Tier Resolver | Tier 解析服务（依据 PromptTemplate 内 `tier(ctx)` 函数）|

---

## Requirements

### Requirement 1：AI Gateway 唯一入口（BR-501）

**User Story**：作为业务模块开发者，我希望调 AI 时只需 `aiGateway.invoke({...})` 一行，不关心模型 / 渠道 / 扣点 / 脱敏 / 缓存细节，以便业务代码保持纯净 + 模型升级不影响业务。

#### Acceptance Criteria

1. THE `apps/api/src/ai-gateway/` SHALL 提供唯一入口 `AiGatewayService.invoke<T>(req: AiRequest): Promise<AiResponse<T>>`。
2. THE 业务代码 SHALL NOT 出现以下模式（CI grep 拒绝）：
   - `import OpenAI from 'openai'`
   - `import Anthropic from '@anthropic-ai/sdk'`
   - `fetch('https://api.openai.com/...')` / 任何模型 baseUrl
3. THE AiRequest SHALL 含字段：`taskType / userId / tenantId / input / context / options`。
4. THE AiResponse SHALL 含字段：`data / traceId / modelUsed / providerUsed / cost / tier / confidence / nextStepHint / cacheHit`。

---

### Requirement 2：9 步扣点流程（BR-502）

#### Acceptance Criteria

1. 每次 invoke SHALL 按以下 9 步串行执行（`apps/api/src/ai-gateway/orchestrator.service.ts`）：
   1. 鉴权（JWT + 租户 + 用户级出境授权 BR-505）
   2. 配额检查（限流 BR-508 + 用户日限）
   3. 预扣点数（idempotent，BR-204）
   4. 缓存查询（精确 + 语义，BR-506）→ 命中则退还预扣 + 返回缓存
   5. **Tier 解析**（BR-321 / BR-322 → tier=4 直接拒模型 + 退预扣 + 返回人工接管卡片）
   6. **模型路由**（BR-507，按任务 → 选模型 → 选 provider；未授权 BR-505 自动降级国产）
   7. 数据脱敏（BR-504，调海外模型前必须）+ Prompt 组装（按 tier 注入引导 + 红线表述清单）
   8. 模型调用 + 重试 / failover（BR-507 多渠道）+ 输出 schema 校验（4 要素）+ 安全过滤
   9. 实扣点数 + 审计日志（协议 P-2）+ 成本统计 + 缓存写入

2. 任一步骤失败 SHALL 自动退还预扣点数（BR-204 idempotent）。

3. 整个流程 SHALL 在单个 traceId 下完成（协议 P-3）。

❗ **与 [`design.md` §5.7 BR-502](../00-project-overview/design.md) 措辞对齐**：本 spec 把"输出校验 + 安全过滤"合并到步骤 8（与原文"调用 → 安全过滤"等价 + 显式加 schema 校验）；Tier 解析显式抬到步骤 5（原文隐含在"模型路由"前）。实施以本 spec 为准。

---

### Requirement 3：Tier 解析与 4 强制要素（BR-321 / BR-322 / BR-323 / BR-324）

详见 [`design-flows.md` §9](../00-project-overview/design-flows.md)。

#### Acceptance Criteria

1. 每个 PromptTemplate SHALL 声明 `tier: (ctx) => 1 | 2 | 3 | 4` 函数。
2. THE `TierResolverService.resolve(template, context)` SHALL 在调用模型前解析 tier；tier=4 SHALL **拒绝调模型**直接返回"强制人工接管"卡片。
3. THE 输出 SHALL 强制经 `OutputValidatorService` 校验 RequiredElementsSchema（4 要素），缺失重试 ≤ 2 次后返回业务错误。
4. THE Prompt 系统部分 SHALL 含红线表述清单（BR-323）+ Tier 2/3 强制追加"先尝试自做"引导（BR-324）。
5. THE 红线表述检测 SHALL 在输出阶段拦截，含"必须 / 一定 / 绝对"等绝对化词 → 重生成（最多 1 次）。

---

### Requirement 4：模型路由与渠道（BR-507）

#### Acceptance Criteria

1. THE `apps/api/src/ai-gateway/providers/` SHALL 实现 `AiProvider` 接口：
   ```ts
   interface AiProvider {
     name: string;
     baseUrl: string;
     apiKeyRef: string;  // 从 KMS / env 读
     supportedModels: string[];
     priority: number;   // 1=主, 2=备
     status: 'active' | 'paused';
     invoke(req): Promise<AiRawResponse>;
     health(): Promise<boolean>;
   }
   ```
2. THE 起步 SHALL 实现 4 个 Provider：阿里百炼（Qwen-Max / Qwen-Plus / Qwen-VL-Max）/ 火山方舟（DeepSeek-V3 / DeepSeek-Lite）/ OpenRouter（Claude / GPT-5）/ B.AI（Claude / GPT-5）。
3. THE 任务 → 模型映射 SHALL 默认值在 `apps/api/src/ai-gateway/routing/default-routing.ts`，**同时**通过 `system_configs.key='ai.routing.{taskType}'` 后台覆盖（[`design.md` §5.14](../00-project-overview/design.md)）。
4. THE 单一渠道连续 5 分钟错误率 ≥ 30% SHALL 自动切备用 + 企业微信告警；最多 3 次失败返回 `AI.GATEWAY.UNAVAILABLE`。
5. THE Provider 健康监控 SHALL 写 `ai_provider_health` 表 + 暴露 `GET /api/v1/admin/ai/providers/health`。

---

### Requirement 5：缓存策略（BR-506）

#### Acceptance Criteria

1. THE 精确缓存 SHALL 用 Redis，key = `ai:cache:{taskType}:{sha256(normalizedInput)}`，TTL 24h（可后台覆盖）。
2. THE 语义缓存 SHALL 用 DashVector（阿里云）/ Qdrant 备用，相似度 ≥ 0.95 复用结果。
3. THE 命中缓存 SHALL 退还预扣（用户实付 0），但记录 `cacheHit=true` 用于成本统计。
4. THE 缓存命中率 SHALL 监控 ≥ 30%（红线 BR-901 之外的内部 KPI）。

---

### Requirement 6：数据出境脱敏（BR-504 / BR-505）

#### Acceptance Criteria

1. THE Sanitizer SHALL 提供 `mask(input): { masked, replacements }` + `unmask(output, replacements): output`。
2. THE 脱敏字段 SHALL 包括：公司名 → `{COMPANY_n}` / 人名 → `{PERSON_n}` / 项目名 → `{PROJECT_n}` / 联系方式 → `{CONTACT_n}` / 金额 → `{AMOUNT_n}` / 地址 → `{ADDRESS_n}` / 身份证 / 银行卡 / 统一社会信用代码。
3. THE 调用海外模型前 **MUST** 经 sanitizer，response 后 **MUST** 还原（unmask）。
4. THE 用户级出境授权（BR-505）SHALL 在注册时 checkbox + `user_consents` 表存储；未授权用户的请求自动路由国产模型。
5. THE 政府版（[`23-gov-soe-workspace`]）SHALL **强制** 路由国产模型，即使有授权（BR-505 + R5.13）。
6. THE 脱敏前 + 后内容 SHALL 写 `ai_export_audit` 表（永不删除）。
7. PBT 强制：`unmask(mask(x)) === x`（BR-504）。

---

### Requirement 7：成本统计 + 毛利底线（BR-503）

#### Acceptance Criteria

1. THE 每次调用 SHALL 写 `ai_cost_logs`：tenantId / userId / taskType / modelUsed / providerUsed / inputTokens / outputTokens / inputCost / outputCost / totalCost / creditsCharged / profit / duration / cacheHit。
2. THE 扣点价格（`packages/constants/credit-pricing.ts`）SHALL 按"真实成本 × 3–5 倍"设置，确保毛利 ≥ 70%。
3. THE 毛利监控 SHALL 暴露 `GET /api/v1/admin/cost/profit-margin?period=monthly`，由 [`24-admin-console`] 业务运营看板消费。
4. THE 单点成本 SHALL 触发红线（BR-901）：≥ ¥0.07 → 告警。

---

### Requirement 8：限流（BR-508）

#### Acceptance Criteria

1. THE 限流 SHALL 在 `apps/api/src/common/guards/ai-rate-limit.guard.ts`，用 Redis 计数器实现：
   - 单用户：30 次/分钟
   - 单租户：300 次/分钟
   - 全平台：动态调整（默认 1000 次/分钟）
2. THE 触发限流 SHALL 返回 `AI.RATE_LIMIT.EXCEEDED`（429）+ `Retry-After` 头。
3. THE 阈值 SHALL 后台可调（`system_configs.key='ai.rate_limits'`）。

---

### Requirement 9：节流技术（Prompt Caching + 模型级联）

#### Acceptance Criteria

1. THE invoke SHALL 利用各模型的 Prompt Caching（Claude / GPT / Qwen）：System prompt + few-shot 标记 cache_control，命中时价格仅 10%。
2. THE 长文档（≥ 50 页）SHALL 实现"模型级联"：先用 Qwen-Max 抽关键章节 + 摘要 → 再用 Claude / GPT 深度分析。
3. THE 对话历史 SHALL 仅保留最近 3 轮原文 + 更早摘要（200 字）。
4. THE 知识库召回 SHALL Top-5（不是 Top-20）。
5. THE PromptTemplate SHALL 支持版本灰度（被 [`24-admin-console`] A/B 测试消费）：
   - `template.version` 字段
   - `routing.service` 按 `system_configs.key='ai.prompt_ab.{taskType}'` 的 `{ versionA, versionB, weightA }` 路由
   - 每次调用记录 `ai_tasks.prompt_version` 用于满意度对比

---

### Requirement 10：异步 / 长任务（协议 P-8）

#### Acceptance Criteria

1. THE 耗时预估 ≥ 3s 的 taskType SHALL 走 BullMQ 异步队列；client 触发 → `POST /api/v1/ai-tasks` → 201 `{taskId, status:'queued'}`。
2. THE client SHALL 用 SSE `/api/v1/ai-tasks/:id/events` 或轮询 `GET /api/v1/ai-tasks/:id` 获取进度。
3. THE 进度阶段：`queued → processing → completed | failed`，每阶段更新 `ai_tasks` 表。

---

### Requirement 11：审计日志（协议 P-2）

#### Acceptance Criteria

1. THE 每次 invoke SHALL 写 `audit_log`：action='AI_INVOKE'，含 taskType / 输入 hash / model / cost / cacheHit / traceId。
2. THE 数据出境 SHALL 额外写 `ai_export_audit`：脱敏前后 hash + provider + traceId。
3. THE 审计日志 SHALL 永不删除（按月分区，6 年留存）。

---

### Requirement 12：错误处理

#### Acceptance Criteria

1. 错误码命名空间：`AI.*`（[`design.md` §11.5](../00-project-overview/design.md)）：
   - `AI.GATEWAY.UNAVAILABLE`：所有渠道失败
   - `AI.RATE_LIMIT.EXCEEDED`：限流
   - `AI.TASK_TYPE.UNKNOWN`：未注册任务
   - `AI.OUTPUT.SCHEMA_INVALID`：输出 schema 校验失败（重试 ≤ 2 次后）
   - `AI.OUTPUT.SAFETY_BLOCKED`：内容审核拦截
   - `AI.PROVIDER.TIMEOUT` / `AI.PROVIDER.5XX` / `AI.PROVIDER.QUOTA_EXHAUSTED`
   - `AI.SANITIZER.UNRECOVERABLE`：脱敏字段不可还原
   - `AI.CONSENT.MISSING`：未获得海外模型出境授权

---

### Requirement 13：边界（不做的）

1. SHALL NOT 训练自有模型。
2. SHALL NOT 实现完整的"AI 编排引擎"（multi-step / agent 链）—— 由 [`25-ai-chat-hub`] 完成。
3. SHALL NOT 实现 RAG 知识库（由 [`20-knowledge-system`] 提供，本 spec 仅消费）。
4. SHALL NOT 直接管理点数 / 余额（由 [`08-credit-system`] 提供桩接口）。
5. SHALL NOT 在生产环境直接连海外模型 API（必须经合规渠道 OpenRouter / B.AI）。

---

### Requirement 14：起步注册的 AiTaskType 清单（与各杀手锏 / 报告 / 聊天对齐）

**约束**：本 spec **必须**注册 [`packages/types/ai-task/task-type.ts`] 中的全部起步任务类型，每个任务类型对应一个 PromptTemplate 文件骨架（具体 Prompt 内容由对应杀手锏 spec 填）。

#### Acceptance Criteria

1. THE [`04`] SHALL 注册以下起步 AiTaskType（被各模块消费）：

| AiTaskType | 拥有方 spec | 默认模型 | 出境 | 默认扣点 |
|---|---|---|---|---|
| `chat.short` | [`25`] | qwen-plus | ❌ | 30 |
| `chat.long` | [`25`] | qwen-max | ❌ | 100 |
| `chat.kpi_query` | [`15`] | qwen-max | ❌ | 50 |
| `chat.intent` | [`25`] | qwen-plus | ❌ | 10 |
| `contract.review.basic` | [`13`] | qwen-max | ❌ | 300 |
| `contract.review.pro` | [`13`] | claude-sonnet-4-6 | ✅ | 1500 |
| `contract.modification_letter` | [`13`] | claude-sonnet-4-6 | ✅ | 800 |
| `contract.claim_strategy` | [`13`] | claude-sonnet-4-6 | ✅ | 1500 |
| `tender.summary` | [`12`] | qwen-max | ❌ | 500 |
| `tender.eligibility` | [`12`] | qwen-max | ❌ | 200 |
| `tender.framework` | [`12`] | claude-sonnet-4-6 | ✅ | 1500 |
| `tender.section.{key}` | [`12`] | claude-sonnet-4-6 | ✅ | 400-800 |
| `tender.score_predict` | [`12`] | qwen-max | ❌ | 300 |
| `tender.risk` | [`13`] | claude-sonnet-4-6 | ✅ | 800 |
| `qual.checkup` | [`14`] | qwen-max | ❌ | 200 |
| `qual.upgrade_path` | [`14`] | claude-sonnet-4-6 | ✅ | 800 |
| `qual.dynamic_review` | [`14`] | qwen-max | ❌ | 200 |
| `opp.investability` | [`11`] | qwen-max | ❌ | 800 |
| `opp.business_profile` | [`11`] | qwen-max | ❌ | 200 |
| `opp.authenticity` | [`11`] | qwen-max | ❌ | 100 |
| `opp.peer_radar` | [`11`] | qwen-max | ❌ | 300 |
| `ops.reminder_letter` | [`15`] | qwen-plus | ❌ | 30 |
| `ops.meeting_minutes` | [`15`] | qwen-max | ❌ | 200 |
| `ops.work_report` | [`15`] | qwen-max | ❌ | 100 |
| `ops.business_letter` | [`15`] | qwen-plus | ❌ | 30 |
| `ops.policy_impact` | [`15`] | qwen-max | ❌ | 100 |
| `site.log_summarize` | [`16`] | qwen-vl-max | ❌ | 50 |
| `site.contact_letter.{type}` | [`16`] | qwen-plus | ❌ | 30 |
| `site.major_hazard` | [`16`] | qwen-max | ❌ | 200 |
| `site.archive_checklist` | [`16`] | qwen-max | ❌ | 100 |
| `cost.rough_estimate` | [`17`] | qwen-max | ❌ | 200 |
| `cost.checklist_review` | [`17`] | qwen-max | ❌ | 300 |
| `cost.pricing_recommend` | [`17`] | qwen-max | ❌ | 100 |
| `drawing.understand` | [`18`] | qwen-vl-max | ❌ | 500 |
| `drawing.error_detect` | [`18`] | qwen-vl-max | ❌ | 1500 |
| `drawing.version_diff` | [`18`] | qwen-vl-max | ❌ | 800 |
| `drawing.quantity_estimate` | [`18`] | qwen-vl-max | ❌ | 500 |
| `cash.aging_analysis` | [`19`] | qwen-max | ❌ | 200 |
| `cash.cashflow_forecast` | [`19`] | qwen-max | ❌ | 300 |
| `cash.financing_diagnosis` | [`19`] | claude-sonnet-4-6 | ✅ | 800 |
| `gov.policy_impact` | [`23`] | qwen-max（**强制国产**）| ❌ | 100 |
| `gov.doc.{type}` | [`23`] | qwen-max（**强制国产**）| ❌ | 100-300 |
| `addiction.monthly_growth_report` | [`26`] | qwen-max | ❌ | 100 |
| `addiction.daily_card` | [`22`] | qwen-plus | ❌ | 10 |

合计 **40+ 起步 AiTaskType**。每个杀手锏 / 工具 spec 在自己 design.md 中**必须只引用本表**列出的 taskType，不允许新增未在此表注册的 taskType（防止 04 / 业务 spec 双向不同步）。

2. THE 全部默认值（模型 / 出境 / 扣点）SHALL 通过 `system_configs` 后台覆盖（[`design.md` §5.14`](../00-project-overview/design.md)）。

3. WHERE 业务 spec 需要新增 taskType，THE 实施流程 SHALL：
   a. 先在 [`packages/types/ai-task/task-type.ts`] 添加枚举
   b. 再在本 spec R14 表格 + `apps/api/src/ai-gateway/routing/default-routing.ts` 注册
   c. 最后才在业务 spec / 代码引用

---

### Requirement 15：依赖

- 强依赖：[`02-shared-contracts`]（types/ai-task / errors / constants）
- 弱依赖（可桩）：[`08-credit-system`] 扣点接口；[`28-security-compliance`] 审计 / 脱敏字段表
- 后续阻塞：5 大杀手锏 / 4 个补充 / [`10-report-center`] / [`23-gov-soe-workspace`] / [`25-ai-chat-hub`] 全部


---

## V4 IMPROVEMENTS · 单客户 AI 成本上限自动降级（漏洞 6 修补）

### Requirement 12：单客户 / 单租户 AI 成本上限（BR-904）

#### Acceptance Criteria

#### R12.1 三级成本上限

| 维度 | 阈值 | 行动 |
|---|---|---|
| 单客户每日 AI 成本 | ≥ ¥10 / 天 | 自动降级备用模型（Qwen-Plus / DeepSeek） |
| 单客户每月 AI 成本 | ≥ ¥300 / 月 | 风控人工审核（防滥用） |
| 单租户每月 AI 成本 | ≥ ¥1,000 / 月 | 风控冻结调用 + 客户成功联系 |

#### R12.2 自动降级流程

```
原本调用 Claude Sonnet（¥0.5 / 次）
   ↓
今日累计成本检测：当前用户 ¥9.5 → 下次将超 ¥10
   ↓
自动切换到 Qwen-Max（¥0.05 / 次）/ DeepSeek-V3（¥0.02 / 次）
   ↓
推送站内信告知客户：
   "您今日 AI 调用已达上限，已自动切换到备用模型，
    输出质量稍有差异。建议升级到更高档位享受不限调用。"
```

#### R12.3 价值优先（V4 BR-325）诚实告知

- SHALL：明确告知客户已降级 + 输出可能差异
- SHALL：提供升档选项（不强迫）
- SHALL NOT：偷偷降级不告知
- SHALL NOT：故意降级到劣质模型让客户体验差

#### R12.4 PBT 测试

任意 AI 调用前必查成本上限，超限必降级，降级输出 SHALL NOT 比主模型差距 > 30%（语义相似度，与 29-prompt-testing 黄金测试集协同）。

#### R12.5 后台运营调整

- admin 后台可手动调阈值（按客户档位 / VIP 等级）
- ¥499+ 客户阈值上调到 ¥30 / 天 / ¥1000 / 月（高档位包容）
- ¥999+ 旗舰版无每日上限（仅每月 ¥3000 上限）
