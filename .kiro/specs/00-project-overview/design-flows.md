# 00 项目顶层 Spec - Design / Flows（业务流程时序与状态机）

> **本文档定位**：[`design.md`](./design.md) 的姊妹篇，专门收纳跨模块的**时序图**与**状态机**。Codex 撰写每个子 Spec 时引用本文章节编号即可。
>
> **拆分原因**：原 `design.md` 单文件 1962 行违反 [`memory-management.md` §3.1](../../steering/memory-management.md)"单文件 ≤ 500 行"硬约束。本文承接原 §3 / §6 / §7 / §8 / §9 五个章节，与 [`design-protocols.md`](./design-protocols.md) 一起把 design 总规模降到每文件 ≤ 800 行。
>
> **本文涵盖**：
> - §3 4 大用户大类的注册流程时序图
> - §6 三层服务漏斗的状态机（客户生命周期）
> - §7 派单决策的核心序列图
> - §8 信誉分变动的事件溯源设计
> - §9 AI 输出 Tier 分级的实现机制

---

## 3. 4 大用户大类的注册流程时序图

### 3.1 TL;DR

> 4 类用户的注册路径不同：建筑企业含归属智能管家推广码识别 + OWNER 创建 + 默认岗位；政府 / 央国企走独立审核 + 独立前端跳转；智能管家需选子类型 + 实名资料审核 + 强制培训 + 信誉分初始化（**零保证金**，2026-05-16 ADR-AUTO 取消）；平台运营无公开注册，由超管手动建立。**4 张图均共享相同的反薅 / traceId / 审计基础设施（协议 P-1 至 P-3，见 [`design-protocols.md` 附录 A](./design-protocols.md)）**。

### 3.2 流程 1：建筑企业用户注册（含归属智能管家推广码 + OWNER + 岗位标签）

涉及子 Spec：[`06-auth-rbac`] / [`07-subscription-billing`] / [`08-credit-system`] / [`22-agent-workspace`] / [`27-notification-center`] / [`28-security-compliance`]

**关联 BR**：BR-001 / BR-002 / BR-003 / BR-102 / BR-315 / BR-401 / BR-602

```mermaid
sequenceDiagram
  autonumber
  participant U as 注册用户（潜在 OWNER）
  participant Web as apps/web
  participant Auth as 06 auth-rbac
  participant AntiF as 28 anti-fraud
  participant Tenant as 06 tenant
  participant Attr as 22 attribution
  participant Tag as 06 position-tags
  participant Sub as 07 subscription
  participant Credit as 08 credit
  participant Notif as 27 notification

  Note over U,Web: ① 客户可能由智能管家 a 的推广码引入<br/>URL: /register?ref={agentCode}
  U->>Web: 打开注册页（带 / 不带 ref）
  U->>Web: 填表：手机 + 营业执照 + OWNER 信息
  Web->>Auth: POST /auth/register {role:BUILDING_COMPANY, ref?, ...}<br/>Idempotency-Key（协议 P-1）
  Auth->>AntiF: 反薅检查（BR-315）<br/>手机/身份证/执照/IP/设备指纹去重
  alt 命中黑名单 / 关联智能管家自注册
    AntiF-->>Auth: 拒绝
    Auth-->>Web: 422 FRAUD.BLOCKED
  end
  AntiF-->>Auth: ok
  Auth->>Tenant: 创建 tenants（uq: social_credit_code，BR-002）
  Tenant-->>Auth: tenantId
  Auth->>Auth: 创建 OWNER 用户 + bcrypt 密码
  Auth->>Tag: 自动分配 OWNER 岗位标签<br/>（BR-003 唯一自动分配）
  alt 含 ref（智能管家 a）
    Auth->>Attr: 永久绑定 client→a（BR-102）<br/>uq: client_id 不可改
  end
  Auth->>Sub: 创建试用版订阅（BR-401 trial）
  Sub-->>Auth: subscriptionId
  Auth->>Credit: 发放 500 注册点 + 周签到 50（BR-602）
  Credit-->>Auth: ok
  Auth->>Auth: 写审计（协议 P-2）+ 透传 traceId（P-3）
  Auth-->>Web: 201 + JWT (access 30min) + refresh 30d
  Web->>Notif: 触发欢迎站内信 + 公众号关注引导
  Notif-->>U: 多通道触达
```

❗ **关键约束**：
- OWNER 是注册时**唯一自动分配**的岗位，其他 30+ 岗位由 OWNER 后续邀请员工时分配（BR-003）。
- `client_attributions.client_id` 是 **DB 唯一索引** + 业务层不可改，`agent_id` 一经写入永久不可修改（BR-102）。

### 3.3 流程 2：政府 / 央国企用户注册（含独立审核 + 政府版前端跳转）

涉及子 Spec：[`06-auth-rbac`] / [`23-gov-soe-workspace`] / [`24-admin-console`] / [`27-notification-center`] / [`28-security-compliance`]

**关联 BR**：BR-001 / BR-002 / BR-005 / BR-104 / BR-315

```mermaid
sequenceDiagram
  autonumber
  participant U as 政府 / 央国企用户
  participant Gov as apps/gov
  participant Web as apps/web（被引导）
  participant Auth as 06 auth-rbac
  participant AntiF as 28 anti-fraud
  participant Tenant as 06 tenant
  participant Review as 24 admin-console<br/>政府认证审核台
  participant Notif as 27 notification
  participant CS as 平台客户成功

  U->>Gov: 打开 gov.tongqian.com
  Gov->>Gov: 检查 host = gov 域名 → 渲染政府版前端
  Note over Gov: 物理隔离（D-2）：政府版前端<br/>SHALL NOT 暴露建筑企业模块入口
  U->>Gov: 填表：单位（机关 / 央企 / 城投）+ 公函抬头 + 工作邮箱（.gov.cn / 单位邮箱）+ 联系人
  Gov->>Auth: POST /auth/register {role:GOV_USER, subType:ministry/soe/lgfv, ...}<br/>Idempotency-Key
  Auth->>AntiF: 反薅 + 单位资质核验<br/>（黑名单 / IP 限速 / 公函扫描件 magic 校验）
  AntiF-->>Auth: ok
  Auth->>Tenant: 创建 tenants（type:GOV，sub_type:ministry/soe/lgfv）<br/>状态：pending_review
  Tenant-->>Auth: tenantId
  Auth->>Auth: 创建用户 + 临时账号（仅可登录 + 完善资料 + 看政策学习）
  Auth->>Review: 触发独立审核工单（区别于建筑企业自动放行）
  Review->>CS: 推送企业微信告警 + 24h 内联系
  CS->>Review: 线下电话 / 公函扫描件复核 → 通过 / 拒绝
  alt 通过
    Review->>Tenant: 状态 pending_review → active
    Review->>Notif: 通过通知 + 完整功能开通 + 政府版功能入口（仅 4 模块）
    Notif-->>U: 站内信 + 公函邮箱
  else 拒绝
    Review->>Tenant: 状态 → rejected
    Review->>Notif: 拒绝原因 + 申诉入口
  end
  Note over Gov,U: ⚠️ 政府用户登录后只看到 4 模块（政策 / 公文 / 寻源 / 化债咨询入口）<br/>不暴露合同 / 资质 / 财务等建筑企业侧
  U->>Gov: 登录后跳转 apps/gov 工作台
```

❗ **关键约束**：
- 政府版**独立前端**（apps/gov），与建筑企业版**物理隔离**（BR-005）。共用同一后端但走独立审核工单流。
- 数据导出受 BR-104 强约束（OWNER + 二次密码 + 审计）。

### 3.4 流程 3：智能管家用户注册（子类型 + 实名资料审核 + 强制培训 + 信誉分初始化）

> **2026-05-16 ADR-AUTO 变更**：早期版本要求 ¥1000 保证金，正式取消。改为零门槛入驻 + 实名资料审核 + 强制培训通关 + 信誉分约束。理由：保证金构成合伙人招募阻力，且与"推荐 0 抽成"理念冲突；实名 + 培训 + 信誉分更适合长期运营。

涉及子 Spec：[`06-auth-rbac`] / [`22-agent-workspace`] / [`24-admin-console`] / [`27-notification-center`] / [`28-security-compliance`]

**关联 BR**：BR-001 / BR-004 / BR-301 / BR-306 / BR-315 / BR-331 / BR-332

```mermaid
sequenceDiagram
  autonumber
  participant U as 智能管家申请人
  participant AgentApp as apps/agent
  participant Auth as 06 auth-rbac
  participant AntiF as 28 anti-fraud
  participant Profile as 22 agent-profile
  participant Rep as 22 reputation
  participant Review as 24 admin-console<br/>智能管家认证审核台
  participant Notif as 27 notification

  U->>AgentApp: 打开 agents.tongqian.io/register
  U->>AgentApp: 填表：手机 + 身份证 + 子类型选择<br/>BR-004：AGENT_QUAL / TENDER / FIN / GENERAL
  U->>AgentApp: 上传：身份证扫描 + 名片 + 历史业绩（选填）
  AgentApp->>Auth: POST /auth/register {role:AGENT, subType, docs[]}
  Auth->>AntiF: 反薅检查（BR-315）<br/>手机/身份证/IP/设备指纹去重 + 黑名单
  AntiF-->>Auth: ok
  Auth->>Auth: 创建用户 + tenant（type:AGENT）<br/>状态：pending_review
  Auth-->>AgentApp: 临时账号（仅可登录查看审核进度）
  Auth->>Review: 触发资料审核工单（24-72h 内）
  Review->>Review: 人工核验（身份证一致性、子类型匹配证据、反薅终审）
  alt 通过
    Review->>Auth: 状态 pending_review → training（必须先完成智能管家学院培训）
    Review->>Profile: 创建 agent_profiles（subType, activityStatus:active）
    Review->>Rep: 初始化 reputation_scores<br/>（BR-331 基础分 500 / BR-332 LV2 入职管家）
    Review->>Notif: 通过通知 + 培训入口 + 推广码生成
    Notif-->>U: 短信 + 站内信
    Note over U,AgentApp: 完成 6 节培训课 → status:active<br/>可开始接派单 + 邀请客户
  else 拒绝
    Review->>Auth: 状态 pending_review → rejected（账户冻结）
    Review->>Notif: 拒绝原因 + 7 天内申诉入口
  end
```

❗ **关键约束**：
- 智能管家子类型决定派单匹配规则（BR-004 / BR-336 业务子类匹配维度）。
- **零保证金**（已取消，无需 [`09-payment-gateway`] 介入）。准入门槛靠：实名审核 + 强制培训 + 信誉分约束 + LV1 重启 6 次保护期上限（BR-331）。
- 信誉分基础 500 + LV2 入职管家（BR-331 / BR-332）。培训未通过期间（status=training）**SHALL NOT** 进入派单池。
- 培训未通过 / 拒绝注册：账户进入 rejected 冻结，7 天内可申诉，不涉及任何资金回退。

### 3.5 流程 4：平台运营用户创建（超管手动建立，无公开注册）

涉及子 Spec：[`06-auth-rbac`] / [`24-admin-console`] / [`27-notification-center`] / [`28-security-compliance`]

**关联 BR**：BR-001 / BR-002 / BR-005

```mermaid
sequenceDiagram
  autonumber
  participant SuperAdmin as PLATFORM_OWNER<br/>（创始人 / 超管）
  participant AdminApp as apps/admin
  participant Auth as 06 auth-rbac
  participant Audit as 28 audit
  participant Notif as 27 notification
  participant NewOp as 新运营人员

  Note over SuperAdmin,AdminApp: ❌ 平台运营 SHALL NOT 开放公开注册<br/>仅 PLATFORM_OWNER 后台手动建立（BR-001）
  SuperAdmin->>AdminApp: 登录 admin.tongqian.com（强制 2FA）<br/>仅平台租户内可见此页
  AdminApp->>AdminApp: 进入"用户管理 → 平台运营人员"
  SuperAdmin->>AdminApp: 填表：姓名 + 手机 + 邮箱 + 角色<br/>{PLATFORM_OPS / FINANCE / RISK / EXPERT / CS / CSM / AUDIT}
  AdminApp->>Auth: POST /admin/platform-users<br/>requires PLATFORM_OWNER + 二次密码（协议 P-7）
  Auth->>Auth: 创建用户 + tenant=平台租户（全局共用）+ 临时密码
  Auth->>Audit: 写审计（协议 P-2，operation:CREATE_PLATFORM_USER）
  Auth->>Notif: 推送账号信息（短信 + 邮箱）+ 强制首次登录改密
  Notif-->>NewOp: 短信告知
  NewOp->>AdminApp: 首次登录 → 强制改密 + 绑定 2FA
  NewOp->>AdminApp: 登录后按角色访问对应模块
  Note over AdminApp: 角色权限点（packages/permissions）：<br/>FINANCE → 审批退款 / 提现<br/>RISK → 风控仪表盘 / 申诉<br/>EXPERT → 规则库审核<br/>CSM → 智能管家运营 / 红线监控
```

❗ **关键约束**：
- 平台运营人员属于**单一平台租户**，权限按角色（不是岗位标签）划分。
- 任何创建 / 删除 / 角色变更 **MUST** 走审批 + 审计（协议 P-2 / P-7）。
- 强制 2FA + 异地登录二次验证（[`security-rules.md` §1](../../steering/security-rules.md)）。

---

## 6. 三层服务漏斗的状态机（客户生命周期）

### 6.1 TL;DR

> 这是**整个产品的商业核心闭环**，跨越 [`07`] / [`22`] / [`11`] / [`13`] / [`14`] / [`15`] 等多个子 Spec。从**注册（试用）→ 付费 → A 类派单 → B/C 类同乾方略接管 → 战略顾问签约**的完整客户生命周期。**关键状态：trial → paying → dispatched → consulting → strategic**。

### 6.2 完整客户生命周期状态机

```mermaid
stateDiagram-v2
  [*] --> trial: BR-001 注册<br/>含 500 注册点 + 周签到 50

  state "第 1 层 AI 工具订阅" as L1 {
    trial: 试用版（永久免费）
    paying_lite: 轻享版 ¥39
    paying_std: 标准版 ¥199 主力
    paying_ent: 企业版 ¥499
    paying_flag: 旗舰版 ¥999
  }

  trial --> paying_lite: 付费转化
  trial --> paying_std: 付费转化（最大池）
  trial --> paying_ent: 付费转化
  trial --> paying_flag: 付费转化

  state demand_signal <<choice>>
  paying_std --> demand_signal: AI 任务出现<br/>BR-307 分类 + BR-321 Tier
  paying_ent --> demand_signal
  paying_lite --> demand_signal
  paying_flag --> demand_signal

  demand_signal --> L2: A 类<br/>资质 lt 10w / 标书 lt 3w<br/>融资 lt 5000w / 保理 lt 2000w
  demand_signal --> L3: B / C 类<br/>资质 ge 10w / 化债 / ABS / REITs

  state "第 2 层 A 类智能管家派单" as L2 {
    dispatched: BR-308 派单中
    quoted: BR-310 报价透明
    in_service: BR-312 服务进行
    rated: 双向评分完成
    commission_frozen: BR-304 分润冻结
    commission_settlable: 7 天保护期过
  }

  L2 --> L3: BR-311 6 触发<br/>1.B/C 类直接进 2.24h 不响应<br/>3.报价 gt 200pct 客户切 4.客户主动选<br/>5.评分 lt 3star 6.复杂度标记
  L2 --> L1: 服务完成回 SaaS

  state "第 3 层 同乾方略标准咨询" as L3 {
    consulting: 高端服务货架 ¥5-30w
    referral_fee_frozen: BR-313 推荐费冻结
    referral_fee_settled: 7 天无投诉 可结算
  }

  L3 --> L4: 持续高价值客户<br/>年度签约
  L3 --> L1: 标准咨询完成回 SaaS

  state "第 4 层 战略顾问" as L4 {
    strategic_annual: 年度战略顾问 ¥30-50w 年
    strategic_gov: 政府央国企 ¥30-100w 单
    strategic_xb: 跨境 大型资本 协议定价
  }

  L4 --> [*]: 长期合作 续签

  paying_std --> past_due: 自动续费失败 重试 3 次 BR-403
  paying_ent --> past_due
  past_due --> paying_std: 用户手动续费成功
  past_due --> canceled: 主动取消 / 30 天未恢复
  canceled --> paying_std: 30 天内重新订阅<br/>点数复活 BR-406
  canceled --> [*]: 30 天未恢复 expired
```

### 6.3 各阶段触发条件 / 转化目标 / 关联 BR

| 阶段 | 触发条件 | 中性目标（首年）| 红线（BR-901）| 关联 BR |
|---|---|---|---|---|
| 试用 → 付费 | 试用版完成 ≥ 1 次 AI 任务 + 提醒 + 签到 | ≥ 12% | — | BR-001 / BR-401 / BR-602 |
| 付费 → 智能管家派单 | A 类需求 + BR-308 路由 | 月活客户的 30% | — | BR-307 / BR-308 / BR-310 |
| 智能管家派单 → 同乾方略 | BR-311 6 触发任一 | A 类的 10% | — | BR-311 / BR-313 / BR-316 |
| 付费 → 同乾方略标准咨询 | B / C 类需求 + BR-322 引导 | ≥ 5% | < 2% 触发应急 | BR-307 / BR-321 / BR-322 / BR-316 |
| 标准咨询 → 战略顾问 | 持续高价值 + 客户成功跟进 | 标准咨询的 8% | — | — |
| 任意阶段 → past_due | 自动续费失败 + 重试 3 次 | — | — | BR-403 |
| canceled → 复活 | 30 天内重新订阅 | — | — | BR-406 |

### 6.4 关键状态字段（数据表归属）

| 状态 | 字段 | 表 | 子 Spec |
|---|---|---|---|
| trial / paying_* / past_due / canceled / reactivated / expired | `subscriptions.status` | `subscriptions` | [`07`] |
| dispatched / quoted / in_service / rated / commission_* | `dispatches.status` | `dispatches` | [`22`] |
| consulting / referral_fee_* | `referral_fees.status` | `referral_fees` | [`22`] |
| strategic_* | `consulting_orders.contract_type` | `consulting_orders` | [`22`] / [`24`] |

❗ 完整的"订阅生命周期"子状态机（trial / active / paused / change_plan 等内部细节）见 [`07-subscription-billing` design.md]，本节只展示**核心商业漏斗**层面。

---

## 7. 派单决策的核心序列图

### 7.1 TL;DR

> 体现 [`ADR-002`](../../../docs/decisions/2025-05-15-adr-002-dispatch-mechanism.md) 完整 6 步流程：**需求分类 → 池路由 → 4 维加权匹配 → 报价标色 → 客户选择 → 服务执行 → 双向评分 → 信誉变动 → 推荐费 / 分润结算**。覆盖 BR-307 至 BR-316、BR-331 至 BR-336。

### 7.2 完整派单流程序列图（含信誉与结算）

涉及子 Spec：[`22`] / [`21`] / [`27`] / [`09`]

```mermaid
sequenceDiagram
  autonumber
  participant Trigger as 触发模块<br/>（11/12/14/19 杀手锏）
  participant Disp as 22 dispatch
  participant Cls as classifier
  participant AntiF as 28 anti-fraud
  participant Pool as pool router
  participant Score as 4 维加权评分<br/>BR-336 含信誉权重
  participant RefP as 21 ref-price
  participant Notif as 27 notification
  participant Agent as 智能管家
  participant Client as 客户
  participant Rating as 22 rating
  participant Rep as 22 reputation
  participant Comm as 22 commission
  participant Pay as 09 payment

  Note over Trigger,Disp: ① 客户产生需求（杀手锏识别需求信号）
  Trigger->>Disp: createDispatchNeed({clientId, type, amount})
  Note over Disp,Cls: ② 系统分类 A/B/C（BR-307）
  Disp->>Cls: classify(type, amount)
  alt B / C 类
    Cls-->>Disp: class=B 或 C→升级为 B
    Disp->>Disp: 自动转高端服务货架（BR-316）<br/>跳过智能管家池，进 §7.3 流程
  end
  Cls-->>Disp: class=A
  Note over Disp,Pool: ③ A 类走智能管家池路由（BR-308）
  Disp->>Pool: route(client)
  alt 客户有归属智能管家 a 且类型匹配
    Pool->>Notif: 通知 a，24h 接单窗
    Pool-->>Agent: 归属智能管家专享
  else 跨域池
    Pool->>Score: 同省 + 类型兼容池
    Pool->>Pool: 收 5% 跨域介绍费给归属（BR-303）
  else 公开池
    Pool->>Score: 全国 + 4 维加权
  end
  Score->>Score: 加权评分 = 地区 + 业务子类 + 智能管家等级（信誉 LV5+20..LV1+1，BR-336）+ 月度满意度
  Score->>AntiF: 反薅检查（BR-315）<br/>同手机 / 设备 / VPN / 关联智能管家
  AntiF-->>Score: ok
  Score-->>Pool: Top 3 智能管家
  Note over Pool,Notif: ④ 限时 1h 抢单
  Pool->>Notif: 推送 Top 3 智能管家
  Note over Disp,Agent: ⑤ 智能管家报价（BR-310）
  Agent->>Disp: POST /dispatches/:id/quote {price, desc}
  Disp->>RefP: compare(price, refPrice)
  RefP-->>Disp: color=green/yellow/red/超价
  alt 超价 200%
    Disp->>Disp: 自动加"切到同乾方略"按钮
  end
  Note over Client,Disp: ⑥ 客户查看候选并选择
  Client->>Disp: GET /dispatches/:id<br/>看所有候选报价 + 评分 + 信誉
  Client->>Disp: POST /dispatches/:id/select {agentId}
  Disp-->>Agent: 中标通知
  Note over Agent,Client: ⑦ 服务执行
  Agent->>Disp: 服务进行 → 完成
  Disp->>Rating: 触发强制双向评分（BR-312）<br/>客户必填 / 智能管家选填
  Client->>Rating: POST /rate-agent {1-5★, 评价, 标签}
  Agent->>Rating: POST /rate-client {守信 / 一般 / 拖延 / 拒付}
  Note over Rating,Rep: ⑧ 双向信誉变动
  Rating->>Rep: applyDelta(agent, +5 完成 / +10 5★ / -20 差评 ...)<br/>BR-331 加减分
  Rating->>Rep: applyDelta(client, +10 按时付款 ...)<br/>BR-333
  Rep->>Rep: 写 reputation_logs（带 7 天申诉窗口，BR-335）
  Rep->>Rep: 重算等级（24h 缓冲，BR-332）
  Note over Disp,Comm: ⑨ 分润流转（BR-304）
  Disp->>Comm: 创建分润 status=frozen
  Note over Comm: 7 天保护期内无退款
  Comm->>Comm: status frozen → settlable
  Note over Comm: 月底统一结算
  Comm->>Comm: status settlable → withdrawable
  Agent->>Pay: POST /agent/withdrawals
  Pay->>Pay: 审批 + 打款
  Pay-->>Agent: 完成
```

### 7.3 B/C 类直接同乾方略接管（推荐费给智能管家）

```mermaid
sequenceDiagram
  autonumber
  participant Trigger as 触发模块
  participant Disp as 22 dispatch
  participant Shelf as 22 premium-shelf
  participant Order as 服务订单
  participant TQ as 同乾方略团队
  participant Client as 客户
  participant Fee as 22 referral-fee
  participant Pay as 09 payment

  Trigger->>Disp: createDispatchNeed
  Disp->>Disp: classify=B 或 C→B（BR-307）
  Disp->>Shelf: 跳转高端服务货架（BR-316）
  Shelf-->>Client: 明码价 + 同乾方略接管说明
  Client->>Shelf: 提交咨询意向
  Shelf->>Order: 创建服务订单<br/>绑定归属智能管家 a（如有）
  TQ->>Order: 服务 → 客户验收
  Order->>Fee: 触发推荐费
  Fee->>Fee: 计算比例（BR-313：10–20%）<br/>注：LV3 以下封顶 10%（BR-332）
  Fee->>Fee: status=frozen
  Note over Fee: 7 天客户无投诉
  Fee->>Fee: status → settlable
  Note over Fee: 月底
  Fee->>Fee: status → withdrawable
  Fee-->>Agent智能管家: 工作台显示可提现
  Agent智能管家->>Pay: 申请提现
  Pay-->>Agent智能管家: 打款
```

❗ **关键约束**：
- 归属智能管家绑定在订单创建时确认，后续不可改（BR-102）。
- 推荐费状态机 `frozen → settlable → withdrawable → paid` 与智能管家分润状态机统一（BR-304）。
- 智能管家等级 LV3 以下接 B 类推荐费**仅按 10% 计**（BR-332），无法享受 15–20% 上限。

---

## 8. 信誉分变动的事件溯源设计

### 8.1 TL;DR

> 每条信誉分加减都通过**事件**触发，每条事件可追溯（事件源 + 时间戳 + 关联订单 + 申诉状态）。**申诉成立时反向回滚事件**（不修改原事件，新增"反向事件"，保持审计完整性）。事件最终一致性，等级变化有 24h 缓冲。

### 8.2 事件类型枚举（`packages/types/reputation/event-type.ts`）

```ts
enum ReputationEventType {
  // 智能管家加分（BR-331）
  AGENT_ORDER_COMPLETED = 'agent.order.completed',         // +5
  AGENT_RECEIVED_5STAR = 'agent.received.5star',           // +10
  AGENT_MONTHLY_TOP = 'agent.monthly.top',                 // +30 月度均分 ≥ 4.5★
  AGENT_REFERRED_NEW_AGENT = 'agent.referred.new_agent',   // +50
  AGENT_REFERRED_BIG_DEAL = 'agent.referred.big_deal',     // +100 推荐 B 类大单
  AGENT_REGION_PARTNER = 'agent.region.partner',           // +200/年
  AGENT_TRAINING_COMPLETED = 'agent.training.completed',   // +20/课
  AGENT_CONTINUOUS_ACTIVE = 'agent.continuous.active',     // +50 连续 12 月月活
  AGENT_NATURAL_RECOVERY = 'agent.natural.recovery',       // +20/月（cron）

  // 智能管家减分（BR-331）
  AGENT_RECEIVED_LOW_RATING = 'agent.received.low_rating', // -20 差评 < 3★
  AGENT_COMPLAINT_VALIDATED = 'agent.complaint.validated', // -50 投诉成立
  AGENT_QUOTE_OVERPRICED = 'agent.quote.overpriced',       // -10 超价 200%
  AGENT_NO_RESPONSE_24H = 'agent.no_response.24h',         // -5
  AGENT_SUSPENDED = 'agent.suspended',                     // -100
  AGENT_PENDING_DISPOSE = 'agent.pending.dispose',         // -300
  AGENT_RISK_VIOLATION = 'agent.risk.violation',           // -200
  AGENT_BLACKLISTED = 'agent.blacklisted',                 // 一票否决归零

  // 客户加分（BR-333）
  CLIENT_PAYMENT_ON_TIME = 'client.payment.on_time',       // +10
  CLIENT_GAVE_GOOD_RATING = 'client.gave.good_rating',     // +5
  CLIENT_RATED_ON_TIME = 'client.rated.on_time',           // +5
  CLIENT_CONTINUOUS_PAYING = 'client.continuous.paying',   // +50 连续 6 月付费
  CLIENT_UPGRADED_PLAN = 'client.upgraded.plan',           // +30

  // 客户减分（BR-333）
  CLIENT_PAYMENT_DELAYED = 'client.payment.delayed',       // -30
  CLIENT_PAYMENT_REFUSED = 'client.payment.refused',       // -100
  CLIENT_MALICIOUS_RATING = 'client.malicious.rating',     // -50
  CLIENT_REFUNDED_TOO_MANY = 'client.refunded.too_many',   // -50
  CLIENT_FRAUD_DETECTED = 'client.fraud.detected',         // -200

  // 反向事件（申诉成立）
  REVERSAL_BY_APPEAL = 'reversal.by.appeal',               // 与原事件等额反向
}
```

### 8.3 事件流架构图

```mermaid
graph LR
  subgraph 事件源["事件源（Source Modules）"]
    Rating[22 rating<br/>双向评分]
    Order[22 dispatch<br/>派单订单]
    Comm[22 commission<br/>分润]
    Activity[22 activity<br/>月活监控]
    AntiF[28 anti-fraud<br/>风控]
    Pay[09 payment<br/>退款]
    Sub[07 subscription<br/>升降档]
    Training[24 training<br/>培训]
    Cron[apps/worker<br/>cron 自然回血]
  end

  subgraph 总线["事件总线"]
    Bus[BullMQ<br/>reputation-events 队列]
  end

  subgraph 消费["消费者（22 reputation）"]
    Validator[事件校验器<br/>schema + 去重]
    Applier[applyDelta 服务<br/>原子写 reputation_logs<br/>+ 更新 reputation_scores]
    LevelResolver[等级解析<br/>BR-332 24h 缓冲]
    Notifier[等级变化通知<br/>→ 27 notification]
  end

  subgraph 申诉["申诉反向通道（BR-335）"]
    Appeal[22 appeal]
    Reversal[反向事件生成器]
  end

  Rating --> Bus
  Order --> Bus
  Comm --> Bus
  Activity --> Bus
  AntiF --> Bus
  Pay --> Bus
  Sub --> Bus
  Training --> Bus
  Cron --> Bus

  Bus --> Validator
  Validator --> Applier
  Applier --> LevelResolver
  LevelResolver --> Notifier

  Appeal --> Reversal
  Reversal --> Bus

  classDef src fill:#dde9fc,stroke:#1a4ea3
  classDef cons fill:#d4edda,stroke:#10b981
  classDef bus fill:#fff3cd,stroke:#f59e0b
  classDef appeal fill:#fde2e2,stroke:#dc2626

  class Rating,Order,Comm,Activity,AntiF,Pay,Sub,Training,Cron src
  class Validator,Applier,LevelResolver,Notifier cons
  class Bus bus
  class Appeal,Reversal appeal
```

### 8.4 事件溯源数据模型（`reputation_logs` 关键字段）

```prisma
model ReputationLog {
  id              String   @id @default(cuid())
  entity_id       String   // userId（客户）/ agentId（智能管家）
  entity_type     EntityType  // 'agent' | 'client'
  event_type      String   // ReputationEventType
  delta           Int      // 加减分（带符号）
  source_module   String   // 事件源模块（如 '22 rating'）
  source_resource String?  // 关联资源 ID（如 dispatchId / orderId）
  reason          String   // 人类可读说明
  metadata        Json?    // 额外上下文

  // 申诉相关（BR-335）
  appealable_until DateTime    // 创建后 7 天
  appeal_status    AppealStatus @default(none) // none / pending / upheld / overturned
  reversal_log_id  String?     // 若被反向，指向反向事件 id
  reverses_log_id  String?     // 若是反向事件，指向被反向的原事件 id

  // 标准字段
  tenant_id   String?  // null 表示跨租户事件（如平台层风控）
  created_at  DateTime @default(now())
  created_by  String?  // 系统事件为 null
  trace_id    String   // 协议 P-3

  @@index([entity_id, entity_type, created_at])
  @@index([appeal_status])
}
```

### 8.5 申诉反向回滚机制

```mermaid
sequenceDiagram
  autonumber
  participant A as 智能管家
  participant Appeal as 22 appeal
  participant Review as 24 admin（三级审核）
  participant Rev as 反向事件生成器
  participant Bus as 事件总线
  participant Rep as 22 reputation

  A->>Appeal: POST /reputation-logs/:id/appeal<br/>仅在 appealable_until 之前可发起
  Appeal->>Appeal: 查 reputation_logs<br/>校验 appeal_status=none
  Appeal->>Review: 三级流程（BR-314）<br/>客服 24h → 风控 72h → 仲裁
  alt 申诉成立（upheld）
    Review->>Appeal: 决定 upheld
    Appeal->>Rev: 生成反向事件<br/>event_type=REVERSAL_BY_APPEAL<br/>delta=-原 delta<br/>reverses_log_id=原 id
    Rev->>Bus: 入队
    Bus->>Rep: 应用反向事件
    Rep->>Rep: 写新 reputation_log（不修改原条目）<br/>更新原条目 reversal_log_id
    Rep->>Rep: 重算 score + level<br/>（24h 缓冲见 BR-332）
    Rep->>A: 通知 + 公开纠正记录
  else 申诉驳回（overturned）
    Review->>Appeal: 决定 overturned
    Appeal->>Appeal: 更新 appeal_status<br/>不生成反向事件
  end
```

❗ **关键约束**：
- **永不删除原事件**：审计完整性（[`security-rules.md` §13](../../steering/security-rules.md)）。
- **反向事件等额反向**：原事件 -20 → 反向事件 +20，分数恢复。
- **7 天申诉窗口**：`appealable_until = createdAt + 7d`，超期不可申诉。
- **缓冲期累加**：24h 缓冲期内分数继续累加但等级不变（BR-332），用 BullMQ 延迟任务实现。

### 8.6 PBT 强制要求（落点 [`22`]）

| 属性 | 描述 |
|---|---|
| 分数边界 | ∀ 任意行为序列：分数 ∈ [0, 1000] |
| 反向回滚还原性 | ∀ 事件 e + 反向事件 r：score(after r) = score(before e) |
| 等级单调性 | ∀ 任意分数：等级解析 ∈ {LV1..LV5} 且单调 |
| 自然回血上限 | ∀ 月度活跃：自然回血 ≤ +20/月 |

---

## 9. AI 输出 Tier 分级的实现机制

### 9.1 TL;DR

> Tier 在 **PromptTemplate 中以函数形式声明**（`tier(ctx) => 1|2|3|4`）。`ai-gateway/tier-resolver.service.ts` 在调用前解析，决定输出深度 + nextStepHint + 引导文案。**所有 AI 输出强制带 4 要素**（disclaimer / tier / confidence / nextStepHint，BR-322）。

### 9.2 PromptTemplate 中的 Tier 配置

```ts
// apps/api/src/prompts/risk-review/contract-review-pro.ts
import { z } from 'zod';
import { PromptTemplate } from '@/ai-gateway/types';
import { ContractReviewOutputSchema } from './schemas';

export const ContractReviewProPrompt: PromptTemplate = {
  taskType: AiTaskType.CONTRACT_REVIEW_PRO,
  version: 'v3',
  description: '专业级合同审查',

  // ❗ Tier 解析函数（BR-321）
  tier: (ctx: TierContext) => {
    if (ctx.projectAmount < 10_000_000) return 1;       // < ¥1000 万 → 主动指导
    if (ctx.projectAmount < 50_000_000) return 2;       // ¥1000–5000 万 → 分析 + 人工复核
    return 3;                                            // ≥ ¥5000 万 → 仅整理 + 引导
  },

  // 模型配置
  primaryModel: 'claude-sonnet-4-6',
  fallbackModel: 'qwen-max',
  needsSanitize: true,

  // System Prompt（依赖 tier 的部分由 builder 注入）
  systemPrompt: `你是建筑业资深合同律师...

【红线表述清单（BR-323）】
❌ 禁用："必须"、"一定"、"绝对"、"我建议你这样做"
✅ 必用："建议关注"、"通常做法"、"参考行业惯例"`,

  // 输出 schema（强制 4 要素，BR-322）
  outputSchema: ContractReviewOutputSchema,

  fallbackText: '抱歉，AI 暂时无法处理本次请求，已退还点数，请稍后重试。',
};
```

### 9.3 4 强制要素 schema（packages/types/ai-report/required-elements.ts）

```ts
import { z } from 'zod';

export const RequiredElementsSchema = z.object({
  // BR-322 强制要素 1
  disclaimer: z.string().min(20).default(
    '本报告由 AI 生成，仅作为日常参考工具使用，不构成专业法律 / 财务 / 投资意见。' +
    '重大决策请咨询持牌专业人士或同乾方略团队。'
  ),
  // BR-322 强制要素 2
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  // BR-322 强制要素 3
  confidence: z.enum(['high', 'medium', 'low']),
  // BR-322 强制要素 4
  nextStepHint: z.enum([
    'use-directly',              // Tier 1
    'apply-human-review',        // Tier 2
    'apply-tongqian-consult',    // Tier 3
    'mandatory-human-takeover',  // Tier 4
  ]),
});

// 业务输出 schema 必须 .merge(RequiredElementsSchema)
export const ContractReviewOutputSchema = z.object({
  summary: z.object({/* ... */}),
  risks: z.array(z.object({/* ... */})).max(60),
  recommendations: z.array(z.string()).max(10),
}).merge(RequiredElementsSchema);
```

### 9.4 AI Gateway 调度时序

```mermaid
sequenceDiagram
  autonumber
  participant Biz as 业务模块
  participant GW as 04 ai-gateway
  participant Resolver as tier-resolver.service
  participant Builder as prompt-builder
  participant Provider as 模型 Provider
  participant Validator as output-validator
  participant Filter as 引导文案注入器

  Biz->>GW: invoke({taskType, input, context:{projectAmount}})
  GW->>Resolver: resolve(template.tier, context)
  Resolver-->>GW: tier=2
  alt tier === 4
    GW->>GW: 拒绝调用模型，直接返回"强制人工接管"卡片
  end
  GW->>Builder: buildPrompt(template, input, tier)
  Note over Builder: 按 tier 注入不同 system prompt 后缀：<br/>Tier 1: "可主动给方案"<br/>Tier 2: "给分析框架，结尾推人工复核"<br/>Tier 3: "仅做整理，禁止给方案"
  Builder-->>GW: messages
  GW->>Provider: invoke
  Provider-->>GW: raw output
  GW->>Validator: parse(template.outputSchema)
  alt schema 失败 / 缺要素
    Validator-->>GW: 重试 ≤ 2 次 / 失败退点
  end
  Validator-->>GW: typed output
  GW->>Filter: 注入 nextStepHint + 引导文案<br/>BR-324 让企业先尝试自做
  Note over Filter: Tier 2/3 自动追加：<br/>"以上是 AI 整理的关键要点。<br/>建议您先按这些要点尝试自己处理，<br/>如遇执行难题，可点击 [申请人工复核]。"
  Filter-->>GW: 最终输出
  GW-->>Biz: AiResponse<T>
```

### 9.5 Tier 输出格式差异

| Tier | 输出风格 | nextStepHint | UI 表现 |
|---|---|---|---|
| 1 | 可执行方案 + 具体建议 | `use-directly` | 报告底部按钮：保存 / 复制 |
| 2 | 分析框架 + 关键风险点 | `apply-human-review` | 报告底部按钮：申请人工复核（连接 [`24-admin-console`] 工单）|
| 3 | 信息整理 + 风险提示，**SHALL NOT 出方案** | `apply-tongqian-consult` | 报告底部按钮：申请同乾方略咨询（跳 `/services/premium`）|
| 4 | **拒绝输出**，仅信息卡片 + 转人工 | `mandatory-human-takeover` | 全屏卡片：直接转人工（不可关闭）|

### 9.6 PBT 强制要求（落点 [`04`]）

| 属性 | 描述 |
|---|---|
| Tier 解析单调性 | ∀ projectAmount ↑：tier ∈ {1,2,3} 单调非递减（边界除外）|
| 4 要素完整性 | ∀ AI 输出：schema.parse 失败 ⟹ 4 要素缺失 |
| 红线表述拦截 | ∀ AI 输出：不含 "必须 / 一定 / 绝对" 等词 |
| 脱敏 round-trip | ∀ 输入 x：unmask(mask(x)) === x（BR-504）|

---

## 章节交叉引用

| 主题 | 见 |
|---|---|
| 整体架构总图 + 17 大功能区 + 5 大架构决策 | [`design.md` §2](./design.md) |
| 28 个子 Spec 依赖图 + 串行/并行约束 | [`design.md` §4](./design.md) |
| 61 条 BR → 物理实现位置映射表 | [`design.md` §5](./design.md) |
| packages 层级关系 + 错误码命名空间 | [`design.md` §11](./design.md) |
| 8 个关键设计权衡 | [`design.md` §14](./design.md) |
| 开放问题与延后决策 | [`design.md` §15](./design.md) |
| 4 层 WHERE 多租户隔离 4 道防线 | [`design-protocols.md` §10](./design-protocols.md) |
| 部署与发布架构（灰度 / 回滚）| [`design-protocols.md` §12](./design-protocols.md) |
| 5 个跨子 Spec e2e 集成测试场景 | [`design-protocols.md` §13](./design-protocols.md) |
| 跨模块协议 P-1 至 P-8 | [`design-protocols.md` 附录 A](./design-protocols.md) |
