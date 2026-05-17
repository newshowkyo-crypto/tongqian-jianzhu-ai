# ADR-AUTO-2026-05-16：用户可见层"中介"统一改为"智能管家"

**日期**：2026-05-16
**决策人**：创始人（品牌升级）
**状态**：accepted

## 背景

"中介"在中文语境里有低端 / 倒卖 / 信息差的负面联想，与同乾方略品牌定位（建筑业高端咨询 + 战略陪伴）严重不符。建筑业老板看到"中介"会本能拒绝高单价合作。需要换一个更高级、更体面的称呼。

## 决策

**所有用户可见层、业务自然语言文档、对外协议把"中介"统一替换为"智能管家"**。技术代码层（数据库、API、enum、目录）保持英文 `agent` 标识符不变，避免重构波及范围爆炸。

### 命名映射表（权威）

#### 通用术语

| 旧 | 新 |
|---|---|
| 中介 | 智能管家 |
| 中介合伙人 | 智能管家合伙人 |
| 中介工作台 | 智能管家工作台 |
| 中介学院 | 智能管家学院 |
| 中介信誉 | 智能管家信誉 |
| 中介裂变 | 智能管家网络 / 合伙人裂变 |
| 中介推荐 | 智能管家推荐 |
| 中介保证金 | （已取消，无需改名）|
| 中介合作协议 | 智能管家合作协议 |
| 中介朋友圈 / 朋友圈日报 | 合伙人内容日报 |
| 中介招募 | 合伙人招募 |
| 中介排行榜 | 合伙人排行榜 |
| 中介俱乐部（金牌等）| 金牌管家俱乐部 |
| 中介管理（后台）| 智能管家管理 |

#### 4 大子类型（BR-004）

| 旧 | 新 | 内部代号（不变）|
|---|---|---|
| 资质中介 | **资质智能管家** | `AGENT_QUAL` |
| 投标中介 / 标书中介 | **标书智能管家** | `AGENT_TENDER` |
| 金融中介 | **金融智能管家** | `AGENT_FIN` |
| 综合中介 | **综合智能管家** | `AGENT_GENERAL` |

#### 5 级信誉等级（BR-332，对外名升级）

| 旧 | 新 |
|---|---|
| LV1 新手 | LV1 见习管家 |
| LV2 见习 | LV2 入职管家 |
| LV3 熟练 | LV3 资深管家 |
| LV4 金牌 | LV4 金牌管家 |
| LV5 钻石 | LV5 首席管家 |

> 等级数字 + 加权 + 推荐费上限 + 提现周期等约束**全部不变**，仅名称升级。

### 不改的清单（技术代码层）

| 类型 | 标识符 | 理由 |
|---|---|---|
| 数据库表 | `agent_profiles` / `agent_relations` / `agent_commissions` / `agent_referrals` 等 | 改名 = 全 spec migration + 数据迁移 + API 改名连锁 |
| 字段 | `agent_id` / `agent_subtype` / `cross_domain_fee` 等 | 同上 |
| Enum | `UserRole.AGENT` / `AgentSubtype.AGENT_QUAL` 等 | 内部代号，UI 不暴露 |
| API 路径 | `/api/v1/agents/*` / `/api/v1/admin/agents/*` | 改 URL = 客户端 / 第三方接入断档 |
| 子前端目录 | `apps/agent/` | 同上 |
| 模块名 | `agent-workspace` / `agent-profile` / `agent-fission` 等 | 内部代号 |
| BR 编号 | BR-301~336 | 编号体系稳定，描述里换词即可 |
| spec 目录 | `.kiro/specs/22-agent-workspace/` | 内部代号 |

**核心原则**：英文 `agent` 是中性词，作为内部代号无品牌负载；中文 UI 文案永远从 i18n 字典取 `t('agent.title') = "智能管家"`。

### i18n 强约束

```ts
// apps/web/src/i18n/zh-CN.ts（以及 apps/agent / apps/admin / apps/gov）
export const zh_CN = {
  agent: {
    title: '智能管家',
    titlePlural: '智能管家',
    workbench: '智能管家工作台',
    network: '智能管家网络',
    academy: '智能管家学院',
    partner: '智能管家合伙人',
    subtype: {
      AGENT_QUAL: '资质智能管家',
      AGENT_TENDER: '标书智能管家',
      AGENT_FIN: '金融智能管家',
      AGENT_GENERAL: '综合智能管家',
    },
    level: {
      LV1: '见习管家',
      LV2: '入职管家',
      LV3: '资深管家',
      LV4: '金牌管家',
      LV5: '首席管家',
    },
  },
};
```

**SHALL NOT** 在任何用户可见的代码字符串里硬编码"中介"。所有展示走 i18n。

### 域名 / 邮箱

| 用途 | 保持 | 备注 |
|---|---|---|
| 注册入口域名 | `agents.tongqian.io` | 英文域名作为内部短域，不暴露中文歧义 |
| 邮箱 | `agents@tongqian.io` | 同上 |
| 公众号 / 站内对外正文 | "智能管家合伙人入驻" | 中文文案统一升级 |

## 备选方案

| 方案 | 优点 | 缺点 | 决策 |
|---|---|---|---|
| A. 保留"中介" | 改动量 0 | 品牌低端 | ❌ 创始人否决 |
| B. 全量改名（含代码 / 表 / API）| 概念彻底统一 | 代码重构爆炸（28 spec / 数据库 / API 全动），延迟上线 ≥ 4 周 | ❌ 否决 |
| C. **双轨：UI 改 + 代码不改** | 用户体验 + 代码稳定性兼得 | 需要写 ADR 锁定规则 + i18n 字典维护 | ✅ 本次采用 |

## 影响

### 受影响文件（按优先级）

**P0 用户可见（必改）**：
- `docs/marketing/poster-master.md` / `brochure-deck.md`
- `docs/owner-preparation-checklist.md`（创始人对外协议 / 合同 / 客服话术）
- `README.md`
- `docs/business-model.md` 商业模型（对外宣讲材料的源头）
- `docs/glossary.md` 术语表（添加新词条）

**P1 spec 自然语言描述（必改，但不改代码标识符）**：
- `.kiro/specs/00-project-overview/requirements.md` / `design.md` / `design-flows.md`
- `.kiro/specs/22-agent-workspace/requirements.md` / `design.md` / `tasks.md`
- `.kiro/specs/06-auth-rbac/` / `09-payment-gateway/` / `24-admin-console/` 等中介相关章节
- `.kiro/steering/decision-defaults.md`

**P2 不改（保持代码标识符）**：
- 所有 prisma schema / TypeScript enum / API 路径定义
- `apps/agent/` 目录
- BR 编号

### 验收

代码层零影响。Prisma migrate 不触发。API 客户端不需要更新。所有改动仅是 markdown 文本替换。

### Prompt 工程注意

prompt 工程文档里所有 prompt 模板的"中介"都要改成"智能管家"，因为这是 AI 输出给客户看的。同时系统 prompt 里要明确告诉 AI："对外用户称呼时使用'智能管家'，不要使用'中介'一词"。

## 后续

- [ ] i18n 字典 `packages/types/src/i18n/zh-CN/agent.ts` 后续 task 创建（在 03-design-system 落地）
- [ ] 中介合作协议法律文本由律师配合改名（owner-preparation-checklist I3）
- [ ] 营销话术 / FAQ / 客服对话脚本统一升级
- [ ] AI prompt 模板（apps/api/src/prompts/）中所有面向用户输出的措辞升级
