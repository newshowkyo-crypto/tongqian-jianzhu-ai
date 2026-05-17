# Autopilot 构建顺序（Codex 严格按此推进）

> 本文件是 Autopilot 模式下的**任务编排清单**。Codex 每次会话从 [`progress.json`](./progress.json) 读当前 task → 在本文件找上下文 → 实施。
>
> 总 task 数：**~ 230 个 atomic task**（28 个 spec 累加）。按 [`design.md` §4 依赖图](../specs/00-project-overview/design.md) 严格串/并行约束。

## 总览

| 阶段 | Spec 范围 | 任务数 | 串/并行 |
|---|---|---|---|
| 0 | 启动检查 | 3 | 串行 |
| 1 | 基础设施 01-05 | 79 | 部分串行（01 阻塞，02/03/05 可并行，04 后置）|
| 2 | 商业核心 06-10 | 50 | 强串行（06 → 07∥08 → 09 → 10）|
| 3 | 杀手锏 + 补充 11-19 | 81 | 9 个 spec 全并行 |
| 4 | 知识 + 规则 20-21 | 18 | 2 个 spec 并行（与阶段 3 并行）|
| 5 | 工作台 22-24 | 44 | 22 优先 → 24；23 与 22 并行 |
| 6 | 横向 25-27 | 24 | 25 → 26 → 27 串行 |
| 7 | 合规 28 | 10 | 单串 |
| **合计** | | **~ 230** | |

## 阶段 0：启动检查（3 个 task）

> 任何实施前**必须**完成。失败则 BLOCKED。

| ID | Task | 验收 |
|---|---|---|
| 00-PRE-1 | 检查 P0 凭证（`.env` 中所有 [`decision-defaults.md` §11](../steering/decision-defaults.md) 列项）| 缺则写 BLOCKED.md 停 |
| 00-PRE-2 | 检查 Docker / pnpm / Node 22 已安装 | `docker --version` / `pnpm --version` / `node --version` 全过 |
| 00-PRE-3 | 检查仓库已 git init + 远程已配置 | `git remote -v` 有输出 |

## 阶段 1：基础设施（79 task，~3 周）

### 1.1 01-infra-monorepo（35 task，**必须最先**）

按 `01-infra-monorepo/tasks.md`：A1-A5 / B1-B5 / C1-C5 / D1-D4 / E1-E4 / F1-F4 / G1-G3 / H1-H3 / I1-I2

**关键依赖**：
- A1（pnpm + turbo）→ A2（TS + ESLint）→ A3（packages 占位）→ A4（apps 占位）→ A5（prisma 骨架）
- B1（docker-compose）→ B2（hello-world）→ B3-B5
- C-I 在 A-B 完成后并行

### 1.2 02-shared-contracts（22 task）+ 03-design-system（14 task）+ 05-windows-desktop（8 task）并行

> [`01`] B 完成后才能开 02 / 03 / 05。

**02-shared-contracts**：A1a → A1b → A2a∥A2b → A3a∥A3b → A4 → A5 → B1-B3 → C1-C3 → D1a∥D1b∥D2 → E1-E3 → F1∥F2 → G1

**03-design-system**：A1-A3（tokens + tailwind + 字体）→ B1-B3（primitives）→ C1-C2 → D1 → E1-E3 → F1 → G1（Storybook P2 可后置）

**05-windows-desktop**：A1-A8（接续 [`01`] G）

### 1.3 04-ai-gateway（18 task，**关键阻塞**）

> [`02`] 完成后才能开。

A1-A2 → B1-B2 → C1-C2 → D1-D3 → E1-E3 → F1 → G1-G2 → H1-H2 → I1

## 阶段 2：商业核心（50 task，**强串行**）

### 2.1 06-auth-rbac（16 task，强阻塞）

A1-A3 → B1-B3 → C1-C2 → D1-D2 → E1-E2 → F1-F2 → G1 → H1

### 2.2 07-subscription（10）+ 08-credit（9）并行 → 09-payment（11）→ 10-report-center（9）

```
06 完成 → 07 ∥ 08 → 09 → 10
```

## 阶段 3：杀手锏 + 补充（81 task，**全并行**）

11-15（5 大杀手锏 ~46 task）+ 16-19（4 个补充 ~28 task）= 81 task

> 04 + 10 完成后开。9 个 spec 之间互不依赖（按 [`design.md` §4.6 关键依赖摘要`](../specs/00-project-overview/design.md)），可由不同会话/分支并行。

| Spec | task 数 | 关键 |
|---|---|---|
| 11-opportunity-radar | 9 | A1-A9 |
| 12-tender-factory | 10 | A1-A10 |
| 13-risk-review | 8 | A1-A8 |
| 14-qualification-guard | 10 | A1-A10 |
| 15-ops-toolkit | 8 | A1-A8 |
| 16-project-site | 8 | A1-A8 |
| 17-cost-estimate | 6 | A1-A6 |
| 18-drawing-recognition | 6 | A1-A6 |
| 19-cashflow-finance | 8 | A1-A8 |

## 阶段 4：知识库 + 规则（18 task，与阶段 3 并行）

| Spec | task 数 |
|---|---|
| 20-knowledge-system | 10 |
| 21-rules-engine | 8 |

## 阶段 5：工作台（44 task）

### 5.1 22-agent-workspace（22 task，**核心模块**）

A1-A3 → B1-B3 → C1-C5 → D1-D2 → E1-E4 → F1-F3 → G1-G2 → H1-H3

### 5.2 23-gov-soe-workspace（9）∥ 24-admin-console（14）

```
22 大部分完成 → 23 ∥ 24
```

## 阶段 6：横向能力（24 task，**串行**）

```
25-ai-chat-hub (8) → 26-addiction (8) → 27-notification (8)
```

## 阶段 7：合规总审（10 task）

```
28-security-compliance（A1-A10）
```

## 阶段 8：Final 验收（3 个 task）

| ID | Task | 验收 |
|---|---|---|
| 99-FINAL-1 | 跑 [`autopilot-rules.md` §11](../steering/autopilot-rules.md) Final DoD | 全过 |
| 99-FINAL-2 | 生成 `docs/changelog/{date}-final-build-report.md` | 含 28 spec 实施情况 + blocked 清单 |
| 99-FINAL-3 | 输出 final 报告 + 等待用户验收 | 提示用户 |

## 任务 ID 命名约定

```
{spec_no}-{phase}{order}
├── 04-A1     # 04-ai-gateway 的 Phase A 任务 1
├── 22-H3     # 22-agent-workspace 的 Phase H 任务 3
├── 02-A1a    # 22-shared-contracts 的 Phase A 拆分子任务
├── 00-PRE-1  # 启动检查
└── 99-FINAL-1  # 最终验收
```

## 并行执行策略

> Codex 单 IDE 不支持真并行。但可由人类创始人开**多个 Codex 会话同时跑不同 spec**：
> - 主会话：跑当前阻塞链（如 06 完成前所有人停在 06）
> - 副会话：跑可并行 spec（如 11-19 任意一个）
>
> **强约束**（[`memory-management.md` §11`](../steering/memory-management.md) "4 个先行"）：
> - 共享 types / errors / packages 仅由主会话改
> - 副会话仅改自己 spec 的代码
> - 写 prisma migration 仅主会话

## 跳过 / 阻塞规则

```
progress.json 中：
  blocked task 跳过（不重试）
  partial task 当前会话续作
  pending task 按本文件顺序选下一个
```

## 阶段切换条件

每个阶段全部 task done 才进下一阶段。例外：
- 阶段 3 / 4（11-19 + 20-21）允许内部 task 并行，但**整体未全过不能进阶段 5**
- 阶段 5 中 22 必须先于 24

## 单会话推进流程

```
1. 读 progress.json
2. 找第一个 status 不是 done/blocked 的 task
3. 在本文件确认是否符合阶段约束（前置阶段是否全过）
   - 不符合 → 跳此 task，找下一个
4. 加载该 task 所属 spec 的相关章节（按 token-budget §2）
5. PLAN → CODE → VERIFY（按 self-verification）→ COMMIT → UPDATE progress
6. 主动结束会话，输出"已完成 task X，下一会话从 task Y 续作"
```

## 异常情况

| 情况 | 处理 |
|---|---|
| 当前 task 依赖的 spec 还没写 design | 不应该发生（spec 都已完成）；查 README.md 验证 |
| 阶段切换发现前面 spec 不完整 | 回头补；progress.json 标记当前 task pending |
| 发现 spec 有错（与既有代码冲突）| 修 spec → 写 ADR → 再实施 |
| 发现 task 超出 5 文件 / 500 行 | 当前会话只做能做的部分 → commit partial → 拆 task 到下一会话 |

## 完成判定

```
progress.json 的 done count + blocked count == total task
且 blocked count ≤ 5
→ 进 99-FINAL
```

## 重要提醒

- ❗ **不允许** Codex 自己跳着做（如 22 没完成跑去做 24）
- ❗ **不允许** 一个会话做多个 task
- ❗ **不允许** 跳过 DoD 直接 commit
- ❗ **必须** 每完成 1 个 task 立即更新 progress.json
- ❗ **必须** 每完成 1 个 task 立即 git commit + push
