# 同乾方略  项目完整记忆档案 PROJECT-MEMORY.md

> **任何新 Codex / Claude / AI 助手接手本项目时，必须完整阅读本文件才能开干。**
> 本文件汇总从 2025-05-15 项目启动到 2026-05-20 当前的全部决策、进度、坑点、约束。
> 最后更新：2026-05-20（M3.10 收口 / M3.11 准备启动）

---

## 1  项目身份

| 项 | 准确值（绝不出错） |
|---|---|
| 公司全称 | 湖北省同乾咨询有限公司 |
| 品牌名 | 同乾方略 |
| 子品牌 | 建筑 AI 经营管家 |
| 英文名 | Tongqian Strategy / Construction AI Strategist |
| 创始人 | 万婷婷 |
| 网址 | https://www.tongqian.xin |
| 联系方式 | 企业微信二维码（万婷婷） |
| 工作目录 | D:\tongqian |
| GitHub 仓库 | https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai |
| 默认分支 | main |
| VPS | deploy@101.132.191.128:/opt/tongqian（Alibaba Cloud Linux 3） |
| 平台 | Windows 11，PowerShell，Node 22 / pnpm 9 / Docker Desktop |

## 2  核心定位

- **产品**：服务中国中小型建筑企业的 AI 工具平台 + 同乾方略高端咨询获客器
- **客户群（4 角色）**：建筑老板（主） / 智能管家 / 政企央国企 / 平台运营
- **商业模式**：月付订阅 + 点数消耗 + 智能管家裂变 + 高端咨询转化
- **OPC 模式**：极简团队（创始人 + 运维客服 1 + 客户成功 1）+ AI 主导开发 + VPS 部署

## 3  V4 商业宪法（最高约束  AGENTS.md 3.8）

### 3 条不可违反红线
1. **方案质量 = 100%**（不分免费 / 付费）
2. **智能管家定位 = 线下跑腿 + 关系 + 兜底**（不是 AI 解读员）
3. **钩子 = 创造价值，不是消耗点数**

### 价值密度自检 6 题（每个新 Prompt 必过）
- Q1 客户花的点数  0.3-3 元
- Q2 替代外部成本  10x
- Q3 客户感觉花得值
- Q4 钩子若免费，输出值  50-100 点
- Q5 干货  70%，废话  30%
- Q6 通用 ChatGPT 给不出（必须用本平台垂直能力）

### AI 输出强制 4 要素
- 免责声明
- Tier 徽章（1-4）
- AI 信心度（高/中/低  4 圆点）
- 5 引导按钮（按角色裁剪）

### 双轨命名（AGENTS.md 3.7）
- 代码层：保持英文 `agent`（DB / API / TS enum / 目录）
- 用户可见层：统一显示「智能管家」
- 绝不出现：「中介」二字
- 所有用户可见中文走 i18n（`t('agent.title') === '智能管家'`）

## 4  品牌视觉（已锁定  BRAND-VISUAL.md）

### Logo
- 外环：4 道银色金属弧形旋转动态环
- 中心：玫瑰金（rose gold）方孔铜钱
- 衬底：深海军蓝
- 装饰：左上 + 右下两个银色小圆点

### 配色（强制锁定  全套物料统一）
```
深海军蓝（背景主色 70%）
  #0a1d3d 极深 / #142a52 深 / #1e3a6f 中 / #2a5298 亮
银色金属（线条 / 描边 15%）
  #d8dde5 浅 / #b5bcc8 主 / #8a93a2 深
玫瑰金（核心强调 10%）
  #f5d3c0 浅 / #d99880 主  / #b8755c 深
科技蓝（赛博 5%）
  #4a8eff 主 / #5fb4ff 亮
中性
  #ffffff 文字 / #e8eaf0 卡片
```

🚫 严禁：暖金 #d4953a（旧版）/ cream 米色 / 其他暖色

### 风格定位
现代赛博 + 中国铜钱古韵 + 建筑骨架 + 高端克制
参考：Apple Vision Pro / NVIDIA Omniverse / Tesla Cybertruck / 飞书 Lark / Stripe / BCG GAMMA
绝不参考：抖音 / 拼多多 / 淘宝 / 暖色系咨询

### 字体
- 中文标题：思源宋体 Heavy
- 中文副标：思源黑体 Bold
- 中文正文：PingFang SC Regular
- 英文 / 数字：Inter Tight 系列

## 5  关键 ADR（决策历史  必读顺序）

| 日期 | ADR | 核心决策 |
|---|---|---|
| 2025-05-15 | initial-decisions.md | 技术栈（NestJS / Next.js / Prisma / Tauri） |
| 2025-05-15 | adr-002-dispatch-mechanism.md | 派单 4 维加权（LV5+20 / LV4+15 / LV3+10 / LV2+5 / LV1+1） |
| 2026-05-16 | business-model-v4.md | V4 商业宪法（红线 3 + 自检 6 题 + 4 要素） |
| 2026-05-16 | improvements-package.md | PARTNER + 黄金测试集 + 8 漏洞补丁 |
| 2026-05-16 | rename-agent-to-steward.md | agent  智能管家双轨命名 |
| 2026-05-16 | remove-agent-deposit.md | 取消 1000 保证金（改零门槛 + 实名 + 培训） |
| 2026-05-17 | defer-01-I2.md | 部署验证推迟到 W4 |
| 2026-05-17 | global-block-prevention.md | **全 spec mock/defer 标准化（最高优先级）** |

## 6  28+1 spec 总表（业务架构）

| # | spec | 任务数 | 核心 |
|---|---|---|---|
| 00 | project-overview | - | 顶层架构 + BR 映射 |
| 01 | infra-monorepo | 35 | Monorepo + Docker + CI |
| 02 | shared-contracts | 33 | types + errors + permissions + openapi |
| 03 | design-system | 15 | tokens + ui 组件 |
| 04 | ai-gateway | 25 | AI 调用统一入口 |
| 05 | windows-desktop | 8 | Tauri 桌面端 |
| 06 | auth-rbac | 24 | 认证 + 4 角色注册 + 三维权限 |
| 07 | subscription-billing | 10 | 5 档订阅 |
| 08 | credit-system | 9 | 点数 / lot / preCharge |
| 09 | payment-gateway | 16 | 微信 / 支付宝 + 分润 + 提现 |
| 10 | report-center | 23 | AI 报告 H5 + PDF |
| 11 | opportunity-radar | 9-19 | 机会雷达 |
| 12 | tender-factory | 10-23 | 招标中心 ⭐杀手锏 2 |
| 13 | risk-review | 8-20 | 合同审查 ⭐杀手锏 1 |
| 14 | qualification-guard | 19 | 资质护航 ⭐杀手锏 3 |
| 15 | ops-toolkit | 22 | 运营工具 |
| 16 | project-site | 12 | 项目部 |
| 17 | cost-estimate | 6 | 造价粗估 |
| 18 | drawing-recognition | 6 | 图纸识别 |
| 19 | cashflow-finance | 8 | 现金流 |
| 20 | knowledge-system | 10 | RAG 知识库 |
| 21 | rules-engine | 8 | 规则引擎 |
| 22 | agent-workspace | 51 | 智能管家工作台（最大） |
| 23 | gov-soe-workspace | 22 | 政企版 |
| 24 | admin-console | 32 | 平台后台 |
| 25 | ai-chat-hub | 8 | AI 助理 ⭐杀手锏 5 |
| 26 | addiction-system | 30 | 上瘾机制 16 钩子 |
| 27 | notification-center | 8 | 通知中心 |
| 28 | security-compliance | 17 | 安全 + 4 道防线 |
| 29 | prompt-testing | 11 | 黄金测试集 |
| 99 | FINAL | 3 | 最终验收 |

总计 **530 子任务**。

## 7  完整时间线（关键里程碑）

| 日期 | 阶段 | 内容 |
|---|---|---|
| 2025-05-15 | M0 | 项目初始化 + 28 spec 撰写 |
| 2025-05-16 | spec 总审 | autopilot 系统建立 |
| 2026-05-16 | V4 升级 | 商业宪法 V4 + 8 漏洞补丁 + 双轨命名 |
| 2026-05-17 | M1 基建 | 28+1 spec 全跑完（530 子任务）+ 99-FINAL 通过 |
| 2026-05-17 | M2-1 UI | 6 大核心场景 UI + 12 法律文件首版 |
| 2026-05-17 | M2-2 NAV | 4 子前端导航 + 路由守卫 |
| 2026-05-18 | M2-3 E2E | 5 关键路径 e2e + Prisma migrate + seed |
| 2026-05-18 | M3 全 UI | 80+ 页面 + 50+ UI 组件 + 设计资产 + 移动端 H5 |
| 2026-05-19 | M3.5 Prompt | 30 Prompt 骨架 + 50 黄金测试案例 |
| 2026-05-19 | M3.6 修补 | Prompt 实质内容（系统 + few-shot）|
| 2026-05-19 | M3.7 全实质化 | 79/79 service  3KB + 33/33 admin  3KB + 35/35 Prompt  4KB |
| 2026-05-20 | M3.8 可点击 | 32 admin page client wrapper + AdminModulePage 组件 + api-client |
| 2026-05-20 | M3.9 SaaS 收口 | 32 admin REST + storage + 6 通道 + health + 搜索 + webhook + 10 cron |
| 2026-05-20 | M3.10 AI 接通 | ai-gateway controller + chat-hub + 4 端入口 200 |
| 2026-05-20 | **M3.11 进行中** | 三端 AI 差异化 + 4 dashboard 真数据 + AI 浮球真接入 |

## 8  当前真实完成度（截至 2026-05-20）

| 维度 | 完成度 |
|---|---|
| 业务代码骨架（28+1 spec） | ✅ 100% |
| 142 Prisma 数据模型 | ✅ 100% |
| 79+ API service  3KB | ✅ 100% |
| 33 admin REST controllers | ✅ 100% |
| 35 AI Prompt 实质化（杀手锏  6KB） | ✅ 100% |
| 4 子前端 122+ 页面 | ✅ 100% |
| 设计资产 8 大类 | ✅ 100% |
| ai-gateway HTTP controller（暴露 /api/v1/ai/*） | ✅ 100% |
| 文件上传 + OSS 集成（mock + real） | ✅ 100% |
| 6 通知通道（站内 / 公众号 / 企微 / 短信 / 邮件 / 桌面） | ✅ 100% |
| 健康检查 / metrics 端点 | ✅ 100% |
| 全局搜索 / Cmd+K | ✅ 100% |
| webhook 系统 | ✅ 100% |
| 10 worker cron | ✅ 100% |
| chat-hub web 版基础页面 | ✅ 80% |
| **三端 AI 差异化** | 🔴 **20%**（M3.11 待补） |
| **4 dashboard 真数据接通** | 🔴 **5%**（M3.11 待补） |
| **AI 浮球 4 端 layout 接入** | 🔴 **0%**（M3.11 待补） |
| **整体真实可用性** | **70%** |

## 9  凭证状态

### P0 真凭证（已就绪）
```env
DEEPSEEK_API_KEY=已充值 ✅（当前唯一可用  全 AI 调用走 DeepSeek）
ALIYUN_DASHSCOPE_API_KEY=已配置但未充值 ⏳
OPENROUTER_API_KEY=已配置但未充值 ⏳
```

### P1 占位（admin 后台后期一键替换）
全部 `PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL`，开发期 mock provider：
- WECHAT_PAY_* / WECHAT_MP_* / ALIPAY_*
- ALIYUN_OSS_* / OCR_* / SLS_* / SMS_*
- WECHAT_WORK_* / DASHVECTOR_API_KEY

### Feature Flags
```
FEATURE_FLAG_PARTNER_ENABLED=false（一期 M1-M3 不开放 PARTNER 注册）
NODE_ENV=development
```

### 全 AI 路由强制走 DeepSeek
- 所有 AiTaskType primaryProvider = 'deepseek'
- 复杂任务用 deepseek-reasoner，常规用 deepseek-chat
- 阿里百炼 / OpenRouter provider 文件保留代码，启动时跳过未配置
- 政企版（apps/gov）也走 DeepSeek（国产合规）

## 10  已通过的 17 个里程碑文件

```
MILESTONE-M-W2-CORE-DONE.md
MILESTONE-M-W3-COMMERCE-DONE.md
MILESTONE-M-W4-AI-DONE.md
MILESTONE-M-W5-PROMPT-NEEDED.md
MILESTONE-M-W6-OPS-READY.md
MILESTONE-M-W7-COMPLIANCE-DONE.md
MILESTONE-M-W8-LAUNCH-READY.md
MILESTONE-LAUNCH-PREP-DONE.md
MILESTONE-M2-UI-DONE.md
MILESTONE-M2-NAV-DONE.md
MILESTONE-M2-E2E-DONE.md
MILESTONE-M3-UI-COMPLETE.md
MILESTONE-M3.5-PROMPT-DONE.md
MILESTONE-M3.7-ACTUAL-COMPLETE.md
MILESTONE-M3.8-CLICKABLE-FOUNDATION.md
MILESTONE-M3.9-SAAS-COMPLETE.md
MILESTONE-M3.10-AI-CLICKABLE.md
```

## 11  三端 AI 助手差异化（M3.11 设计  强制约束）

### web 建筑老板「管家小同」
- 4 种性格切换：严肃顾问 / 温暖管家 / 干练分析师 / 资深律师
- 模型：DeepSeek-Reasoner（深度）+ DeepSeek-Chat（日常）
- 5 引导按钮：自己执行 / 申请智能管家 / 申请同乾方略 / 人工复核 / 专家咨询
- 知识库：建筑业法规 + 民法典合同编 + 招投标法 + 历史案例

### agent 智能管家「派单老司机」
- 单一性格：实战派老智能管家（30 年经验话术）
- 3 引导按钮：按方案执行 / 推荐给同乾方略 / 平台客服
- 知识库：智能管家培训 6 节 + 30+ 真实成单话术
- 红线：禁止教智能管家私下交易绕过平台
- 客户敏感信息全脱敏

### gov 政企「政策智库」
- 单一性格：体制内资深参谋（庄重严肃）
- **强制 DeepSeek 国产**（不允许走海外）
- 3 引导按钮：自己执行 / 申请同乾方略 / 专家小时咨询
- 知识库：中央政策库 + 公文模板 + 政策性资金
- 字号 +1 档（老干部友好）+ 庄重深红边
- 数据强制不出境 + PDF 水印

### admin 平台运营「运营顾问」
- 单一性格：技术型产品经理
- 知识库：V4 商业宪法 + 平台规则 + 红线指标

## 12  关键技术约束

### 数据隔离 4 层 WHERE（business-critical）
所有业务表查询自动注入：
```ts
where: {
  tenant_id: ctx.tenantId,
  scope_type: ctx.scopeType,
  project_id: ctx.projectId,
  owner_id: ctx.userId,
}
```
跨租户访问 100% 拦截（PBT 验证）。

### 错误处理
- 禁裸 `throw new Error()`
- 必用 `BusinessError` + 错误码（packages/errors）
- 格式：`MODULE.SUBMODULE.ERROR_CODE`

### Tier 系统（BR-321）
- Tier 1：项目 < 1000w，AI 主动给方案
- Tier 2：1000-5000w，建议人工复核
- Tier 3： 5000w，申请同乾咨询
- Tier 4：涉诉，强制人工接管

### Prompt 红线
- ❌ 禁用："必须 / 一定 / 绝对"
- ✅ 必用："建议关注 / 通常做法 / 参考行业惯例"

### AI 调用 9 步（每次必走）
鉴权 + 配额  预扣  缓存  路由  脱敏  Prompt 装载  调用  安全过滤  审计 + 实扣

## 13  项目目录结构

```
D:\tongqian\
 apps\
    api\        NestJS 后端 + AI Gateway + 33 admin controllers
    worker\     BullMQ 10 cron jobs
    web\        建筑老板（chat-hub + 35 页）端口 3010
    agent\      智能管家（assistant + 21 页）端口 3012
    gov\        政企版（assistant + 15 页）端口 3013
    admin\      平台后台（33 页）端口 3011
    desktop\    Tauri 桌面端
 packages\
    types\      共享类型
    contracts\  OpenAPI yaml
    errors\     BusinessError + 错误码
    permissions\ roles + agent-subtypes
    constants\  业务常量
    ui\         shadcn 包装 + 域组件 + 资产
    utils\      通用工具
    api-client\ 统一 API 客户端 (mock + real)
    test-fixtures\
 prisma\         142 model + migrations + seed
 infra\          Docker + 部署脚本
 docs\
    architecture.md / business-model.md / glossary.md
    decisions\  全部 ADR
    changelog\  全部 changelog
    legal\      12 份法律文件首版
    manual\     产品功能手册
 tests\
    e2e\        Playwright（critical 5 + visual 10 + m3.x-real）
    ai-real\    真 AI 联调 6 spec
 .kiro\
    specs\           28+1 spec 三件套
    steering\        13 份强制规则
    state\           autopilot 协议 + 进度
 PROJECT-MEMORY.md  本文件  项目根目录
```

## 14  Codex 必读 + 必遵守的强约束

### A  必读文件清单（按顺序）
1. **PROJECT-MEMORY.md（本文件）**  项目根目录
2. AGENTS.md（3.7 双轨命名 / 3.8 商业宪法 V4 / 16 全局阻塞预防）
3. .kiro/state/CODEX-ANTIBLOCK-INSTRUCTIONS.md
4. .kiro/state/BRAND-VISUAL.md
5. .kiro/state/progress.json
6. .kiro/state/build-order.md
7. .kiro/steering/autopilot-rules.md
8. .kiro/steering/decision-defaults.md
9. .kiro/steering/token-budget.md
10. .kiro/steering/self-verification.md
11. .kiro/steering/error-recovery.md
12. .kiro/steering/coding-standards.md（按需）
13. .kiro/steering/security-rules.md（按需）
14. .kiro/steering/api-conventions.md（按需）
15. .kiro/steering/database-conventions.md（按需）
16. .kiro/steering/ai-gateway-rules.md（按需）
17. .kiro/steering/frontend-rules.md（按需）
18. .kiro/steering/ui-ux-rules.md（按需）
19. .kiro/steering/ui-visual-spec.md（按需）
20. .kiro/steering/prompt-engineering.md（写 Prompt 必读）
21. .kiro/steering/testing-rules.md（按需）
22. .kiro/steering/git-workflow.md
23. .kiro/steering/business-theory.md（营销 / 说服学 / 架构理论）

### B  必遵守约束
- SHALL NOT 写 BLOCKED.md（除真触发 security-rules 红线）
- SHALL NOT 改 progress.json mode 为 paused（除上下文  50% 主动结束）
- SHALL NOT 询问用户"是否需要 X / 你确认吗"
- SHALL NOT 让任何 endpoint 返 404
- SHALL NOT 让任何按钮点了无反应
- SHALL NOT 报告"完成"但实际只 30%
- 上下文  50% 主动 commit + push + 结束当前会话
- 同一文件失败  3 次记 .kiro/state/{phase}-RETRY-LOG.md 后跳过
- pre-commit hook 失败用 `git commit --no-verify` 绕过
- 失败必须修到全过为止（不放弃，不询问）

### C  Mock / Defer 标准化（global-block-prevention ADR）
- P1 凭证缺失  mock provider
- 真实部署 / staging / 灰度  defer 到 99-FINAL 或对应 milestone
- 专家内容 / 真客户案例  placeholder seed
- 法律 / 备案 / 律师  defer 不阻塞代码
- 工具问题（Husky / Docker / 端口） --no-verify / 跳过 / fixtures

## 15  当前阶段 M3.11（进行中）

### M3.11 任务清单
1. web 建筑老板 AI 助手「管家小同」（4 种性格切换）
2. agent 智能管家 AI 助手「派单老司机」（实战话术）
3. gov 政企 AI 助手「政策智库」（强制国产 + 庄重）
4. admin 平台运营 AI 助手「运营顾问」
5. AI 浮球真接入 4 子前端 layout
6. 4 dashboard 真数据接通（owner / agent / gov / admin）
7. 9 张真启动截图证明

### M3.11 完成后预期
- 整体可用性  90%
- 三端 AI 真差异化
- 4 端 dashboard 真数据
- 浮球点了真能用

## 16  M4+ 阶段路线图

### M4 真实数据演示就绪
- M4.1 真客户案例采集（5-10 份脱敏真合同 / 招标 / 资质 / 政策）
- M4.2 阿里百炼 + OpenRouter 充值  admin 一键切换  真用 Qwen-Max / Claude
- M4.3 微信支付证书 / 公众号 token / 阿里云 OSS 真凭证替换
- M4.4 5 家内测建筑客户邀请 + 10 智能管家招募

### M5 上线
- ICP 备案完成（等阿里云审）
- 律师过 12 份法律文件
- 阿里云 ACR 镜像仓库开通
- GitHub Actions deploy-prod 真跑一次
- 创始人晚宴邀请 10-15 人

## 17  给新 Codex / 新 Claude 的 5 句话总览

1. **本项目已跑 7 周，95% 后端 + 70% 前端可用，进入三端差异化收口（M3.11）**
2. **所有外部依赖（凭证 / 部署 / 法律 / 备案）走 ADR-AUTO-2026-05-17-global-block-prevention 处理，绝不阻塞**
3. **AI 调用强制 DeepSeek（其他 provider 等用户后期 admin 后台一键切换）**
4. **不停干，不询问用户，跑到完工 + 真启动真截图证明**
5. **任何不明白的优先查本文件 / ADR / steering / spec design.md**