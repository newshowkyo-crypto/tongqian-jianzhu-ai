# 04 AI Gateway - Tasks

## 任务总数：18

## Phase A：基础类型 + Prisma schema（2 个）

- [ ] **A1** 在 `packages/types/src/ai-task/` 补全 PromptTemplate / TierContext / AiRequest / AiResponse 接口
  - 验收：业务可 `import type { PromptTemplate } from '@tongqian/types'`

- [ ] **A2** 在 `prisma/schema.prisma` 添加 4 个表：AiTask / AiCostLog / AiProviderHealth / AiExportAudit + migration
  - 验收：`pnpm db:migrate` 通过

## Phase B：缓存 + 信用桩（2 个）

- [ ] **B1** 实现 `cache/exact-cache.service.ts`（Redis）+ `cache/semantic-cache.service.ts`（DashVector，先桩 + 简易 cosine）
  - 验收：lookup / set 测试覆盖

- [ ] **B2** 实现 `credit/pre-charge.service.ts` / `commit.service.ts` / `refund.service.ts`（idempotent，先用 in-memory 实现，后由 [`08-credit-system`] 替换为真实 DB）
  - 验收：PBT 通过：同 idempotencyKey 重复调用结果一致

## Phase C：Sanitizer（2 个）

- [ ] **C1** 实现 `sanitizer/sanitizer.service.ts` + 6 类检测器（公司名 / 人名 / 项目名 / 联系方式 / 金额 / 地址 / 身份证 / 银行卡 / 统一社会信用代码）
  - 验收：PBT 强制 unmask(mask(x)) === x

- [ ] **C2** 实现 `audit/ai-export-audit.service.ts`（写 ai_export_audit 表）
  - 验收：每次脱敏调用必写 1 行审计

## Phase D：Provider + 路由（3 个）

- [ ] **D1** 实现 `providers/ai-provider.interface.ts` + 4 个 Provider 实现（阿里百炼 / 火山方舟 / OpenRouter / B.AI）
  - 验收：每个 Provider 实现 invoke / health；mock 模式可通过单测

- [ ] **D2** 实现 `providers/provider-router.service.ts`（按 priority + 健康选 provider + failover）+ `providers/health-monitor.worker.ts`（cron 每 1min）
  - 验收：单一 provider 错误率 30% 自动切备用 + 写企业微信告警

- [ ] **D3** 实现 `routing/routing.service.ts`（任务 → 模型 → provider 映射，支持 system_configs 后台覆盖）+ `routing/default-routing.ts`
  - 验收：50+ AiTaskType 全有默认映射；后台改 `ai.routing.contract.review.pro` 60s 内生效

## Phase E：Tier + Output（3 个）

- [ ] **E1** 实现 `tier-resolver.service.ts`（解析 PromptTemplate.tier 函数）
  - 验收：PBT 强制 Tier 单调性

- [ ] **E2** 实现 `output-validator.service.ts`（4 强制要素 + zod 校验，重试 ≤ 2 次）
  - 验收：PBT 强制 4 要素完整性

- [ ] **E3** 实现 `safety-filter.service.ts`（输出敏感词 + 红线表述检测，命中重生成 1 次）
  - 验收：PBT 强制红线表述拦截

## Phase F：Prompt + Tier 注入（1 个）

- [ ] **F1** 实现 `prompt-builder.service.ts` + `routing/tier-prompt-injector.ts`
  - 验收：按 tier 注入引导文案 + few-shot 拼装正确

## Phase G：限流 + 编排（2 个）

- [ ] **G1** 实现 `apps/api/src/common/guards/ai-rate-limit.guard.ts`（Redis 计数器，3 维：用户 / 租户 / 全平台）
  - 验收：超阈值返回 429 + Retry-After

- [ ] **G2** 实现 `orchestrator.service.ts` + `ai-gateway.service.ts`（9 步主流程编排）
  - 验收：单元测试覆盖每步 + e2e 场景 1（合同审查闭环）通过

## Phase H：成本 + 异步（2 个）

- [ ] **H1** 实现 `cost-meter.service.ts` + `apps/admin` 成本仪表盘 API（`GET /api/v1/admin/cost/profit-margin`）
  - 验收：毛利 ≥ 70% 监控可视化

- [ ] **H2** 实现 BullMQ 异步任务队列（`apps/worker/src/jobs/ai-task.job.ts`）+ SSE 进度推送
  - 验收：长任务（> 3s）自动入队 + client SSE 收到进度

## Phase I：示例 Prompt（1 个）

- [ ] **I1** 实现 1 个示例 Prompt（contract-review-basic）作为 PromptTemplate 模板范式
  - 验收：5 大杀手锏 spec 撰写时可参照本范式

## 完成标准

- ✅ 业务代码 grep 不到 OpenAI / Anthropic SDK 直接 import（CI 强制）
- ✅ `aiGateway.invoke({...})` 可被 5 大杀手锏调用
- ✅ 全部 PBT 强制项通过
- ✅ e2e 场景 1（合同审查闭环）通过
- ✅ 毛利监控 ≥ 70%


---

## V4 IMPROVEMENTS 新增任务（漏洞 6 单客户 AI 成本上限）

- [ ] **04-IMP-1** UserDailyCost / TenantMonthlyCost 模型 + cron 5min 累计
- [ ] **04-IMP-2** cost-cap-enforcer.service.ts（调用前必查上限）
- [ ] **04-IMP-3** auto-downgrade.service.ts（自动切备用模型）
- [ ] **04-IMP-4** 站内信 + 短信通知客户（V4 BR-325 诚实告知）
- [ ] **04-IMP-5** PBT：任意调用必查上限 + 降级输出差距 ≤ 30%
- [ ] **04-IMP-6** admin 后台阈值可调（按档位 / VIP）
- [ ] **04-IMP-7** e2e：成本累计 → 触发降级 → 客户告知 → 升档引导
