# ADR-AUTO-2026-05-16-IMPROVEMENTS：4 项改进打包升级

**日期**：2026-05-16
**决策人**：创始人（启动开发前最后一次升级）
**状态**：accepted（基于 ADR-AUTO-2026-05-16-V4 之上的增量改进）

## 背景

V4 商业宪法定稿后，对系统落地率与爆款概率做客观评估，得出 4 项改进：
1. 增加"智能管家代理人"角色（强化变现）
2. M1-M4 期间由你团队咨询专家亲自写核心 Prompt（一期不动，二期 W4-W8 提醒）
3. M3 上线前办内测客户晚宴（你团队已有计划）
4. 必加专家黄金测试集（CI/CD 集成）

同时一并执行：
- 火山方舟移除（用户已有 DeepSeek 直连，避免双备份冗余）
- 准备清单精简（开发期 P0 凭证 ≤ 8 项）

## 决策 1：智能管家代理人角色（PARTNER）

### 角色定义

```
智能管家代理人 PARTNER  ←  新增的智能管家子类型
  - 不亲自服务（不接派单）
  - 不参与培训（不强制）
  - 仅推荐建筑老板 / 推荐其他智能管家 / 推荐高端客户给同乾方略
  - 信誉低不影响（因为不接单）
  - 实名 + 简历认证
```

### 与现有 4 子类型并列

`AGENT_QUAL` / `AGENT_TENDER` / `AGENT_FIN` / `AGENT_GENERAL`（接单类）+ `AGENT_PARTNER`（仅推荐类）= 5 子类型。

### 分润规则（与原有完全自洽，不破坏 BR-301~305）

| 推荐类型 | PARTNER 拿什么 | 与原有规则 |
|---|---|---|
| 推荐建筑老板首年订阅 | **5% 永久分润** | 现有 BR-302 30%/20%/15% 规则不变，PARTNER 拿 5% 是新加的（不冲突） |
| 推荐建筑老板充值流水 | **3% 永久分润** | 同上 |
| 推荐其他智能管家加盟（包括其他 PARTNER）| **永久 5% 分润 + 首笔 ¥100 一次性** | 比 BR-305 老智能管家推荐新智能管家的 10% / ¥200 略低（合理：因为 PARTNER 不投入培训）|
| 推荐高端客户给同乾方略（B 类）| **5% 推荐费** | 比 BR-313 归属智能管家 10-15% 低（合理：因为是 PARTNER 不是归属）|

### 与"归属智能管家"的关系（关键防冲突）

```
场景：客户 X 由 PARTNER 老王推荐注册 → 此时无"归属智能管家"
   ↓
   后续客户 X 产生 A 类资质需求 → 走派单（公开池或客服分配）
   ↓
   分到智能管家小李（归属）→ 永久绑定到小李（BR-102）
   
分润流向：
   - 客户 X 月费 ¥199
   - 老王（PARTNER 推荐者）拿 5% × ¥199 = ¥9.95
   - 小李（接单归属）拿 30% × ¥199 = ¥59.7
   - 平台净拿 65% × ¥199 = ¥129.35
   - 总和 100%，与原有 BR-302 自洽
```

### 反作弊机制（防 PARTNER 当二道贩子刷单）

1. PARTNER 推荐客户 → 实名 + 同手机 / IP / 设备指纹 5 维去重（与现有反薅一致）
2. PARTNER 推荐的客户在 30 天内必须有真实付费 / 调用 → 否则推荐失效
3. PARTNER 一年最多推荐 50 个老板 + 20 个智能管家（防刷量）
4. PARTNER 信誉分独立计算（仅记推荐成功率 + 客户活跃度）
5. PARTNER → PARTNER 二级封顶（不允许 PARTNER 推荐 PARTNER 再推荐 PARTNER 的三级链）

### Tier 阈值不变

PARTNER 不接单 → 不存在 Tier 1/2/3 输出深度问题。

### 后台管理（24-admin-console R22 新增）

```
平台后台 → 智能管家管理 → 子类型筛选
   - AGENT_QUAL / TENDER / FIN / GENERAL（接单类）
   - AGENT_PARTNER（推荐类）
PARTNER 列表展示：
   - 实名 + 推荐数 + 转化率 + 累计分润 + 一票否决次数
   - 一键查看推荐链（最近 90 天）
```

### 一期 / 二期分期

- **一期 M1-M3**：核心 4 接单子类型（不开 PARTNER）
- **二期 M4 起**：开放 PARTNER 注册（先小范围邀请制 50 人内测）
- **三期 M7 起**：完全开放

### Spec 改动

- `00-project-overview` BR-004 升级（5 子类型）
- `06-auth-rbac` AgentSubtype enum 加 `AGENT_PARTNER`
- `22-agent-workspace` R12 新增 PARTNER 模块（推荐链 + 分润 + 反作弊）
- `24-admin-console` R22 新增 PARTNER 管理工作台

## 决策 2：核心 Prompt 由专家亲自写（M1-M4 提醒）

### 时间表

| 阶段 | 周次 | 行动 |
|---|---|---|
| 一期开发 W1-W4 | Codex 写 Prompt 框架（结构 / schema / few-shot 模板）| 不强制内容质量 |
| 一期开发 W4-W8 | **专家亲自写 5-10 个核心 Prompt 实际内容** | 合同审查 / 标书框架 / 资质升级 / 资金匹配 / 早安简报 |
| 一期开发 W8-W12 | 剩下 20+ Prompt 由 Codex 仿照核心 Prompt 写 | 必过专家黄金测试集 |

### 核心 Prompt 优先级（专家投入的 5-10 个）

```
P1：合同审查（基础版 + 专业版） M7
P2：标书框架（商务标 + 技术标） M8
P3：资质升级路径 M9
P4：政策性资金匹配引擎 M10
P5：早安 AI 简报 M5
P6：AI 老板助理 4 性格 prompt M5
P7：催款函（按账龄分级） M6
P8：合同修改意见函 M7
P9：决策小测（含 50 个真实案例） M6
P10：标书员每日真题（含 100 道题）M6
```

### 落地

写进 `docs/owner-preparation-checklist.md` 的 M 段（已含），增加 **W4 提醒触发器**：Codex 跑到对应 task 时自动发 BLOCKED.md（"等待专家提供 Prompt 内容"）让你来填。

## 决策 3：M3 内测客户晚宴（你团队已有计划）

不写进 spec，但写进 `docs/owner-preparation-checklist.md` 的 H4 段（你的招募计划），加一条：

```
H5 · M3 上线前办"建筑业经营趋势论坛"（内测客户晚宴）
   - 时间：M3 上线后 2 周内
   - 规模：50-80 位武汉建筑业老板
   - 同乾方略团队 1 小时分享 + 平台 demo + 现场签约
   - 预算 ¥30,000-50,000
   - 转化率目标 ≥ 30% → 启动期 15-20 个标杆客户
```

## 决策 4：专家黄金测试集（CI/CD 集成）

### 测试集结构

```
.kiro/golden-test-sets/
├── contract-review-pro/
│   ├── case-001.json    {input, expected_output, expert_score, tags}
│   ├── case-002.json
│   └── ... 10 个案例
├── tender-framework/
│   ├── case-001.json
│   └── ... 10 个案例
├── qualification-upgrade/
│   ├── ... 10 个
├── policy-fund-match/
│   ├── ... 10 个
└── morning-briefing/
    └── ... 10 个

每个案例 JSON 格式：
{
  "input": { 真实合同 / 招标 / 资质场景，已脱敏 },
  "expected_output": { 专家给的标准答案，结构化 },
  "expert_id": "专家姓名",
  "expert_score_baseline": 90,  // 专家自己给标杆答案打分
  "min_passing_similarity": 0.7,  // AI 输出与标杆 ≥ 70% 相似才算通过
  "tags": ["high-risk", "construction", "wuhan"]
}
```

### 测试运行

```bash
# 每次 prompt 改动 → CI 自动跑
pnpm test:prompts
   ↓
   遍历每个 .json 案例
   ↓
   跑当前 Prompt → 拿 AI 输出
   ↓
   semantic-similarity 计算 ≥ 0.7
   ↓
   ≥ 70% 案例通过 → CI 绿
   < 70% → CI 红 + 阻止合并
```

### Spec 改动

- 新增 `.kiro/specs/29-prompt-testing/`（轻量子 spec）：
  - `requirements.md`：黄金测试集规则
  - `design.md`：实现架构（语义相似度 + CI 集成）
  - `tasks.md`：分阶段实现 task

> 用编号 29 不破坏 28 spec 体系（28 是合规总审收尾，29 是横向 QA）。

### 与既有 PBT 的关系

- PBT（fast-check）：测**结构正确性**（输出含 4 要素 + schema 校验）
- 黄金测试集：测**内容质量**（与专家答案相似度）
- 两者并存，不冲突

## 决策 5：火山方舟移除

### 动机

用户已有 DeepSeek 直连 API → 火山方舟方舟提供的也是 DeepSeek + 豆包 → 双备份冗余 → 一期上线复杂度增加。

### 改动

- `decision-defaults.md` §6：移除"火山方舟"作为兜底
- `04-ai-gateway` Provider 4 个 → 3 个：阿里百炼 + OpenRouter + DeepSeek 直连
- `owner-preparation-checklist.md` B2：移除"火山方舟"

### 模型路由调整

| 任务 | 主模型 | 备模型 | 说明 |
|---|---|---|---|
| 短对话 | Qwen-Plus（百炼）| DeepSeek-Chat（DeepSeek 直连）| |
| 长对话 | Qwen-Max（百炼）| DeepSeek-V3（DeepSeek 直连 / OpenRouter）| |
| 合同审查（专业 / 出境）| Claude Sonnet（OpenRouter）| Qwen-Max（百炼）| |
| 资质 / 招标分析 | Qwen-Max（百炼）| DeepSeek-V3 | |
| 多模态（图纸 / OCR）| Qwen-VL-Max（百炼）| GPT-4-Vision（OpenRouter）| |

## 影响

### 代码层
- 新增 `AgentSubtype.AGENT_PARTNER` enum + 数据库 migration
- 新增 `prompt-golden-test/` 测试套件 + CI 集成
- 移除 火山方舟 provider 类（保留接口但不注册）
- 新增 PARTNER 反作弊规则（5 维去重 + 30 天活跃 + 限额）

### 商业层
- 新增 PARTNER 推荐通道（二期上线）
- 核心 Prompt 由专家写（一期 M1-M4 流水线）
- 黄金测试集成为 Prompt 质量护城河

### 上线
- W4：Codex 跑到合同审查时停下，等专家给 5-10 核心 Prompt 内容
- M3：晚宴启动期招募
- M4：PARTNER 推荐通道开放

## 后续

1. 30+ Prompt 模板由你团队 + 同乾方略咨询专家配合写
2. 黄金测试集每个 Prompt 10 个案例（共 300 个案例待打）
3. M3 内测晚宴排期
4. M4 PARTNER 推荐通道灰度开放


---

## 决策 6：8 个重大漏洞修补（V4 IMPROVEMENTS 完整版）

### 漏洞清单与修补位置

| # | 漏洞 | 修补位置 |
|---|---|---|
| 1 | 运营成本"虚增"控制 | BR-903 / 24-spec R24 / 04-spec R12 |
| 2 | 客户首单 Onboarding 用户旅程 | 26-spec R17（5 触点）/ Day 1 / 7 / 30 |
| 3 | 客服话术 / SOP 兜底 | owner-checklist T 段（≥ 100 条）+ U 段（4 步走）|
| 4 | 报告反盗版水印 | 10-spec R11（客户姓名水印 + 扫码核销 + 5 设备限）|
| 5 | 智能管家私下交易反作弊 | 22-spec R17（关键字检测 + 月外联限 + 黑名单 + 双向举报）|
| 6 | AI 成本"飙升"自动降级 | BR-904 / 04-spec R12（三级阈值 + 价值优先告知）|
| 7 | 案例市场抄袭 / 拼凑 / 自买刷量 | 22-spec R11 升级（语义相似度 ≥ 0.85 视为抄袭）|
| 8 | 测试 fixtures / Mock / Seed 体系 | 02-spec R5（packages/test-fixtures + 50+ 真实场景）|

### 实施 BR / Requirement 编号

新增：
- BR-903 运营成本红线 4 条
- BR-904 单客户 AI 成本上限自动降级（三级阈值）
- 02-spec R5 测试 fixtures 体系
- 04-spec R12 AI 成本上限 + 自动降级
- 10-spec R11 报告反盗版水印
- 22-spec R17 私下交易反作弊
- 22-spec R11（升级）抄袭检测细化
- 24-spec R24 运营成本红线仪表盘
- 26-spec R17 Onboarding 用户旅程

新增任务：
- 02-IMP-1~10（测试 fixtures，10 个）
- 04-IMP-1~7（成本上限，7 个）
- 10-IMP-1~5（报告反盗版，5 个）
- 22-IMP-12~16（私下交易反作弊，5 个）
- 24-IMP-5~7（运营成本仪表盘，3 个）
- 26-IMP-1~9（Onboarding，9 个）
- **共 39 个 V4 IMPROVEMENTS 漏洞修补任务**

### 总 V4 IMPROVEMENTS 任务数

```
PARTNER 角色：22-IMP-1~11 = 11 任务
PARTNER 后台：24-IMP-1~4 = 4 任务（已写）
专家黄金测试集：29-A1~A8 = 8 任务（独立 spec）
8 漏洞修补 = 39 任务

合计 V4 IMPROVEMENTS = 62 个新增任务
```

### 与 V4 主 ADR 的关系

| ADR | 内容 |
|---|---|
| ADR-V4 | 商业宪法 / 5 大杀手锏精细化 / 8 个 P1-P8 补丁 |
| ADR-V4-IMPROVEMENTS（本 ADR）| PARTNER + 专家测试集 + 8 漏洞修补 + 火山方舟移除 |

两份 ADR 不冲突，IMPROVEMENTS 是 V4 上的增量补丁。
