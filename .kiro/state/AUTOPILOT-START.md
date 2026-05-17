# Autopilot 启动指南（用户用法）

> 给创始人的"使用说明"。任何会话只要你说一句话，Codex / Claude Code 即进入自治循环，直到全部成品出来。

---

## 一、启动 Autopilot（一句话）

打开 Codex / Claude Code 任意会话，输入：

```
开始 autopilot
```

或同义指令：
- `自动开发`
- `loop until done`
- `持续开发`
- `继续 autopilot`

---

## 二、Autopilot 启动后自动做什么

```
[会话 1] 读 progress.json → 发现 mode=standby → 切换为 autopilot
            ↓
        跑 00-PRE-1 / 00-PRE-2 / 00-PRE-3 启动检查
            ↓
        缺凭证 → 写 BLOCKED.md → 结束
        全部就绪 → 进入主循环
            ↓
        读 progress.json → 取下一 task → 实施 → DoD → commit → 更新 progress
            ↓
        上下文 ≥ 60% → 主动结束会话 + 提示"下一会话从 task X 续作"

[会话 2] 你再说"继续" → 自动从 progress.json 续作
[会话 3] ...
[会话 N] 全部 done → 跑 Final DoD → 生成 final-build-report.md → 输出"已完成"
```

---

## 三、你要做的（仅 3 件事）

### 3.1 启动前：填凭证（一次性）

把 [`decision-defaults.md` §11`](../steering/decision-defaults.md) 的 P0 凭证写入 `.env` 文件。缺一个 P0 → Autopilot 第一个会话就会写 BLOCKED.md。

```bash
# 项目根目录
cp .env.example .env
# 编辑 .env 填入：
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
# ALIYUN_DASHSCOPE_API_KEY=sk-...
# OPENROUTER_API_KEY=sk-or-...
# WECHAT_PAY_MCH_ID=...
# WECHAT_MP_APP_ID=...
# ALIYUN_OSS_*=...
# JWT_SECRET=$(openssl rand -hex 64)
# ...
```

### 3.2 推进期：每次新会话只说"继续"

不需要做其他任何事。Codex 会自己：
- 读 progress.json 找下一 task
- 写代码
- 跑测试
- 修 bug
- 提交
- 更新进度
- 结束会话提示你

### 3.3 验收期：全部完成时审阅 final-build-report.md

```bash
cat docs/changelog/{date}-final-build-report.md
```

里面会写：
- 28 spec 实施情况
- 全部测试结果
- blocked 清单 + 原因（如有）
- 已知问题
- 上线前 checklist 进度

---

## 四、特殊情况处理

### 4.1 Codex 写了 BLOCKED.md 怎么办

```bash
cat BLOCKED.md
```

里面会说为什么停了 + 你需要做什么。常见情况：

| BLOCKED 类型 | 你的动作 |
|---|---|
| 缺凭证 | 申请凭证 → 填 .env → 删 BLOCKED.md → 说"继续" |
| 单一 task 失败 ≥ 3 次 | 看 BLOCKED.md 中"推测原因"+ "已尝试修法" → 提供线索 → 删 BLOCKED.md → 说"继续" |
| 触发安全红线 | 严肃审查 → 提供决策（同意 / 拒绝 / 改方案）→ 删 BLOCKED.md |
| 外部 API 异常 | 等供应商恢复 → 说"继续" |

### 4.2 想暂停 Autopilot

会话中说：
```
暂停 autopilot
```

Codex 会把 progress.json 的 mode 改回 `paused`，下次说"继续"时不再自动进入 Autopilot。

### 4.3 想跳过某个 blocked task

直接编辑 `progress.json`：
- 找到该 task 把 `status: "blocked"` 改回 `"pending"`
- 说"继续" → Codex 重试

或永久跳过：
- 改为 `"status": "skipped"` + 写 `"skip_reason": "用户决定不做"`

### 4.4 想看进度

```bash
cat .kiro/state/progress.json | grep -E "done_count|blocked_count|current_task|phase"
```

或直接看 `git log --oneline | head -50` 看 Codex 提交了什么。

---

## 五、约束与预期

### 5.1 工期预期

按 [`design.md` §4.3](../specs/00-project-overview/design.md)，OPC + Codex 主导**约 22-24 周**完成。如果你开多个 Codex 会话并行（不同 spec）可缩短到 **12-15 周**。

### 5.2 单会话耗时

每个 atomic task 约 **15-30 分钟** Codex 实际工作时间。一天 8 小时可推进 **15-30 个 task**。

### 5.3 Token 预算

每个会话 **≤ 200K token**（按 [`token-budget.md`](../steering/token-budget.md) 60% compaction 阈值）。Codex 主动控制不会浪费。

### 5.4 你的工作量

启动后大约 **每 1-2 周**：
1. 看 `git log` + `progress.json` 进度
2. 如有 BLOCKED.md → 处理 → 说"继续"
3. 重大里程碑（每个 phase 完成）→ 跑一次手动验收

---

## 六、为什么这么设计

| 设计 | 理由 |
|---|---|
| 单会话只做 1 task | Codex 上下文限制，多 task 必失忆 |
| progress.json 状态机 | 跨会话传递进度，防失忆 |
| decision-defaults.md | 你不在场时 Codex 知道怎么决策 |
| BLOCKED.md 红线 | 仅在真正必须人工介入时才停 |
| DoD 自检 | 每个 task 通过质量门禁，不堆问题 |
| error-recovery 手册 | 常见失败 Codex 自己修，不烦你 |

---

## 七、第一次启动 checklist

打第一个 Codex 会话前：

- [ ] 已填 `.env` 全部 P0 凭证（[`decision-defaults.md` §11`](../steering/decision-defaults.md)）
- [ ] 已 `git remote add origin git@github.com:...`
- [ ] Docker Desktop 已起
- [ ] Node 22 LTS + pnpm 9 已装
- [ ] 已读本文件 §3 三个动作
- [ ] 已对所有 spec 做最后审阅（重点 04 / 06 / 22 / 24）

全部勾完 → 打开 Codex / Claude Code 工作区 → 输入"开始 autopilot" → 等。

---

## 八、紧急停止

任何时候输入：
```
紧急停止 autopilot
```

Codex 会立即：
1. commit 当前修改
2. 把 progress.json mode 改为 `paused`
3. 不再继续

然后你可以审阅代码，决定如何走。

---

## 九、一切就绪后

启动 Autopilot 即可。Codex 会从 00-PRE-1 开始，一路推到 99-FINAL-3，**~ 230 个 atomic task**，跨**100-200 次会话**完成全部 28 个 spec 的实施 + 测试 + 自纠 + 提交 + 部署准备。

每次新会话你只需输入：

```
继续
```

Codex 自动找进度、读约束、实施、自检、提交、更新进度、结束。
