# 2025-05-16 全部 28 个 Spec 横向审查 + 修补

## 摘要

对 28 个子 spec（89 个 markdown 文件）做横向逻辑一致性审查。共发现 **3 个破链 / 4 个逻辑错位 / 13 个补全缺失** 共 20 个真问题，全部修复完毕。**结论：spec 套件具备让 Codex 按依赖顺序逐模块完成的可执行性**，但**不**适合"一次性全量开发"，详见报告 §3。

## 审查范围

| 维度 | 检查方式 | 结果 |
|---|---|---|
| BR 引用一致性 | grep BR-\d{3} 比对顶层 §8 定义的 61 条 | ✅ 全部覆盖 |
| 错误码命名空间 | grep `[A-Z_]+\.[A-Z_.]+` 比对 §11.5 分配 | ✅ 无冲突 |
| 依赖闭环 | grep `\[\`\d{2}-...\`\]` 比对依赖图 | ⚠️ 3 处破链已修 |
| AI 任务类型 | 04 与各杀手锏对照 | ⚠️ 缺统一注册表，已补 R14 |
| 关键流程闭环 | 注册→订阅→AI→报告→派单→评分→分润 | ✅ 通顺 |
| 顶层用户故事覆盖 | R3-R6 verbs → 子 spec | ⚠️ Owner 首页归属不清，已补 03 R6.5 |
| 横切协议引用 | P-1~P-8 是否被引用而非重定义 | ✅ 全部引用 |
| 单文件行数 | 业务 ≤ 800 / 顶层 ≤ 900 | ✅ 通过 |

## 修复的 20 个问题

### 破链类（3 个）

| # | 问题 | 修复 |
|---|---|---|
| P-2 | `[`22-dispatch`]` 链接不存在（design-protocols.md §13.3）| 改为"[`22-agent-workspace`] dispatch 模块" |
| P-3 | `[`22-dispatch`]` 同上（21 rules-engine R4）| 同上 |
| P-4 | `[`design-protocols.md`]` 引用错误路径（24 admin R2）| 改为"[`design.md` §5.14 BR-901 监控指标 + design-protocols.md 附录 B"]` |

### 逻辑错位类（4 个）

| # | 问题 | 修复 |
|---|---|---|
| P-5 | 04 R2 9 步流程中 Tier 解析隐含在路由里，与 design-flows §9.4 时序不一致 | 显式拆为步骤 5（Tier 解析）+ 步骤 6（模型路由），步骤 7 含 Prompt 组装，步骤 8 含 schema 校验 |
| P-6 | 04 R14 重复编号（与 R14 依赖冲突）| 改后者为 R15 依赖 |
| P-10 | 05 桌面端 R3 设备绑定与 06 设备管理边界模糊 | 在 05 R3 加分工说明：后端表/API → 06；Tauri 侧采集 + Credential Manager → 05 |
| P-12 | 26 "建筑能力等级 LV1-5" 与 22 "智能管家信誉 LV1-5" 易混淆 | 在 26 R3 加 ⚠️ 命名警告 + 数据表分离约束 |

### 缺失补全类（13 个）

| # | 缺失项 | 补在 |
|---|---|---|
| P-7 | 04 缺统一 AiTaskType 注册表 | 04 R14 表（40+ 起步任务，含拥有方/默认模型/出境/默认扣点）|
| P-8 | 04 缺 Prompt 版本灰度的接口契约（24 计划 A/B 测试无法实施）| 04 R9.5（PromptTemplate.version + ai_tasks.prompt_version + system_configs key 路由）|
| P-9 | 顶层 BR-501 实现位置未指 R14 注册表 | 顶层 §5.7 BR-501 行加注释 |
| P-13 | 22 派单大厅 R5 没明确"客户最终选定"独立步骤 | 22 R5 加第 5 项"客户最终选定" |
| P-15 | 25 chat-hub 的 chat.short / chat.long / chat.intent 未在 04 注册 | 已含在 04 R14 表 + 25 tasks A2/A4 明确注册 |
| P-16 | OWNER 首页 / 各角色 dashboard 没有归属模块 | 03 R6.5 + 03 tasks E3（5 个 dashboard 骨架）|
| P-17 | 06 缺登录返回 `defaultDashboard` 字段（与 03 R6.5 联动）| 06 R11.5 |
| P-18 | 24 admin Prompt 管理"满意度对比"没明确数据源 | 24 R1.3 加注：消费 [`10`] ReportRating + [`04`] ai_tasks |
| P-19 | 25 spec 没显式列 chat.intent 注册步骤 | 25 tasks A2/A4 |
| P-20 | 25 handler 没指对应业务模块 | 25 tasks A3（KPI 调 15 / 合同调 13 / 催款调 15 / 政策调 20 / 资质调 14 / 可投性调 11）|
| P-21 | 26 spec 没说"政府版禁用上瘾"如何实现 | 已在 26 边界 + 27 spec 自动落地（apps/gov 不接入上瘾通道）|
| P-22 | 03 设计系统缺 dashboard 组件 | 已补 03 R6.5 + tasks E3 |
| P-23 | 各杀手锏 spec 与 04 R14 的 taskType 字符串需一致性 | 04 R14 加约束："业务 spec 必须只引用本表列出的 taskType" |

（P-1 是上一轮已修的"design.md 拆分"，本轮不再列）

## Codex 一次性开发可行性判断

❌ **不可一次性开发完毕**。原因：

### 工程量
- 89 个 spec md 文件 + 28 个模块代码（apps/api ~150 个 service / 70+ 个 controller）
- 数据库 ~80 张表
- 前端 4 个子应用 + 桌面端
- 按 [`design.md` §4 工作量估算 22-24 周](../../.kiro/specs/00-project-overview/design.md)（OPC + Codex 主导）

### Codex 单会话约束
- 上下文窗口限制（≤ 200K token），跨 28 个模块的全量理解不可行
- 单会话失忆（[`memory-management.md` §3.1`](../../.kiro/steering/memory-management.md) 强约束：单任务 ≤ 5 文件 / ≤ 500 行）

### 推荐路径

**单 Codex 会话只做 1 个原子任务**（来自 tasks.md），按以下顺序串/并行：

1. **强制串行**（不可跳）：01 → 02 → 03/04/05（并行）→ 06 → 07/08（并行）→ 09 → 10
2. **可并行**（11-21 共 11 个 spec）：5 杀手锏 + 4 补充 + 知识 + 规则
3. **依赖阶段 3**：22 → 23 / 24
4. **横向**（25 → 26 → 27 串行）
5. **总审**：28

### 强制路径质量门禁

每完成 1 个 spec 的 tasks → CI 必须通过：
- 全部 PBT 通过
- 跨租户 e2e 测试通过
- 错误码命名空间不冲突（grep 检查）
- packages/types 与 OpenAPI 一致（pnpm gen:api 不报错）
- madge --circular packages/ 无循环依赖

### 单会话规模建议

- 单会话 ≤ 1 个 tasks 中的子任务（如 22 spec H1）
- 跨 spec 共享类型变更必须先合 packages（"4 个先行"）
- 完成后立即提交 + push，不依赖会话记忆

## 影响

- 5 个 spec 文件被修改（00 design / 04 / 05 / 06 / 21 / 22 / 24 / 25 / 26）
- 03 design-system 新增 R6.5 + tasks E3
- 04 ai-gateway 新增 R9.5 + R14（最大补充）
- 06 auth-rbac 新增 R11.5
- 顶层 design.md §5.7 BR-501 注释更新

## 部署步骤

无（spec 撰写阶段）。

## 关联

- 上一轮：[`2025-05-16-spec-suite-complete.md`](./2025-05-16-spec-suite-complete.md)
- [`spec-template.md`](../../.kiro/steering/spec-template.md) §0 硬约束
- [`memory-management.md`](../../.kiro/steering/memory-management.md) §11 "4 个先行"
