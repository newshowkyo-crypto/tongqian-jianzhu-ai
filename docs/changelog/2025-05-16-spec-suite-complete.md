# 2025-05-16 全部 28 个子 Spec 完成

## 摘要

完成全部 28 个子 Spec 的 **Requirements + Design + Tasks** 三件套撰写，配合顶层 Spec 的 5 文件结构，共产出 **89 个 markdown 文件**。同时修复 6 个审查问题（P1-P6），项目从"规划层 7%"推进到"规划层 100%"，正式进入可实施阶段。

## 修复的审查问题

### P1：拆分顶层 design.md（1962 行 → 3 文件）

违反 [`memory-management.md` §3.1`](../../.kiro/steering/memory-management.md) 单文件 ≤ 800 行硬约束。拆分为：
- `00-project-overview/design.md`（867 行）：架构总图 + 依赖图 + BR 映射 + packages 层级 + 权衡 + 开放问题
- `00-project-overview/design-flows.md`（766 行）：4 大注册时序 + 漏斗状态机 + 派单序列 + 信誉事件溯源 + AI Tier
- `00-project-overview/design-protocols.md`（596 行）：多租户 4 道防线 + 部署架构 + e2e 测试 + 协议 P-1~P-8

### P2：BR-309 覆盖关系清理

`requirements.md` BR-309 旧"智能管家等级权重 LV5+10..LV1+1"已被 BR-336 完全覆盖。改写为"已合并入 BR-336"占位，避免实施时引用旧数值。

### P3：02-shared-contracts/tasks.md 任务粒度过粗

A1 一个任务建 12 个文件违反 [`memory-management.md`](../../.kiro/steering/memory-management.md) "单任务 ≤ 5 个文件"约束。拆为 A1a (auth/) + A1b (common/)。任务总数 18 → 22。新增 G1（system-config 起步骨架）落地 §5.14 后台覆盖契约。

### P4：spec-template.md 加单文件 800 行硬上限

新增 §0 硬约束章节：
- 单 spec 文件 ≤ 800 行
- 单任务 ≤ 5 文件 / ≤ 500 行
- 撰写到 700 行主动评估拆分；900 行 CI 拒绝

### P5：01-infra-monorepo R8 划清桌面端边界

明确 01 R8 仅做 Tauri 骨架（"`tauri dev` 加载 apps/web 首页"）+ 仅复用 `apps/web`（与 DOQ-004 顶层倾向一致），其他 3 个前端不进桌面。完整桌面端业务功能归 [`05-windows-desktop`]。

### P6：业务参数后台覆盖契约（OPC 核心）

新增 [`design.md` §5.14 业务规则后台覆盖能力清单](../../.kiro/specs/00-project-overview/design.md) + §14.10 权衡 9。强约束：
- 11 类业务规则（订阅价 / 分润 / 阈值 / 信誉规则 / 派单权重 / 红线 等）**必须**通过 `system_configs` 后台可调
- [`02-shared-contracts`] D1a/D1b 任务输出 `seedSystemConfigs()` 函数 + Prisma seed
- [`02`] G1 + [`24-admin-console`] A1 实现读 + 缓存 + 失败回落 + Redis pub/sub 失效

## 新增的 25 个子 Spec

完整覆盖 [`design.md` §4 依赖图](../../.kiro/specs/00-project-overview/design.md) 阶段 1-7：

**阶段 1 基础设施（继承 01/02）**：03 design-system / 04 ai-gateway / 05 windows-desktop

**阶段 2 商业核心**：06 auth-rbac / 07 subscription-billing / 08 credit-system / 09 payment-gateway / 10 report-center

**阶段 3 杀手锏**：11 opportunity-radar / 12 tender-factory / 13 risk-review / 14 qualification-guard / 15 ops-toolkit

**阶段 3 补充**：16 project-site / 17 cost-estimate / 18 drawing-recognition / 19 cashflow-finance

**阶段 4 知识规则**：20 knowledge-system / 21 rules-engine

**阶段 5 工作台**：22 agent-workspace（核心，22 个原子任务）/ 23 gov-soe-workspace / 24 admin-console（OPC 核心）

**阶段 6 横向能力**：25 ai-chat-hub / 26 addiction-system / 27 notification-center

**阶段 7 合规**：28 security-compliance

## 关键设计要点（贯穿 28 个 spec）

1. **AI Gateway 唯一入口**（[`04`]）：业务代码 SHALL NOT import 模型 SDK；9 步流程 + Tier 解析 + 4 强制要素 + 脱敏 + failover
2. **多租户 4 道防线**（[`06`] + 协议 P-4）：TenantContext + BaseRepo + Prisma middleware + e2e
3. **审批引擎 P-7**（[`06`]）：数据驱动，复用退款 / 提现 / 用印 / 数据导出 / 申诉 / 平台用户
4. **派单决策完整**（[`22`]）：BR-307~316 + BR-331~336 全覆盖，22 个任务
5. **信誉事件溯源**（[`22`]）：永不删原 log + 反向事件回滚 + 24h 缓冲等级
6. **system_configs 后台覆盖**（[`02`] + [`24`]）：OPC 核心，11 类业务规则可后台调
7. **强制 PBT 项**（[`design-protocols.md` §13.7`](../../.kiro/specs/00-project-overview/design-protocols.md)）：13+ 项关键属性

## 影响

| 维度 | 状态 |
|---|---|
| 数据库 schema | 28 spec 各自定义；按 [`memory-management.md` §11.3`](../../.kiro/steering/memory-management.md) 数据库先行原则集成时合并 |
| API 契约 | 全部新 API 必先在 [`packages/contracts/openapi.yaml`] 声明 |
| packages/types | 各 spec 增量，遵守 [`design.md` §11.4`](../../.kiro/specs/00-project-overview/design.md) 修改顺序 |
| 部署 | 暂无影响（仍 [`01`] 单 VPS + Docker Compose） |
| 文档 | [`.kiro/specs/README.md`] 更新；本 changelog |

## 部署步骤

无（spec 撰写阶段）。

## 已知问题 / 后续

- 25 个新 spec 待创始人审阅（Requirements → Design → Tasks 三阶段批准）
- 实施阶段需严格遵守 [`memory-management.md` §11`](../../.kiro/steering/memory-management.md)"4 个先行"
- 每个子 spec 进 design 阶段时检查 PBT 落点 + 错误码命名空间不冲突（[`design-protocols.md` §13.7`](../../.kiro/specs/00-project-overview/design-protocols.md)）

## 关联

- [`AGENTS.md`](../../AGENTS.md) 总指令
- [`README.md`](../../.kiro/specs/README.md) 路线图
- ADR-001 / ADR-002（已落地的关键决策）
- 6 个潜在 ADR 监控点（[`design.md` §15.5`](../../.kiro/specs/00-project-overview/design.md)）
