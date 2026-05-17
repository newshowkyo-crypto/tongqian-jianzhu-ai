---
inclusion: always
---

# Token 预算与上下文管理（Autopilot 强约束）

> Codex / Claude Code 单会话上下文有限（128K-200K token）。本文件规定如何**最少化读取**，避免 token 烧完任务做不完。

## 1. 总预算分配（按 200K token 模型估算）

| 用途 | 上限（token）| 累计占比 |
|---|---|---|
| 系统约束（AGENTS.md + always inclusion 的 steering）| 30K | 15% |
| 当前 task 必读（spec 三件套相关章节 + state）| 40K | 35% |
| 实施时读已有代码 + 写新代码 | 80K | 75% |
| 测试 + 自检 + 修复缓冲区 | 30K | 90% |
| 安全余量 | 20K | 100% |

**触发 compaction 阈值：60%**（120K）→ 立即 commit + 结束会话（[`autopilot-rules.md` §8](./autopilot-rules.md)）。

## 2. 上下文加载优先级（每次新 task 严格按序）

```
Tier 0（always loaded by IDE，~ 30K）：
  - AGENTS.md
  - autopilot-rules.md
  - decision-defaults.md
  - token-budget.md（本文件）
  - self-verification.md
  - error-recovery.md

Tier 1（必读，~ 5K）：
  - .kiro/state/progress.json（找当前 task）
  - .kiro/state/build-order.md（找当前 task 段，~1K）

Tier 2（按 task 加载，~ 20K）：
  - 当前 task 所属 spec 的 requirements.md（仅相关 Requirement 段）
  - 当前 task 所属 spec 的 design.md（仅相关章节）
  - 当前 task 所属 spec 的 tasks.md（仅本 task 段）

Tier 3（按需读，~ 10K）：
  - 当前 task 直接依赖的 packages/types/{domain}/*.ts
  - 当前 task 直接依赖的 packages/errors/codes.ts 中相关行
  - 既有相同模式的代码（grep 找到的 1-2 个文件作为参考）

Tier 4（仅遇到歧义时按 decision-defaults §6 顺序读）：
  - 对应 steering 文件的相关章节
```

## 3. Steering 文件按需读取规则（不全读）

| 任务类型 | 必读 steering 章节 |
|---|---|
| 后端 API 实施 | api-conventions §1-§5 + coding-standards §3-§7 |
| 后端 service 实施 | coding-standards 全部 + security-rules §1-§3 |
| 数据库 schema 改动 | database-conventions §1-§7 |
| AI Gateway 调用 | ai-gateway-rules（仅看相关任务）|
| 前端组件 | frontend-rules §6 + ui-ux-rules §5-§7 |
| 前端页面 | frontend-rules §2-§4 + ui-visual-spec §6（对应页面）|
| 测试代码 | testing-rules §3-§5 |
| Prompt 实施 | prompt-engineering 全部（≤ 5K）|
| Git 提交 | git-workflow §2 |

❌ **禁止行为**：
- 一次读 13 份 steering 全文（30K+ 浪费）
- 一次读 28 份 spec 三件套（300K+ 直接炸）
- 重复读已知不变的内容
- 在已加载内容已足够时仍补读

## 4. 文件读取策略（读什么、读多少）

### 4.1 大文件（> 500 行）只读相关章节

| 文件 | 默认起始读取章节 |
|---|---|
| `00-project-overview/design.md` | §5 BR 映射表 + §11 packages 关系 |
| `00-project-overview/design-flows.md` | 当前 task 涉及的流程章节 |
| `00-project-overview/design-protocols.md` | §10 多租户 + 附录 A 协议 |
| `prisma/schema.prisma` | grep 涉及的 model |
| `packages/contracts/openapi.yaml` | grep 涉及的 path |

❗ **绝对禁止 readFile 的 skipPruning=true 用于 > 500 行文件**（除非你确认要全文）。

### 4.2 grep 优先于 readFile

判断标准：
- 找符号定义 → grepSearch
- 找引用关系 → grepSearch
- 看具体实现 → readFile（仅相关行）
- 全文阅读 → 仅 < 200 行的小文件

### 4.3 readMultipleFiles 比循环 readFile 更省

每次最多 readMultipleFiles 5 个相关文件。

## 5. 写文件策略

| 操作 | 工具 | 限制 |
|---|---|---|
| 新建 < 50 行 | fsWrite 一次完成 | 直接写完 |
| 新建 50-300 行 | fsWrite 创建骨架 + fsAppend 追加段落 | 分段写 |
| 修改 ≤ 5 行 | strReplace | 单次替换 |
| 修改 > 5 行（多块）| 多个 strReplace 连发 | 各块独立 |
| 重命名 | smartRelocate | 自动更新 import |
| 重构跨文件 | semanticRename | 自动改全部引用 |

❌ **禁止**：
- 用 fsWrite 改已存在大文件（覆盖丢失上下文）
- 用 fsAppend 添加内容到错误位置（用 strReplace 精确插入）

## 6. 工具调用次数预算

| 阶段 | 上限 |
|---|---|
| LOAD（读取上下文）| ≤ 8 次 |
| PLAN（不调工具）| 0 |
| CODE（写代码）| ≤ 12 次 |
| VERIFY（执行测试 / 检查）| ≤ 6 次 |
| COMMIT（git 操作）| ≤ 4 次 |
| **单 task 总上限** | **≤ 30 次** |

超限即 commit 半成品 + 结束会话。

## 7. 会话级缓存（避免重复读）

每个会话维护一个**心智模型**：
- 已加载文件 + 摘要（30 字内）→ 不重读
- 已知 BR 编号 + 实现位置 → 不重查
- 已知错误码命名空间 → 不重查

**SHALL NOT** 重复 grep 同一查询超过 2 次。

## 8. Token 节省 10 个技巧

1. ✅ 读 spec 时用 grepSearch 找到行号 → readFile 精确范围
2. ✅ 读 prisma model 时只读相关 model（用 grepSearch model XYZ + 上下 30 行）
3. ✅ 写代码时直接写完整版本，不分多次小改
4. ✅ 写测试时复用已有 fixture，不重复构造
5. ✅ 修 bug 时先 grep 错误信息字符串定位
6. ✅ DoD 失败先看 [`error-recovery.md`](./error-recovery.md) 而不是重读 spec
7. ✅ Build 失败用 `pnpm typecheck` 单独跑（比 `pnpm build` 省 token）
8. ❌ 不要复述 spec 给自己听
9. ❌ 不要在 plan 阶段重复 spec 已说的内容
10. ❌ 不要把整个文件 echo 到对话窗口

## 9. 跨会话信息流（防失忆）

会话之间通过 4 个介质传递：
- `progress.json`：每个 task 的状态 + next_action
- `git log`：commit message 含 task id + DoD 结果
- `docs/changelog/{date}.md`：重大变更
- `docs/decisions/{date}-*.md`：ADR

**SHALL NOT** 依赖会话内记忆传给下一会话——上下文一定丢。

## 10. 紧急救援（token 即将耗尽）

当上下文 ≥ 70%：
1. 立即停手
2. 把当前修改 commit（即使不完整）
3. 在 progress.json 写：
   - `status: partial`
   - `next_action: "实施 X 的 Y 部分"`
   - `last_completed_step: "已完成 schema 设计，待实施 service"`
4. 输出"已 commit 半成品 task X，下一会话从此续作"

绝不在 ≥ 80% 时还硬撑。
