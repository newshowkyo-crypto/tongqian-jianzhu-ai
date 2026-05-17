---
inclusion: always
---

# Autopilot 自治循环规则（最高优先级）

> 本文件是 **Autopilot Mode** 的总开关。当 Codex / Claude Code 进入实施阶段时，**必须**遵守本规则进入"开发→自检→修复→提交→续下一任务"的闭环，**不询问用户**直到全部 spec 实施完成。

## 0. 何时进入 Autopilot

满足以下任一条件即进入：
- 用户输入"开始 autopilot" / "自动开发" / "loop until done" / "持续开发"
- 用户输入"继续"且 [`.kiro/state/progress.json`](../state/progress.json) 中 `mode = "autopilot"`
- AGENTS.md §15 Autopilot Mode 被显式激活

进入后**立即停止任何"是否继续 / 你确认吗"等回问**，按本规则循环。

## 1. 自治循环（核心闭环）

```
┌──────────────────────────────────────────────────────┐
│  while (progress.json 中存在未完成的 task) {         │
│                                                      │
│    1. LOAD：按 token-budget.md 读取必要上下文        │
│    2. PICK：按 build-order.md 取下一个 task          │
│    3. PLAN：列子步骤（≤ 5 步）                       │
│    4. CODE：实施                                     │
│    5. VERIFY：按 self-verification.md DoD 自检       │
│       - 失败 → 走 error-recovery.md → 修复 → 回 5    │
│       - 失败 ≥ 3 次 → 标记 blocked + 跳到下一 task   │
│    6. COMMIT：git commit + push（按 git-workflow）   │
│    7. UPDATE：progress.json 标 done 并写入证据       │
│    8. COMPACT：清理 context（≥ 60% 用量时）          │
│  }                                                   │
│                                                      │
│  if 全部 done：生成 final-report.md，提示用户验收    │
└──────────────────────────────────────────────────────┘
```

## 2. 不询问规则（zero-question）

❌ Codex 在 Autopilot 模式下 **SHALL NOT** 出现以下行为：
- "是否继续？" / "你确认吗？" / "需要我做 X 吗？"
- "我可以选 A 或 B，请告诉我" → 改为查 [`decision-defaults.md`](./decision-defaults.md) 后默认 A
- "看起来需要补一个 X，要不要补？" → 直接补
- "找不到约定" → 查 [`decision-defaults.md`](./decision-defaults.md) → 仍找不到 → 按 §6 fallback 创建合理默认 + 写 ADR
- "现有代码有 bug，要不要修？" → 直接修 + 写到 changelog
- "可能影响其他模块，要不要先确认" → 用 grep + 影响分析后修，failure rollback

✅ 唯一**例外**（必须停下并写 `BLOCKED.md` 到根目录请用户介入的硬阻塞）：
- 触发 [`security-rules.md`](./security-rules.md) 红线（资金 / 数据泄漏 / 越权）
- 触发 [`safety_guardrails`](../../AGENTS.md) 高风险动作（生产删除 / 强 push main）
- 外部依赖未就绪：阿里云账号 / 微信支付商户号 / 模型 API key 等"必须用户提供"的凭证未填到 `.env`
- 同一 task 失败 ≥ 3 次且 [`error-recovery.md`](./error-recovery.md) 无对应方案

## 3. 任务粒度强制约束

每个会话只做 **1 个 atomic task**（来自某个 `tasks.md` 的子任务，如 `22-H1`）：

| 约束 | 上限 |
|---|---|
| 单会话修改文件数 | ≤ 5 |
| 单会话修改总行数 | ≤ 500 |
| 单会话工具调用次数 | ≤ 30 |
| 单会话耗时 | ≤ 30 分钟（虚拟时间，靠 progress.json 隔离）|

超限即**主动 commit 半成品** + 在 progress.json 标 `partial` + 续下一会话补完。

## 4. 实施前必读（按顺序）

每次新 task 启动时按 [`token-budget.md`](./token-budget.md) §2 优先级**只**加载以下：

```
1. AGENTS.md (always)
2. 本文件 autopilot-rules.md (always)
3. .kiro/state/progress.json
4. .kiro/state/build-order.md（仅当前 task 段）
5. 当前 task 所属 spec 的三件套（requirements + design + tasks），仅相关 §
6. 当前 task 直接依赖的 packages/types / packages/errors（仅相关文件）
7. 必要时读 .kiro/steering/{coding-standards|frontend-rules|...}.md（按 token-budget §3 选择）
```

**SHALL NOT**：
- 一次读所有 28 个 spec
- 一次读所有 13 个 steering
- 重复读已知内容（用 git log 判断是否变化）

## 5. 自检循环（成功标准）

每个 task 完成前**必须**通过 [`self-verification.md`](./self-verification.md) §3 DoD（Definition of Done）：

```
DoD 失败 →
  尝试 1：查 error-recovery.md 对应 playbook → 修复 → 回 DoD
  尝试 2：grep 周边代码模式参考已有实现 → 修复 → 回 DoD
  尝试 3：阅读相关 spec 重新核对约束 → 修复 → 回 DoD
  尝试 4：仍失败 → 标记 blocked + 跳过 + 在 progress.json 写失败原因
```

**SHALL NOT 跳过 DoD 直接 commit**。

## 6. 歧义处理 fallback 链

当 spec 中没有明确约定时（OQ / DOQ 之外的临时歧义）：

```
1. 查 decision-defaults.md 是否有默认 → 用默认
2. 查 docs/decisions/ 是否有相关 ADR → 用 ADR
3. 查既有代码是否有相同模式 → 复用模式
4. 查 steering/coding-standards.md / frontend-rules.md / api-conventions.md 等通用规则
5. 仍找不到 → 按"最简实现 + 不破坏既有约束"原则自行决策 + 写一行 ADR-XXX-{topic}.md 到 docs/decisions/
```

**绝不**因为找不到约定而停下问用户。

## 7. 提交规范（每个 atomic task 1 commit）

```
{type}({scope}): {subject}

Body（可选，但 task 结束必写以下信息）：
- task: {01-A1 / 22-H1 / ...}
- files: [...]
- DoD: pass
- next: {下一个 task id}
```

例：
```
feat(types): 实现 packages/types/src/auth/role.ts (BR-001)

- task: 02-A1a
- files: packages/types/src/auth/{role,position-tag,tenant,scope}.ts
- DoD: pass (typecheck / lint / build)
- next: 02-A1b
```

## 8. Context Compaction 触发

当上下文使用 ≥ 60% 时立即：
1. Commit + push 当前进度（即使是半成品）
2. 在 progress.json 标记 `partial` 或 `done`
3. 写 `next_action` 字段（下一会话从这里开始）
4. 主动结束当前会话（说一句"已 commit 进度，下一会话从 task X 续作"）

**SHALL NOT** 撑到上下文炸掉才被动 compact（会丢上下文导致重复劳动）。

## 9. 进度追溯（progress.json 强约束）

每个 task 的 5 个状态：
- `pending`：未开始
- `in_progress`：当前会话进行中
- `partial`：半成品（已 commit，下一会话续）
- `done`：完成 + DoD 通过 + 已提交
- `blocked`：失败 ≥ 3 次或外部依赖未就绪

**每个会话开始时**：
1. 读 progress.json
2. 找到第一个 `partial` 或 `pending` task
3. 跳过 `blocked`（除非用户手动改回 `pending`）

## 10. UI 自治开发约束

实施前端任务时：
1. 必须先调用既有 `packages/ui` 组件（不发明新组件）
2. 缺组件 → 先在 `packages/ui` 加组件 → 再用
3. 视觉**严格遵守** [`ui-visual-spec.md`](./ui-visual-spec.md)（颜色 / 字号 / 间距 / 圆角 / 阴影 全部从 token 取）
4. 自检：`pnpm --filter <app> build` 通过 + Playwright 关键路径 e2e 通过
5. 如果用户指定要看截图：截图 + Storybook 链接 + commit 之后报告

## 11. 完成标志（Final Done）

当 progress.json 中所有 task 状态 ∈ {done, blocked} 且 blocked 数 ≤ 5 时：

1. 跑全套验证：
   - `pnpm install` / `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm test`
   - `pnpm gen:api`（OpenAPI 一致性）
   - `madge --circular packages/`
   - 关键 e2e（5 个场景，详见 [`design-protocols.md` §13`](../specs/00-project-overview/design-protocols.md)）
2. 生成 `docs/changelog/{date}-final-build-report.md`：
   - 28 spec 实施情况
   - 全部测试结果
   - blocked task 清单 + 原因
   - 已知问题
   - 上线前 checklist 进度
3. 输出"已完成所有可自治开发部分，X 项 blocked 需人工介入"

## 12. 禁用清单

❌ 在 Autopilot 模式下绝不：
- 删除测试以让构建通过（必须实修）
- 跳过 PBT 强制项
- 写 `// @ts-ignore` 或 `eslint-disable` 绕过
- 给变量改名 `any` 以绕类型错误
- 删审计日志或权限检查
- 跳过 idempotency / 4 层 WHERE 等强约束
- 把 secret 写代码
- `git push -f` 已 push 的提交
- 跳过 task 不实施直接标 done

违反任一项 → 视为 task 失败 + 回滚。
