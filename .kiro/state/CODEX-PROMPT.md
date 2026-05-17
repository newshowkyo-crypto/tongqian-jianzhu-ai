# Codex / Claude Code 启动提示词

> 复制下方 ⬇️ 区块的完整内容，粘贴到 Codex / Claude Code 的会话框，按 Enter。Codex 会自动进入 Autopilot 自治循环，不再询问任何问题，一直跑到全部 spec 完成或遇到必须人工介入的红线。

---

## 🚀 启动提示词（首次启动用这个）

⬇️ 从下面这行开始复制 ⬇️

```
开始 autopilot 自治循环开发模式。

按以下顺序执行，不询问我任何确认性问题：

1. 立即读取 .kiro/state/progress.json 把 mode 从 "standby" 改为 "autopilot"，记录 started_at
2. 读取 AGENTS.md §15 + .kiro/steering/autopilot-rules.md + decision-defaults.md + token-budget.md + self-verification.md + error-recovery.md（这 5 份是 always-loaded）
3. 读取 .kiro/state/build-order.md（仅当前阶段段）
4. 跑 00-PRE-1 启动检查：读 .env 文件，对照 decision-defaults.md §11 P0 凭证清单，把 progress.json credentials_check 中每项填 "present" 或 "missing"
5. 如果有 P0 缺失 → 在项目根目录写 BLOCKED.md（列出缺哪些 + 我去哪获取 + 申请预计周期）→ 把 progress.json mode 改为 "paused" → 结束会话
6. 如果 P0 全部就绪 → 跑 00-PRE-2（检查 docker / pnpm / node 22 / git 已安装）+ 00-PRE-3（git remote 已配置）
7. 全部启动检查通过后，按 build-order.md 找下一个 pending task（应该是 01-A1）
8. 进入主循环：
   - LOAD（按 token-budget.md §2 优先级加载，≤ 8 次工具调用）
   - PLAN（不调工具，列 ≤ 5 步）
   - CODE（实施，≤ 12 次工具调用，≤ 5 个文件，≤ 500 行）
   - VERIFY（按 self-verification.md DoD，≤ 6 次工具调用）
     - 失败 → error-recovery.md 对应 playbook 修复 → 回 VERIFY
     - 失败 ≥ 3 次 → 标 blocked + 写 BLOCKED.md 该 task 段 + 跳下一 task
   - COMMIT（git commit + push，conventional commits 格式，message 含 task id + DoD 结果 + next task）
   - UPDATE progress.json（标 done + 写 evidence + completed_at）
   - 检查上下文使用率：
     - < 60% → 取下一 task 继续循环
     - ≥ 60% → 主动结束会话，输出"已完成 task X 至 Y，下一会话从 task Z 续作"

9. 全部 task ∈ {done, blocked} 且 blocked ≤ 5 时进入 99-FINAL 阶段：
   - 跑 autopilot-rules.md §11 完整验证
   - 生成 docs/changelog/YYYY-MM-DD-final-build-report.md
   - 把 progress.json mode 改为 "done"
   - 输出最终验收报告

强约束（绝不违反）：
- 不询问我任何问题（除了 BLOCKED 类红线必须停下）
- 单会话只做 1 个 atomic task
- 单会话最多 30 次工具调用
- 单会话最多 ≤ 5 个文件 / ≤ 500 行修改
- 不删测试 / 不加 @ts-ignore / 不绕安全规则
- DoD 不通过绝不 commit
- 上下文 ≥ 60% 必须主动结束会话
- 凡 spec 没明确约定的歧义点，先查 decision-defaults.md，再查 docs/decisions/ ADR，再查既有代码模式，再用最简实现 + 写 ADR-AUTO，绝不停下问我

现在开始。第一步先确认 .env 凭证状态。
```

⬆️ 复制到这行结束 ⬆️

---

## 🔄 续作提示词（每次新会话用这个）

⬇️ 复制 ⬇️

```
继续 autopilot。

读 .kiro/state/progress.json 找下一个 status = "pending" 或 "partial" 的 task（跳过 blocked），按 .kiro/steering/autopilot-rules.md 主循环执行，不询问我。

完成单个 task 后立即 commit + push + 更新 progress.json，主动结束会话告诉我下一会话从哪续作。
```

⬆️ 复制结束 ⬆️

---

## ⏸ 暂停提示词

```
暂停 autopilot。

把 .kiro/state/progress.json 的 mode 改为 "paused"，commit 当前所有修改，告诉我当前 task 进度。
```

---

## 🛠 处理 BLOCKED 后续作提示词

```
我已处理 BLOCKED.md 中的问题（{简短描述你做了什么}）。

请：
1. 读 BLOCKED.md 确认我的修复
2. 删除 BLOCKED.md
3. 把对应 blocked task 在 progress.json 中改回 "pending"
4. 继续 autopilot 循环
```

---

## 📊 查看进度提示词

```
读 .kiro/state/progress.json 给我一份简短进度报告：
- 当前 phase
- done / blocked / pending 数量
- 当前正在做的 task（如有）
- 最近 5 个 commit
- 是否有 BLOCKED.md
```

---

## 🚨 紧急停止提示词

```
紧急停止 autopilot。立即：
1. commit 当前所有未提交修改（用 wip 前缀）
2. progress.json mode 改 "paused" + 写当前 task 状态为 "partial"
3. 不再继续，等我下一步指令
```

---

## ⚙️ 自定义提示词

### 跳过某个 blocked task

```
跳过 task XX-YY（永久不做）。在 progress.json 中把它的 status 改为 "skipped" + 写 skip_reason，继续 autopilot。
```

### 重做某个已 done 的 task

```
重做 task XX-YY（已发现问题）。在 progress.json 中把它的 status 改回 "pending"，git revert 对应 commit，然后继续 autopilot。
```

### 查看 spec 实施情况

```
读 progress.json 给我 28 个 spec 各自的进度（每个 spec 完成了多少 task / 总 task）。
```

---

## 📝 提示词使用心得

| 场景 | 用哪条 |
|---|---|
| 首次启动（凭证已填） | 上面 🚀 启动提示词 |
| 每次新会话 | 🔄 续作提示词（一句话）|
| 处理完 BLOCKED.md | 🛠 处理 BLOCKED 后续作提示词 |
| 想看进度 | 📊 查看进度提示词 |
| 想休息一下 | ⏸ 暂停提示词 |
| 出了大问题 | 🚨 紧急停止提示词 |

---

## ❓ 常见问答（FAQ）

**Q: 我每次新开会话都要重新粘贴启动提示词吗？**
A: 不用。第一次粘贴 🚀 启动提示词把 mode 改为 autopilot。之后每次新会话只需粘贴 🔄 续作提示词（一句话）即可。

**Q: Codex 半夜自己跑吗？**
A: 不会。Codex 仅在你打开会话时跑。你睡觉它也睡。所以建议白天多开几个会话推进。

**Q: 同时开 2 个 Codex 会话并行吗？**
A: 可以，但**仅当**它们做不同 spec 且不改共享 packages（按"4 个先行"约束）。建议：
- 主会话跑当前阻塞链（如 06 完成前都在 06）
- 副会话跑可并行 spec（如 11/12/13 任意）

**Q: 怎么知道 Codex 是不是真的没问我就自己干了？**
A: 看 git log。如果 Codex 没问就 commit 了，说明它在跑。如果它写了 BLOCKED.md 然后停下，说明触发红线（你看里面写什么再处理）。

**Q: Codex 突然说要选 A 还是 B 怎么办？**
A: 这违反 zero-question 规则。回它一句"按 decision-defaults.md 默认决策，不问我"，它会查表自决。

**Q: 出了 bug 怎么办？**
A: Codex 自己修。它有 [`error-recovery.md`](../steering/error-recovery.md) 12 类 playbook + 失败 3 次自动 blocked。你只看最终的 final-build-report.md 即可。

---

准备好了？打开 Codex / Claude Code，粘贴 🚀 启动提示词，让它跑。


---

## 🚀 V4 升级版启动提示词（2026-05-16 之后用这个）

⬇️ 从下面这行开始复制 ⬇️

```
开始 autopilot 自治循环开发模式（V4）。

V4 核心宪法（必须套用）：
1. 详读 AGENTS.md §3.7 双轨命名 + §3.8 商业宪法 V4（红线 3 + 价值密度自检 + 5 引导按钮）
2. 详读 .kiro/steering/business-theory.md（营销 / 说服学 / 架构 三视角理论叠加）
3. 详读 .kiro/steering/autopilot-rules.md / decision-defaults.md / token-budget.md / self-verification.md / error-recovery.md
4. 详读 docs/decisions/2026-05-16-adr-auto-business-model-v4.md（核心 ADR 锁定 11 项决策）
5. 详读 docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md（双轨命名）
6. 详读 docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md（取消保证金）

启动步骤（不询问任何确认问题）：

1. 读取 .kiro/state/progress.json 把 mode 从 "standby" 改为 "autopilot"，记录 started_at
2. 跑 00-PRE-1 启动检查：读 .env 对照 P0 凭证清单（详见 decision-defaults.md §11）
3. P0 缺失 → 写 BLOCKED.md → mode 改为 "paused" → 结束
4. P0 就绪 → 跑 00-PRE-2 / 00-PRE-3
5. 通过后按 build-order.md 找下一个 pending task（应该是 01-A1）

V4 强制约束（每个 task 必查）：
- 写 prompt 模板时必过价值密度自检表（AGENTS.md §3.8 6 题）
- 写 UI 文案时所有"智能管家"走 i18n（不硬编码）
- 写 AI 输出时含 4 强制要素（免责 + Tier + 信心度 + 5 引导按钮按角色裁剪）
- 写营销 / 推送 / 钩子时套用 Cialdini 6 原则 + AARRR 漏斗 + 防黑暗模式 10 条 SHALL NOT
- 写架构时套用 12-Factor / 事件驱动 / CQRS / Feature Flag / 可观测性 3 支柱

每个 task 主循环：
- LOAD（≤ 8 次工具调用）
- PLAN（不调工具，≤ 5 步）
- CODE（≤ 12 次，≤ 5 文件，≤ 500 行）
- VERIFY（DoD，≤ 6 次）
- COMMIT（conventional commits + V4 标识）
- UPDATE progress.json
- COMPACT（≥ 60% 用量时主动结束会话）

DoD V4 强制额外项：
- AI 输出生成必含 4 要素 + 5 引导（PBT 测试）
- prompt 模板必过价值密度自检（自动校验）
- UI 文案禁硬编码"中介"（grep 检查 0 个）
- 政企版禁海外模型（强制路由检查）

完成 28 spec → 99-FINAL → 生成最终报告 + 等用户验收。

跑起来。
```

⬆️ 复制到此为止 ⬆️
