# Specs 路线图

> 28 个子模块 spec 的总索引。每个 spec 走 Requirements → Design → Tasks 三阶段。Codex / Claude Code 开发时按本路线图依赖顺序推进。
>
> 完整依赖图、串/并行约束、关键阻塞节点见 [`00-project-overview/design.md` §4](./00-project-overview/design.md)。

---

## 阶段 0：项目顶层

| # | Spec | 状态 |
|---|---|---|
| 00 | [project-overview](./00-project-overview/) — 顶层宪法（拆 5 文件：requirements / design / design-flows / design-protocols / tasks）| ✅ 完成 |

## 阶段 1：基础设施（必须串行 ~3 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 01 | [infra-monorepo](./01-infra-monorepo/) | Monorepo + CI/CD + Docker + 部署 | ✅ 完成 |
| 02 | [shared-contracts](./02-shared-contracts/) | types / errors / permissions / constants / contracts + system_configs 起步 | ✅ 完成 |
| 03 | [design-system](./03-design-system/) | UI 设计系统 + 组件库（packages/ui）| ✅ 完成 |
| 04 | [ai-gateway](./04-ai-gateway/) | AI 调用唯一入口 + 9 步流程 + Tier + 脱敏 + 路由 | ✅ 完成 |
| 05 | [windows-desktop](./05-windows-desktop/) | Tauri 桌面端业务功能（仅 apps/web）| ✅ 完成 |

## 阶段 2：商业核心（强串行 ~2.5 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 06 | [auth-rbac](./06-auth-rbac/) | 鉴权 + 多租户 4 道防线 + 4 大注册 + 审批引擎 P-7 | ✅ 完成 |
| 07 | [subscription-billing](./07-subscription-billing/) | 5 档订阅 + 阶梯优惠 + 自动续费 + 状态机 | ✅ 完成 |
| 08 | [credit-system](./credit-system/) | 多池点数 + 失败退点幂等 + 复活 | ✅ 完成 |
| 09 | [payment-gateway](./09-payment-gateway/) | 微信 / 支付宝 + 退款 + 跨域 5% + 提现 | ✅ 完成 |
| 10 | [report-center](./10-report-center/) | 老板版 H5 + 详细 PDF + 联合品牌 + 4 强制要素 | ✅ 完成 |

## 阶段 3：5 大杀手锏（可并行 ~10 周）

| # | Spec | 功能区 | 状态 |
|---|---|---|---|
| 11 | [opportunity-radar](./11-opportunity-radar/) | A 经营机会 | ✅ 完成 |
| 12 | [tender-factory](./12-tender-factory/) | B 投标赋能 | ✅ 完成 |
| 13 | [risk-review](./13-risk-review/) | D 风险审查 | ✅ 完成 |
| 14 | [qualification-guard](./14-qualification-guard/) | C 资质护航 | ✅ 完成 |
| 15 | [ops-toolkit](./15-ops-toolkit/) | E 经营成本工具 | ✅ 完成 |

## 阶段 3 补充（与杀手锏并行 ~6 周）

| # | Spec | 功能区 | 状态 |
|---|---|---|---|
| 16 | [project-site](./16-project-site/) | F 项目部生产（≥ ¥499）| ✅ 完成 |
| 17 | [cost-estimate](./17-cost-estimate/) | G 造价粗判 | ✅ 完成 |
| 18 | [drawing-recognition](./18-drawing-recognition/) | H 图纸智能 | ✅ 完成 |
| 19 | [cashflow-finance](./19-cashflow-finance/) | I 现金流 / 融资 | ✅ 完成 |

## 阶段 4：知识库与规则（与阶段 3 并行 ~3 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 20 | [knowledge-system](./20-knowledge-system/) | 4 大知识库 + 抓取 + RAG + 专家审核 | ✅ 完成 |
| 21 | [rules-engine](./21-rules-engine/) | 资质 / 合同 / 招标 规则 + 参考价库（PBT 标色 4 档）| ✅ 完成 |

## 阶段 5：用户工作台（依赖阶段 3 ~3 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 22 | [agent-workspace](./22-agent-workspace/) | 智能管家工作台 + 派单 + 信誉 + 评分 + 推荐费 + 申诉 + 高端货架（核心模块）| ✅ 完成 |
| 23 | [gov-soe-workspace](./23-gov-soe-workspace/) | 政府 / 央国企（独立前端 + 强制国产）| ✅ 完成 |
| 24 | [admin-console](./24-admin-console/) | 7 大可视化模块 + 红线监控 + system_configs（OPC 核心）| ✅ 完成 |

## 阶段 6：横向能力（依赖 4-5 ~2 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 25 | [ai-chat-hub](./25-ai-chat-hub/) | 全局 AI 聊天 + 多通道 + 任务编排 | ✅ 完成 |
| 26 | [addiction-system](./26-addiction-system/) | 9 大上瘾机制 | ✅ 完成 |
| 27 | [notification-center](./27-notification-center/) | 6 通道 + 节流 + 降级 | ✅ 完成 |

## 阶段 7：合规与安全（最后 ~1 周）

| # | Spec | 描述 | 状态 |
|---|---|---|---|
| 28 | [security-compliance](./28-security-compliance/) | 审计 + 防黑 + 出境 + 备份 + 应急 + 合规自查 | ✅ 完成 |

---

## 总数

**28 个子 spec，89 个 md 文件**（顶层 5 + 27 × 3 + 索引等于 89 ）。

---

## 推进规则

### 串行 vs 并行（[`00-project-overview/design.md` §4.3](./00-project-overview/design.md)）

- **必须串行**：00 顶层 → 01 → 02 → 04 → 06
- **可以并行**：5 大杀手锏 + 4 个补充 + 知识库 / 规则 共 11 个 spec
- **必须最后**：28 合规放最后做总体审视

### 4 个先行（防 Codex 失忆 / 多会话冲突）

并行做多个 spec 时**必须遵守**（[`memory-management.md` §11](../steering/memory-management.md)）：

1. **共享类型先行**：跨 spec 的 DTO / Enum / 错误码 → 先合 `packages/types` / `packages/errors`
2. **OpenAPI 先行**：新 API → 先合 `packages/contracts/openapi.yaml`
3. **数据库先行**：schema 改动 → 先合 `prisma/schema.prisma` + migration
4. **Spec 先行**：spec 缺漏先补 / 先发 ADR，再写代码

### 每个 spec 内部流程

```
1. Requirements 阶段 → 创始人审阅 → 批准 → 进入 Design
2. Design 阶段 → 创始人审阅 → 批准 → 进入 Tasks
3. Tasks 阶段（5-22 个原子任务）→ 创始人批准 → Codex / Claude Code 按任务推进
```

### 单文件硬上限

每个 spec 单文件 ≤ 800 行（[`spec-template.md`](../steering/spec-template.md) §0）。超限拆为 design + design-flows + design-protocols。

---

## 当前状态

✅ **全部 28 个 spec 完成 Requirements + Design + Tasks 三件套**（2025-05-16）

⏳ **下一步**：创始人审阅 spec → 进入实施阶段（Codex 按 tasks 推进）

---

## 路线图维护

- 每个 spec 完成（指 Tasks 全部勾选完成）后将状态改为 ✅
- 推进过程中如果发现需要新增 / 拆分 / 合并 spec，写 ADR 记录
- BR 增删改 → 顶层 [`00-project-overview/requirements.md` §8](./00-project-overview/requirements.md) + [`design.md` §5 BR 映射表](./00-project-overview/design.md) 同步更新 + 写 ADR
