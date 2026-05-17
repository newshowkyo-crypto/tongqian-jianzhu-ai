# 06 鉴权与权限（Auth + RBAC + ABAC）- Requirements

## Introduction

> 平台**鉴权 + 多租户 + RBAC + ABAC + 审批引擎**核心模块。落地：
> - [`design.md` §5.2 BR-001 至 BR-005](../00-project-overview/design.md)（注册租户）
> - [`§5.3 BR-101 至 BR-104`](../00-project-overview/design.md)（多租户隔离）
> - [`design-flows.md` §3](../00-project-overview/design-flows.md)（4 大用户大类注册时序）
> - [`design-protocols.md` §10`](../00-project-overview/design-protocols.md)（4 道防线）+ §A.7（审批流统一接口 P-7）

**关联顶层**：[`design.md` §4 关键阻塞节点](../00-project-overview/design.md)，本 spec 阻塞商业核心 + 工作台。

**前置依赖**：[`02-shared-contracts`]

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| RBAC | Role-Based Access Control（基于角色的访问控制）|
| ABAC | Attribute-Based（基于资源属性的访问控制，如 belongs_to_project）|
| TenantContext | 请求级租户上下文（AsyncLocalStorage）|
| 审批引擎 | 数据驱动的多步审批流（[`design.md` §14.7](../00-project-overview/design.md)）|

---

## Requirements

### Requirement 1：4 大注册流程（BR-001 至 BR-005）

详见 [`design-flows.md` §3](../00-project-overview/design-flows.md) 4 张时序图。

#### Acceptance Criteria

1. **建筑企业注册**（[`design-flows.md` §3.2](../00-project-overview/design-flows.md)）：
   - `POST /api/v1/auth/register {role:'BUILDING_COMPANY_USER', ref?, ...}`
   - 反薅检查 → 创建 tenant + OWNER 用户 → 永久绑定归属智能管家（如有 ref）→ 试用版订阅 → 500 注册点 + 50 周签到 → JWT
2. **政府 / 央国企注册**（§3.3）：独立审核工单，状态 `pending_review`，CS 24h 内联系
3. **智能管家注册**（§3.3）：4 子类型选择 + 实名资料审核（零保证金）+ 信誉分初始化（500 / LV2）+ 强制培训
4. **平台运营创建**（§3.5）：仅 PLATFORM_OWNER 后台手动建立 + 强制 2FA

### Requirement 2：JWT + Refresh Token

#### Acceptance Criteria

1. THE access token：JWT，TTL 30 分钟
2. THE refresh token：UUID，TTL 30 天，**存数据库可吊销**（不仅靠签名）
3. THE 登录失败 5 次 SHALL 锁定 15 分钟
4. THE 异地登录 + 异常操作 SHALL 触发短信验证 + 临时锁定
5. THE 平台运营 / 财务 / 风控 / 专家角色 SHALL 强制 2FA

### Requirement 3：4 大用户大类 + 平台子角色 + 智能管家子类型 + 30+ 岗位标签

#### Acceptance Criteria

1. THE 注册角色 SHALL 仅 4 大：`BUILDING_COMPANY_USER` / `GOV_USER` / `AGENT` / `PLATFORM`（BR-001）
2. THE PlatformRole 子角色 8 个：`PLATFORM_OWNER` / `OPS_MGR` / `PLATFORM_FIN` / `PLATFORM_CS` / `PLATFORM_QA` / `PLATFORM_EXPERT` / `PLATFORM_CONSULT` / `PLATFORM_AUDIT`
3. THE AgentSubtype：`AGENT_QUAL` / `AGENT_TENDER` / `AGENT_FIN` / `AGENT_GENERAL`（BR-004）
4. THE PositionTag 30+ 个由 OWNER 邀请员工时分配（BR-003）

### Requirement 3.4：手机号 + 微信扫码统一注册（V4 升级）

#### Acceptance Criteria

1. **3 个外部入口域名分流 + 角色硬绑定**：
   - `www.tongqian.io`     → BUILDING_COMPANY_USER
   - `agents.tongqian.io`  → AGENT（审核制）
   - `gov.tongqian.io`     → GOV_USER（公函审核）
   - `admin.tongqian.io`   → 无注册（PLATFORM 由超管手动建）
2. **共用注册流程**：手机号 + 短信验证码 + 微信扫码绑定（用户首次注册即绑定 unionid，未来小程序无缝复用）
3. **登录方式**：手机号 + 短信 / 密码 / 微信扫码 三选一（同一账号）
4. **反薅 5 维去重**（BR-315）：手机号 / 身份证 / 营业执照 / IP / 设备指纹

### Requirement 3.5：注册手机号冲突检测（V4 新增 P5 补丁）

#### Acceptance Criteria

1. **建筑老板想注册智能管家**：
   - 系统检测到手机号已是 BUILDING_COMPANY_USER → SHALL 拒绝直接注册
   - SHALL 提示："您的手机号已注册建筑企业。如需做智能管家，请使用其他手机号或联系客服迁移。"
   - 提供"客服迁移"链接：CS 1-3 工作日审核 + 客户资源处理 + 重新建账户

2. **智能管家想注册建筑老板**：
   - 系统检测到手机号已是 AGENT → SHALL 拒绝直接注册
   - SHALL 提示："您是智能管家，企业身份会与现有业务冲突。建议用配偶 / 合伙人手机号注册。"
   - 提供 AGENT 工作台"代企业注册"功能（让客户用自己手机号注册并永久绑定到该 AGENT）

3. **政企用户兼任其他**：
   - GOV_USER 手机号 SHALL 严禁兼任任何其他角色（合规要求）
   - 检测到尝试 → 直接拒绝 + 写审计日志

### Requirement 3.6：智能管家审核流程（无保证金 V4 终版）

#### Acceptance Criteria

1. 智能管家提交注册：4 子类型 + 实名 + 名片 + 历史业绩选填 + 5 项合规承诺勾选（BR-XXX 详见 28-spec R5）
2. 反薅 5 维去重 + 黑名单核验
3. 状态 `pending_review` → CS 24-72h 人工审核
4. 通过 → 状态 `training` → 强制完成 6 节智能管家学院培训
5. 培训通关 → status:active → 信誉分初始化 500 / LV2 入职管家
6. 培训未通过 / 拒绝 → status:rejected + 7 天内可申诉
7. **零保证金**（已取消，详见 [ADR-AUTO-2026-05-16](../../../docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md)）

### Requirement 4：4 层 WHERE 多租户隔离（BR-101）

落地 [`design-protocols.md` §10](../00-project-overview/design-protocols.md) 4 道防线。

#### Acceptance Criteria

1. **防线 1 TenantContext**：`apps/api/src/common/context/tenant-context.service.ts`（AsyncLocalStorage）
2. **防线 2 BaseRepository**：`apps/api/src/database/repository/base.repository.ts`（强制注入）
3. **防线 3 Prisma middleware**：`apps/api/src/database/prisma/scope-guard.middleware.ts`（兜底）
4. **防线 4 跨租户 e2e 测试**：每个写接口必须测试拒绝跨租户访问
5. PBT 强制：任意 ScopeContext + 任意 where → 自动注入 4 层 + deleted_at

### Requirement 5：归属绑定（BR-102 / BR-103）

#### Acceptance Criteria

1. THE 归属绑定 SHALL 在注册带 `?ref={agentCode}` 时永久写入 `client_attributions`（uq client_id，agent_id 不可改）
2. THE 智能管家清退（连续 90 天月活 < 10%）SHALL 触发归属重分配（BR-103，由 [`22-agent-workspace`] 调用本模块接口）

### Requirement 6：数据导出权限（BR-104）

#### Acceptance Criteria

1. THE 全量数据导出 SHALL 仅 `OWNER` + `PLATFORM_OWNER` 可触发
2. THE 导出 SHALL 强制：二次密码确认 + 短信验证 + 写审计日志
3. THE 实现 SHALL 走审批引擎（协议 P-7）

### Requirement 7：审批引擎（协议 P-7）

#### Acceptance Criteria

1. THE `apps/api/src/modules/approval/` SHALL 提供数据驱动审批：
   - 审批模板：JSON Schema 定义 N 步、每步审批人角色 + 是否 2FA
   - 实例：审批工单 + 步骤 + 决策 + 签字
2. THE 审批引擎 SHALL 复用于：退款（BR-203）/ 提现 / 用印 / 数据导出（BR-104）/ 智能管家申诉（BR-314）/ 平台用户创建
3. THE 审批模板 SHALL 后台可视化拖拽配置（[`24-admin-console`] 实现 UI）

### Requirement 8：权限点（RBAC + ABAC）

#### Acceptance Criteria

1. 装饰器 `@RequirePermission('contract:approve')` 强制权限点检查
2. RBAC：角色 → 权限点（`packages/permissions/role-permission.ts`）
3. ABAC：资源归属（如 PM 仅可看自己项目的合同）由 `BaseRepository` 4 层 WHERE 自动实现
4. 操作类型：READ / WRITE / DELETE / APPROVE 分别检查

### Requirement 9：用户出境授权（BR-505）

#### Acceptance Criteria

1. 注册时 checkbox + 用户协议明示
2. 写入 `user_consents` 表（type='oversea_model'）
3. 未授权用户的 AI 任务自动路由国产模型（与 [`04-ai-gateway`] 集成）

### Requirement 10：会话管理

1. 多设备同时登录支持
2. "踢下线"操作（撤销 refresh token + 拉黑 access token jti）
3. 设备列表查看（含 [`05-windows-desktop`] 桌面端）

### Requirement 11：边界

1. SHALL NOT 实现 OAuth / 第三方登录（仅手机号 + 密码 + 短信，一期）
2. SHALL NOT 实现 SSO / SAML（一期）
3. SHALL NOT 在 RBAC 中实现资源级 ACL（仅角色 + 岗位标签 + ABAC 4 层 WHERE）

### Requirement 11.5：登录返回字段（与 [`03-design-system`] 联动）

#### Acceptance Criteria

1. THE 登录成功返回 SHALL 含 `defaultDashboard` 字段（基于角色 + PositionTag）：
   - OWNER → `'owner'`
   - TENDER_WRITER → `'tender_writer'`
   - PM / PM_* → `'pm'`（且 `subscriptionPlan ≥ ent`）
   - FIN_DIRECTOR → `'finance'`
   - PM_DOC → `'doc_staff'`
   - 其他岗位 → `'owner'`（默认）
2. 前端按此字段路由到 `packages/ui/dashboards/{key}Dashboard`

### Requirement 12：依赖

- 强依赖：[`02-shared-contracts`]
- 弱依赖：[`27-notification-center`]（短信验证）/ [`28-security-compliance`]（审计 / 反薅）
  - **不再依赖** [`09-payment-gateway`]：智能管家保证金已取消（ADR-AUTO-2026-05-16），改为零门槛 + 实名审核 + 强制培训
- 后续阻塞：所有商业核心 + 工作台 + 杀手锏
