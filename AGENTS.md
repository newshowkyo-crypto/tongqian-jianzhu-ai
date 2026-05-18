# 同乾方略 · 建筑 AI 经营管家 — Codex / Claude Code 总指令

> 本文件是所有 AI 编码助手（Codex、Claude Code、Cursor、Copilot 等）在本仓库工作时的**最高指令**。
> 每次开始新任务前，AI 助手 **必须** 完整读取本文件，并按规定加载相关上下文。
> 凡与本文件冲突的指令一律以本文件为准。

---

## 1. 项目身份

- **项目代号**：tongqian-jianzhu-ai（同乾方略 · 建筑 AI 经营管家）
- **品牌**：同乾方略
- **产品定位**：服务中国中小型建筑企业的 AI 工具平台 + 同乾方略高端咨询获客器
- **客户群**：建筑企业（主） / 政府 · 央国企 / 智能管家合伙人 / 平台运营
- **商业模式**：月付订阅 + 点数消耗 + 智能管家裂变 + 咨询转化
- **OPC 模式**：极简团队（创始人 + 运维客服 1 + 客户成功 1）+ AI 主导开发 + VPS 部署

---

## 2. 强制工作流（每次任务必须执行）

执行任何代码任务前，按顺序读取以下文件：

```
1.  AGENTS.md（本文件）
2.  .kiro/steering/coding-standards.md
3.  .kiro/steering/security-rules.md
4.  .kiro/steering/api-conventions.md
5.  .kiro/steering/database-conventions.md
6.  .kiro/steering/ai-gateway-rules.md
7.  .kiro/steering/frontend-rules.md
8.  .kiro/steering/ui-ux-rules.md
9.  .kiro/steering/ui-visual-spec.md
10. .kiro/steering/prompt-engineering.md
11. .kiro/steering/testing-rules.md
12. .kiro/steering/git-workflow.md
13. .kiro/steering/memory-management.md
14. docs/architecture.md
15. docs/business-model.md
16. docs/glossary.md
17. 当前任务对应的 .kiro/specs/{module}/requirements.md
18. 当前任务对应的 .kiro/specs/{module}/design.md
19. 当前任务对应的 .kiro/specs/{module}/tasks.md
20. packages/types/ 下相关类型定义
21. docs/decisions/ 下相关 ADR
22. .kiro/codex-quickstart.md（可选 - 速查表）
```

如果记不住完整列表，至少按 .kiro/codex-quickstart.md 速查表执行。

**禁止跳过任何一步**。如某文件不存在，先停下来询问用户是否要创建。

---

## 3. 共享契约（写代码必须遵守的物理边界）

### 3.1 统一类型来源
- 所有 DTO / 枚举 / 错误码 / 权限常量 必须从 `packages/types`、`packages/errors`、`packages/permissions`、`packages/constants` 导入
- **禁止在业务代码里重复定义类型**

### 3.2 数据访问层
- 所有数据库操作必须经 `apps/api/src/database/repository/`
- 禁止在 service 层写裸 SQL
- 禁止在 controller 层直接调 Prisma

### 3.3 AI 调用
- 所有 AI 调用必须经 `apps/api/src/ai-gateway/`
- 禁止业务代码直接调用模型 SDK / API
- 所有 AI 调用必须走"扣点 → 调模型 → 缓存 → 审计"完整流程

### 3.4 权限与租户
- 所有数据查询必须带 4 层 WHERE：tenant_id + scope_type + project_id (if any) + owner_id (if any)
- 禁止跨租户数据访问
- 禁止用 SELECT \* 全量查询

### 3.5 错误处理
- 所有可预期错误用 `packages/errors` 定义的错误类抛出
- 所有错误必须带错误码（按模块前缀分段）
- 禁止 catch 后吞错或仅 console.log

### 3.6 API 契约
- 所有接口必须在 `packages/contracts/openapi.yaml` 定义
- 所有 controller 输入用 `class-validator` / `zod` 强校验
- 所有响应用统一包装：`{ code, data, message, traceId }`

### 3.7 双轨命名（Agent / 智能管家）

**强约束（详见 [`docs/glossary.md` §0`](docs/glossary.md) + [ADR-AUTO-2026-05-16-rename](docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md)）**：

- 代码层（数据库表 / 字段 / API 路径 / TypeScript enum / 目录名 / BR 编号）**保持英文 `agent` 不变**：`agent_profiles` / `AgentSubtype.AGENT_QUAL` / `/api/v1/agents/*` / `apps/agent/` 等。
- 用户可见层（UI 文案 / PDF 报告 / 营销 / 协议 / 邮件 / 公众号 / Prompt 输出）**统一显示"智能管家"**，绝不出现"中介"二字。
- 所有用户可见中文必须经 i18n：`t('agent.title') === '智能管家'`，**SHALL NOT** 在 React 组件 / 模板字符串 / Prompt 模板中硬编码"中介"或"智能管家"。
- spec 自然语言描述（requirements / design / tasks）已统一用"智能管家"，新增条款也必须用"智能管家"。

### 3.8 商业宪法 V4 · 价值优先 / 资源后置（最高约束）

**详见 [ADR-AUTO-2026-05-16-V4](docs/decisions/2026-05-16-adr-auto-business-model-v4.md)**

#### 3 条不可违反红线

**红线 1**：**方案质量 = 100%**（不分免费 / 付费）
- 注册免费 500 点也好，¥999 旗舰也好，每次扣点输出的方案必须达到"如果是律师 / 顾问 / 咨询师做要收 5-10 倍价钱"水平
- 免费用户调用次数有限，但每次输出不打折
- SHALL NOT：故意输出残缺方案诱导找智能管家"补全"

**红线 2**：**智能管家定位 = 线下跑腿 + 关系 + 兜底**
- 不是 AI 方案的解读员 / 补全员
- AI 已给可执行方案，智能管家职责：跑窗口 / 政府关系 / 临场应对 / 失败赔付
- 客户付的服务费是"省时间 + 出关系 + 兜底"，不是"再听一遍 AI 已说过的话"

**红线 3**：**钩子 = 创造价值，不是消耗点数**
- 每个钩子若是付费看的内容，客户必须满意
- SHALL NOT：上瘾机制设计成"心理操纵"
- SHALL NOT：钩子输出价值低于点数成本

#### 价值密度自检表（每个 AI 任务前必过）

每写一个新 AI Prompt 前必须过完这 6 题，过不了就重做或砍掉：

| Q | 标准 |
|---|---|
| Q1 | 客户花的点数 = ¥X，30 点 = ¥0.3 |
| Q2 | 替代外部成本（律师 / 顾问 / 中介）≥ 10x |
| Q3 | 客户感觉花得值 |
| Q4 | 钩子若免费，输出值 ≥ 50-100 点 |
| Q5 | 干货 ≥ 70%，废话 ≤ 30% |
| Q6 | 通用 ChatGPT 给不出（必须用本平台知识库 / 数据 / 模型）|

#### AI 输出强制 4 要素 + 5 引导按钮

**强制 4 要素**（[BR-322 升级](.kiro/specs/00-project-overview/requirements.md)）：
- 免责声明
- Tier 徽章（1-4）
- AI 信心度（高 / 中 / 低）
- 5 引导按钮

**5 引导按钮按角色裁剪**：
- 老板（5 个）：自己执行 / 申请智能管家 / 申请同乾方略 / 人工复核 / 专家咨询
- 智能管家（3 个）：按方案执行 / 推荐给同乾方略 / 平台客服
- 政企（3 个）：自己执行 / 申请同乾方略 / 专家小时咨询
- 员工（2 个）：自己执行 / 上报 OWNER

---

## 4. 任务粒度规则

- 单次任务 **必须 ≤ 2 人天**（约 30 分钟–2 小时一次会话）
- 单次任务 **修改文件数 ≤ 5**（避免改动太散）
- 跨模块改动必须先更新 `packages/types` / `packages/contracts`，再改业务代码
- 完成任务后必须：
  1. 更新对应 `.kiro/specs/{module}/tasks.md` 的勾选状态
  2. 跑 `npm run lint && npm run test` 确保通过
  3. 重要决策写到 `docs/decisions/{date}-{topic}.md`
  4. 重要变更写到 `docs/changelog/`

---

## 5. 命名规范

- 文件名：kebab-case（`user-profile.service.ts`）
- 类名：PascalCase（`UserProfileService`）
- 函数 / 变量：camelCase（`getUserProfile`）
- 常量：UPPER_SNAKE_CASE（`MAX_UPLOAD_SIZE`）
- 数据库表：snake_case 复数（`user_profiles`）
- 数据库字段：snake_case（`created_at`）
- API 路径：kebab-case（`/api/v1/user-profiles`）
- 类型定义：以 `T` 前缀或 DTO / Entity / Vo 后缀（`TUserProfile` / `UserProfileDto`）

---

## 6. 测试要求

- 所有 service 方法必须有单元测试，覆盖率 ≥ 70%
- 所有 controller 必须有 e2e 测试覆盖 happy path + 1 个错误路径
- 测试文件命名：`xxx.service.spec.ts` / `xxx.e2e-spec.ts`
- 禁止 mock 全部依赖（保留至少一层真实调用）

---

## 7. 安全红线（任何情况下不得违反）

- 禁止把 API key / token / 密码 写入代码
- 禁止用 `eval` 或 `Function` 构造函数执行外部输入
- 禁止 SQL 字符串拼接，必须用参数化查询
- 禁止跨租户读写
- 禁止在前端存储敏感信息（卡号 / 身份证 / API key）
- 禁止把用户原文（合同 / 招标文件 / 财务）直接传给海外模型
  - 必须先经 `apps/api/src/ai-gateway/sanitizer/` 脱敏
- 禁止删除审计日志
- 禁止跳过审批流的写操作

---

## 8. AI 调用规范

每次 AI 调用必须：

1. 检查用户点数是否足够 → 不足返回错误
2. 预扣点数（idempotent）
3. 检查缓存（精确缓存 + 语义缓存）→ 命中直接返回，退还预扣
4. 调用模型路由器 → 选主模型 → 失败切兜底
5. 数据出境前先脱敏
6. 记录调用日志（user_id / model / tokens / cost / duration）
7. 写审计日志
8. 实际扣点（idempotent）
9. 返回结果

---

## 9. 数据库变更流程

- 任何 schema 变更必须先改 `prisma/schema.prisma`
- 跑 `prisma migrate dev --name {description}` 生成迁移
- 迁移文件必须可逆（写 down migration）
- 提交时必须包含 schema + 迁移 + 新数据的 seed（如有）

---

## 10. Prompt 工程规范

所有 AI Prompt 模板存放在 `apps/api/src/prompts/{module}/{name}.ts`：

- 必须有版本号（v1 / v2 / ...）
- 必须有变量占位符
- 必须有 fallback 文案
- System prompt 与 User prompt 分离
- 重要 Prompt 在 `.kiro/specs/{module}/prompts.md` 文档化

---

## 11. 提交规范

- Branch: `feature/{module}-{action}` / `fix/{module}-{issue}` / `chore/{description}`
- Commit message 用 [Conventional Commits](https://www.conventionalcommits.org/)：
  - `feat(module): description`
  - `fix(module): description`
  - `refactor(module): description`
  - `test(module): description`
  - `docs(module): description`
  - `chore: description`
- 每次提交必须能独立通过 CI

---

## 12. 上下文管理（防止失忆）

为避免 Codex / Claude Code 在长任务中失忆，遵守：

- 单次会话只做一个任务
- 任务结束后立即写 ADR（如有重大决策）
- 跨任务的状态写到 `docs/decisions/` 或 `docs/changelog/`，**不依赖会话记忆**
- 每个模块完成后写 `apps/api/src/{module}/README.md` 总结

---

## 13. 禁止行为清单

❌ 跳过任何强制工作流步骤
❌ 在业务代码重复定义共享类型
❌ 直接调用模型 SDK，绕过 AI Gateway
❌ 写裸 SQL，绕过 repository
❌ 跨租户数据访问
❌ 把用户原文传海外模型不脱敏
❌ 把 API key / 密钥 写代码
❌ 用 eval / Function 构造函数
❌ 删除审计日志
❌ 跳过审批流的写操作
❌ 单次任务超过 2 人天 / 5 个文件
❌ 没跑测试就提交

---

## 14. 紧急情况

如果遇到以下情况，停下来询问用户：

- 任务超出 spec 范围
- 需要做架构级决策（新加模块 / 改数据流向）
- 发现 spec 间冲突
- 发现现有代码与 spec 不符
- 发现安全或合规风险
- 任何不确定如何取舍的情况

**不要自作主张**。问完用户后把答案写到 `docs/decisions/`。


---

## 15. Autopilot Mode（自治循环开发，最高优先级开关）

### 15.1 进入条件

满足任一即进入 Autopilot：
- 用户输入 **"开始 autopilot"** / **"自动开发"** / **"loop until done"** / **"持续开发"**
- `.kiro/state/progress.json` 中 `mode = "autopilot"`

### 15.2 Autopilot 下的根本规则变化

**原规则 §14 紧急情况要求停下问用户的 6 类情况**，在 Autopilot 模式下改为：

| 情况 | 普通模式 | Autopilot 模式 |
|---|---|---|
| 任务超出 spec 范围 | 停下问 | 写 ADR-AUTO + 自行扩 spec + 继续 |
| 架构级决策 | 停下问 | 查 [`decision-defaults.md`](.kiro/steering/decision-defaults.md) → 仍无 → 最简方案 + ADR |
| spec 间冲突 | 停下问 | 以顶层 [`design.md`](.kiro/specs/00-project-overview/design.md) §5 BR 映射表为准；仍冲突写 ADR |
| 现有代码与 spec 不符 | 停下问 | 以 spec 为准修代码 + 写 changelog |
| 安全或合规风险 | 停下问 | **不变，仍停下** + 写 BLOCKED.md |
| 不确定如何取舍 | 停下问 | 走 [`autopilot-rules.md` §6 fallback 链](.kiro/steering/autopilot-rules.md) |

### 15.3 Autopilot 强制 6 文件协议

进入 Autopilot 后必读且必遵：

| # | 文件 | 作用 |
|---|---|---|
| 1 | `.kiro/steering/autopilot-rules.md` | 自治循环规则（核心） |
| 2 | `.kiro/steering/decision-defaults.md` | 歧义默认表 |
| 3 | `.kiro/steering/token-budget.md` | 上下文加载策略 |
| 4 | `.kiro/steering/self-verification.md` | DoD 自检 |
| 5 | `.kiro/steering/error-recovery.md` | 失败修复 playbook |
| 6 | `.kiro/state/build-order.md` + `progress.json` | 任务编排 + 进度 |

### 15.4 单会话契约（最重要）

每个会话只做：
1. **1 个** atomic task（来自 progress.json）
2. **≤ 5** 个文件修改
3. **≤ 500** 行新增 / 修改
4. **≤ 30** 次工具调用
5. **必须** commit + push + 更新 progress.json
6. **必须** 主动结束会话（说"已完成 task X，下一会话从 task Y 续作"）

**SHALL NOT**：
- 不询问用户（除非 BLOCKED 类红线）
- 不批量做多个 task
- 不撑到上下文炸掉才停
- 不跳过 DoD

### 15.5 退出 Autopilot

满足任一即退出（mode 改回 standby）：
- progress.json 全部 task ∈ {done, blocked} 且 blocked ≤ 5 → 自动进 99-FINAL
- 用户输入 **"暂停 autopilot"** / **"停"**
- 触发 BLOCKED 类红线 → 自动进 paused 等用户介入

---


---

## 16. 全局阻塞预防（2026-05-17 新增  最高优先级）

Autopilot 模式下额外必读：

- `.kiro/state/CODEX-ANTIBLOCK-INSTRUCTIONS.md`  5 类常见阻塞  5 类标准处理
- `docs/decisions/2026-05-17-adr-auto-global-block-prevention.md`  全 spec mock/defer 标准化清单
- `docs/decisions/2026-05-17-adr-auto-defer-01-I2.md`  01-I2 推迟到 W4 的具体决策

核心规则：

1. P1 凭证缺失  mock provider，admin 后台后期一键替换
2. 真实部署 / staging / 灰度  推迟到 99-FINAL 或对应 milestone
3. 专家内容 / 真客户案例  placeholder seed + admin 后台 content 管理替换
4. 法律 / 合规 / 备案 / 律师  deferred 不阻塞代码
5. Husky / Docker / 端口 / 域名 / 爬虫 工具问题  --no-verify / 跳过 / 用 fixtures

SHALL NOT：写 BLOCKED.md（除真触发 security-rules 红线）；改 mode 为 paused（除上下文  60% 主动结束）；询问用户；因外部依赖暂停。

用户最高权限授予 Codex 自行决定 mock / defer / placeholder 处理路径，自行写 ADR_AUTO 留档，自行用 --no-verify 绕过工具问题，一次性跑完 530 任务到 99-FINAL。
