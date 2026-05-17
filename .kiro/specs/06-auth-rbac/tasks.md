# 06 鉴权与权限 - Tasks

## 任务总数：16

## Phase A：基础设施层（3 个）

- [ ] **A1** 实现 `apps/api/src/common/context/tenant-context.service.ts`（防线 1，AsyncLocalStorage）+ `tenant-context.middleware.ts`
  - 验收：JWT 解析后能从任意 service 取到 ctx；Worker 任务通过 BullMQ 消息体传递重建

- [ ] **A2** 实现 `apps/api/src/database/repository/base.repository.ts`（防线 2）+ Prisma `scope-guard.middleware.ts`（防线 3）
  - 验收：PBT 强制 — 任意 ScopeContext + 任意 where → 注入 4 层 + deleted_at；故意绕过 BaseRepo 直接调 prisma 抛 ScopeViolationError

- [ ] **A3** 实现 `idempotency.interceptor.ts`（协议 P-1）+ `trace-id.middleware.ts`（P-3）+ `audit.interceptor.ts`（P-2）
  - 验收：所有非 GET 请求带 Idempotency-Key 24h 内重复返回首次结果；audit_log 写入完整字段

## Phase B：注册流程（3 个）

- [ ] **B1** 实现 `building-company-registration.service.ts` + `attribution.service.ts`（BR-001 / BR-002 / BR-102）
  - 验收：含 ref 的注册写入 client_attributions 唯一索引；OWNER 自动分配 OWNER 岗位标签

- [ ] **B2** 实现 `gov-registration.service.ts`（独立审核工单）+ `agent-registration.service.ts`（4 子类型选择 + 实名资料审核 + 信誉初始化桩，**零保证金**）
  - 验收：政府用户 status=pending_review；智能管家状态 pending_review → training → active（不再有 pending_deposit 状态）

- [ ] **B3** 实现 `platform-user.service.ts`（PLATFORM_OWNER 后台手动建立 + 强制 2FA + 审批 + 审计）
  - 验收：仅 PLATFORM_OWNER 可调；新用户首次登录强制改密 + 绑定 2FA

## Phase C：JWT + 登录（2 个）

- [ ] **C1** 实现 `jwt.service.ts`（access 30min + refresh 30d 入库可吊销）+ `login.service.ts` + `lockout.service.ts`（5 次失败锁 15 分钟）
  - 验收：refresh token 入库可吊销；锁定阈值后台可调

- [ ] **C2** 实现 `two-factor.service.ts`（TOTP）+ 异地登录短信验证 + 设备管理 API（含 [`05-windows-desktop`] UserDevice）
  - 验收：FIN/RISK/PLATFORM_OWNER 等强制 2FA；新设备登录触发短信

## Phase D：权限（RBAC + ABAC）（2 个）

- [ ] **D1** 实现 `permission.guard.ts` + `@RequirePermission('xxx:yyy')` 装饰器；`role.guard.ts` + `@Roles(...)` 装饰器
  - 验收：未授权返回 403；越权访问返回 404 防泄漏

- [ ] **D2** 实现 `hasPermission()` 工具（`packages/permissions`）+ controllers 标注权限点
  - 验收：30+ 起步权限点 + 按角色 / 岗位映射

## Phase E：用户管理（2 个）

- [ ] **E1** 实现 `user/invite/`（OWNER 邀请员工，BR-003）+ 岗位标签分配 API
  - 验收：手机号邀请 → 验证 → 加入 tenant + 分配 N 个岗位标签

- [ ] **E2** 实现 `user/devices/` 设备管理 API + 远程下线 + `user/me/consents/`（BR-505 出境授权）
  - 验收：设备列表可见 + 一键下线；未授权用户 AI 任务自动降级国产模型

## Phase F：审批引擎（协议 P-7）（2 个）

- [ ] **F1** 实现 `approval/approval-engine.service.ts` + `approval-template.service.ts`
  - 验收：能创建 flow → 推进 step → 关闭 flow；2FA 步骤强制验证

- [ ] **F2** 实现退款 / 提现 / 数据导出 / 平台用户创建 4 个起步审批模板（template seed）
  - 验收：4 个 type 各有可用 template；后台可读

## Phase G：数据导出（BR-104）（1 个）

- [ ] **G1** 实现 `data-export/data-export.service.ts`（OWNER + 二次密码 + 短信 + 审批 + 审计 + 异步导出 OSS）
  - 验收：仅 OWNER + PLATFORM_OWNER 可发起；强制 2 因子 + 审批 + 写审计

## Phase H：测试（1 个）

- [ ] **H1** 完整 e2e：4 道防线跨租户拒绝 + 4 大注册流程 + 审批流 + 数据导出
  - 验收：覆盖率 ≥ 85%；e2e 全绿

## 完成标准

- ✅ 所有业务模块经 BaseRepository 不可绕过 4 层 WHERE
- ✅ 所有写接口带 Idempotency / 审计 / traceId
- ✅ 4 大注册流程跑通
- ✅ 审批引擎可被退款 / 提现 / 数据导出复用


---

## V4 升级新增任务（注册流程升级 + P5 补丁）

- [ ] **06-V4-1** 手机号 + 短信 + 微信扫码统一注册（unionid 绑定，未来小程序复用）
- [ ] **06-V4-2** 3 个外部入口域名分流 + 角色硬绑定（agents.tongqian.io / gov.tongqian.io / www）
- [ ] **06-V4-3** 注册手机号冲突检测（BUILDING_COMPANY ↔ AGENT 互斥 / GOV 严禁兼任）
- [ ] **06-V4-4** "客服迁移"流程（智能管家 ↔ 老板身份切换）
- [ ] **06-V4-5** AGENT 工作台"代企业注册"功能（用客户手机号注册并永久绑定到该 AGENT）
- [ ] **06-V4-6** 智能管家审核 24-72h 队列 + 拒绝 7 天申诉
- [ ] **06-V4-7** 智能管家学院培训通关检测（status:training → status:active）
- [ ] **06-V4-8** e2e：3 类冲突场景 + 客服迁移 + 培训通关
