# 2025-05-16 Autopilot 自治循环系统建立

## 摘要

为支持用户提出的"Codex 一次性自治开发到成品，问都不要问，自己开发自己纠错自己构建自己检验自己修 bug，token 也不要太费"的需求，新增 **6 份治理文件 + 1 份机器可读状态文件**，建立完整的 Autopilot 自治循环系统。

## 新增文件清单

### 1. 治理规则（5 份 steering，全部 always inclusion）

| 文件 | 行数 | 作用 |
|---|---|---|
| [`autopilot-rules.md`](../../.kiro/steering/autopilot-rules.md) | 175 | 自治循环规则（核心）：闭环流程 / zero-question / 单 task 约束 / fallback 链 / context compaction / 12 类禁用清单 |
| [`decision-defaults.md`](../../.kiro/steering/decision-defaults.md) | 230 | 默认决策表：商业 / 技术 / 编码 / 前端 / 安全 / AI / 测试 / 工程 / UI / 兜底 / 凭证清单 11 类 ~150 项默认值 |
| [`token-budget.md`](../../.kiro/steering/token-budget.md) | 168 | 上下文预算：4 层加载优先级 / 按任务类型读取 steering / 工具调用次数上限 / 跨会话信息流 / 紧急救援 |
| [`self-verification.md`](../../.kiro/steering/self-verification.md) | 195 | DoD 自检：通用 10 项 + 8 类专属（service / API / 数据库 / AI / 前端组件 / 前端页面 / PBT / 测试） |
| [`error-recovery.md`](../../.kiro/steering/error-recovery.md) | 175 | 12 类失败 playbook：TS / ESLint / Build / 单测 / e2e / Migration / OpenAPI / 循环依赖 / AI Gateway / Docker / Git / 跨租户 |

### 2. 状态文件（2 份 state，机器可读）

| 文件 | 作用 |
|---|---|
| [`build-order.md`](../../.kiro/state/build-order.md) | 8 阶段 ~230 atomic task 编排 + 串/并行约束 + 任务 ID 命名 + 单会话推进流程 |
| [`progress.json`](../../.kiro/state/progress.json) | 机器可读进度：每 task 状态 + 凭证检查 + session log + blocked 清单 |

### 3. 用户使用指南（1 份）

| 文件 | 作用 |
|---|---|
| [`AUTOPILOT-START.md`](../../.kiro/state/AUTOPILOT-START.md) | 给创始人的启动指南：一句话启动 / 凭证填写 / 推进期只说"继续" / BLOCKED 处理 / 暂停恢复 |

### 4. AGENTS.md §15 总开关

加了 `## 15. Autopilot Mode` 章节，定义：
- 进入条件（5 个触发关键词）
- §14 紧急情况规则的 Autopilot 变体（6 项决策方式调整）
- 强制 6 文件协议
- 单会话契约（5 个硬约束）
- 退出条件

## Autopilot 工作机制

```
用户说"开始 autopilot"
  ↓
Codex 读 progress.json + 启动检查（凭证 / docker / git）
  ↓
缺凭证 → 写 BLOCKED.md → 等用户填 → 用户说"继续"
全部就绪 → 进入主循环
  ↓
┌─────────────────────────────────────┐
│ while pending tasks 存在：          │
│   1. 读 progress.json 取下一 task   │
│   2. 按 token-budget 加载上下文     │
│   3. PLAN（不调工具，列 ≤ 5 步）    │
│   4. CODE（≤ 12 次工具调用）        │
│   5. VERIFY（按 DoD ≤ 6 次）        │
│      失败 → error-recovery → 修     │
│      失败 ≥ 3 次 → blocked + 跳过   │
│   6. COMMIT + push                  │
│   7. 更新 progress.json             │
│   8. 上下文 ≥ 60% → 主动结束会话    │
│ end while                           │
└─────────────────────────────────────┘
  ↓
全部 done + blocked ≤ 5 → 跑 Final DoD → 写 final-build-report.md
  ↓
输出"已完成 X 项可自治开发部分，Y 项 blocked 需人工介入"
```

## 关键约束

### 单会话契约（防失忆 + 省 token）

| 约束 | 上限 |
|---|---|
| atomic task 数 | 1 |
| 修改文件数 | ≤ 5 |
| 修改总行数 | ≤ 500 |
| 工具调用次数 | ≤ 30 |
| 上下文阈值 | 60% 触发 compaction |

### 唯一停下条件（4 类红线）

仅以下情况写 BLOCKED.md 停下：
1. 触发 [`security-rules.md`](../../.kiro/steering/security-rules.md) 红线
2. 触发 safety_guardrails 高风险动作
3. 缺 P0 凭证（[`decision-defaults.md` §11`](../../.kiro/steering/decision-defaults.md)）
4. 同 task 失败 ≥ 3 次且无 playbook

其他情况一律按 [`autopilot-rules.md` §6 fallback 链](../../.kiro/steering/autopilot-rules.md) 自决。

### Token 节省策略

- 每次只加载 4 Tier 上下文（系统 30K + task 25K + 代码 80K + 缓冲 30K = 165K，留 35K 安全余量）
- 13 份 steering 仅按任务类型选读相关章节（不全读）
- 28 份 spec 只读当前 task 涉及的相关段
- grep 优先于 readFile
- 重复读触发 SHALL NOT

## 用户使用方法（极简）

启动前：填 `.env` P0 凭证（11 项）。

启动：任何会话说一句"开始 autopilot"。

推进：每次新会话说一句"继续"。

完成：看 `docs/changelog/{date}-final-build-report.md`。

异常：看 `BLOCKED.md`。

暂停：说"暂停 autopilot"。

## 影响

- AGENTS.md 加 §15
- 新增 5 个 always inclusion 的 steering（IDE 自动加载，~ 30K token）
- 新增 2 个 state 文件 + 1 个用户指南
- 不影响现有 28 个 spec 内容

## 部署步骤

无（治理文件，纯 markdown）。

## 关联

- 上一轮：[`2025-05-16-spec-suite-audit.md`](./2025-05-16-spec-suite-audit.md)
- 上上一轮：[`2025-05-16-spec-suite-complete.md`](./2025-05-16-spec-suite-complete.md)
- 用户提出：自治循环到成品 + token 不要太费
