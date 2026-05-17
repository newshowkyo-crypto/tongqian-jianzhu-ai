# 06 鉴权与权限 - Design

## 1. 模块结构

```
apps/api/src/modules/
├── auth/
│   ├── auth.module.ts
│   ├── registration/
│   │   ├── building-company-registration.service.ts
│   │   ├── gov-registration.service.ts
│   │   ├── agent-registration.service.ts
│   │   ├── platform-user.service.ts
│   │   └── attribution.service.ts        # BR-102 永久绑定
│   ├── login/
│   │   ├── login.service.ts
│   │   ├── jwt.service.ts                # access + refresh
│   │   ├── two-factor.service.ts         # 2FA
│   │   └── lockout.service.ts            # 5 次失败锁定
│   ├── consent/
│   │   └── oversea-model-consent.service.ts  # BR-505
│   └── auth.controller.ts
├── tenant/
│   ├── tenant.service.ts
│   └── tenant-status.service.ts          # pending_review / active / rejected
├── user/
│   ├── invite/                           # BR-003 OWNER 邀请员工
│   ├── position-tag/                     # 30+ 岗位标签分配
│   └── devices/                          # 设备管理
├── data-export/                          # BR-104
│   ├── data-export.service.ts
│   └── data-export.controller.ts
├── approval/                             # 协议 P-7
│   ├── approval.module.ts
│   ├── approval-engine.service.ts
│   ├── approval-template.service.ts
│   └── approval.controller.ts
└── consent/

apps/api/src/common/
├── context/tenant-context.service.ts     # 防线 1
├── guards/
│   ├── jwt.guard.ts
│   ├── permission.guard.ts               # @RequirePermission
│   └── role.guard.ts                     # @Roles
├── decorators/
│   ├── public.decorator.ts
│   ├── require-permission.decorator.ts
│   └── tenant-context.decorator.ts
├── middleware/
│   ├── trace-id.middleware.ts            # 协议 P-3
│   └── tenant-context.middleware.ts
└── interceptors/
    ├── idempotency.interceptor.ts        # 协议 P-1
    └── audit.interceptor.ts              # 协议 P-2

apps/api/src/database/
├── repository/base.repository.ts         # 防线 2
└── prisma/scope-guard.middleware.ts      # 防线 3
```

## 2. 数据模型

```prisma
model Tenant {
  id                    String   @id @default(cuid())
  type                  TenantType  // BUILDING_COMPANY / GOV / AGENT / PLATFORM
  sub_type              String?     // ministry / soe / lgfv（gov）；agent subtype
  name                  String
  social_credit_code    String?  @unique  // 统一社会信用代码（建筑/政府）
  status                TenantStatus    // pending_review / training / active / rejected
  meta                  Json?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  users                 User[]
}

model User {
  id                    String   @id @default(cuid())
  tenant_id             String
  phone                 String   @unique
  email                 String?
  password_hash         String
  name                  String
  primary_role          UserRole
  platform_role         PlatformRole?
  position_tags         UserPositionTag[]
  is_2fa_enabled        Boolean  @default(false)
  totp_secret           String?
  status                UserStatus
  last_login_at         DateTime?
  created_at            DateTime @default(now())

  tenant                Tenant   @relation(fields: [tenant_id], references: [id])
  refresh_tokens        RefreshToken[]
  consents              UserConsent[]
  devices               UserDevice[]
}

model UserPositionTag {
  user_id    String
  tag        PositionTag
  assigned_by String
  assigned_at DateTime @default(now())

  @@id([user_id, tag])
}

model RefreshToken {
  id          String   @id @default(cuid())
  user_id     String
  token_hash  String   @unique
  device_id   String?
  expires_at  DateTime
  revoked_at  DateTime?
  ip          String?
  user_agent  String?
  created_at  DateTime @default(now())

  @@index([user_id, revoked_at])
}

model ClientAttribution {
  id           String   @id @default(cuid())
  client_id    String   @unique  // tenant_id of building company（BR-102 永久绑定）
  agent_id     String              // tenant_id of agent
  ref_code     String              // 推广码
  bound_at     DateTime @default(now())
  reassigned_from String?          // BR-103 重分配前归属

  @@index([agent_id])
}

model UserConsent {
  id           String   @id @default(cuid())
  user_id      String
  type         String   // 'oversea_model' / 'data_export' / 'eula' / 'privacy'
  version      String   // 协议版本
  granted_at   DateTime @default(now())
  revoked_at   DateTime?
  ip           String

  @@unique([user_id, type, version])
}

model ApprovalFlow {
  id              String   @id @default(cuid())
  type            String   // refund / withdrawal / data-export / appeal / platform-user-create / contract / 用印
  status          ApprovalStatus  // pending / in-progress / approved / rejected / expired
  resource_type   String
  resource_id     String
  initiator_id    String
  tenant_id       String?
  template_id     String              // 引用 ApprovalTemplate
  meta            Json?
  expires_at      DateTime?
  created_at      DateTime @default(now())
  closed_at       DateTime?

  steps           ApprovalStep[]
}

model ApprovalStep {
  id              String   @id @default(cuid())
  flow_id         String
  step_no         Int
  approver_role   String   // PLATFORM_FIN / OWNER / ...
  approver_id     String?
  required        Boolean  @default(true)
  requires_2fa    Boolean  @default(false)
  decision        ApprovalDecision  // approved / rejected / pending
  reason          String?
  signed_at       DateTime?

  @@unique([flow_id, step_no])
}

model ApprovalTemplate {
  id            String   @id @default(cuid())
  type          String
  version       Int
  steps_schema  Json     // 步骤定义（角色 / 是否 2FA / 是否必需 等）
  is_active     Boolean  @default(true)
  created_by    String
  created_at    DateTime @default(now())
}

enum TenantType { BUILDING_COMPANY GOV AGENT PLATFORM }
enum TenantStatus { pending_review training active rejected suspended }
enum UserStatus { active suspended deleted }
enum UserRole { BUILDING_COMPANY_USER GOV_USER AGENT PLATFORM }
enum PlatformRole { PLATFORM_OWNER OPS_MGR PLATFORM_FIN PLATFORM_CS PLATFORM_QA PLATFORM_EXPERT PLATFORM_CONSULT PLATFORM_AUDIT }
enum PositionTag { OWNER BIZ_DIRECTOR TECH_DIRECTOR FIN_DIRECTOR CONTRACT_MGR HR LEGAL BIZ_MGR TENDER_WRITER PM PM_CHIEF_TECH PM_BIZ PM_SAFETY PM_QC PM_DOC PM_CONSTRUCTION PM_LAB PM_MATERIAL PM_LABOR PM_EQUIPMENT DESIGNER /* ... */ }
enum ApprovalStatus { pending in_progress approved rejected expired }
enum ApprovalDecision { pending approved rejected }
```

## 3. 关键 API

```yaml
POST /api/v1/auth/register             # 4 大注册类型分流
POST /api/v1/auth/login                # 手机号 + 密码 + 短信
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/2fa/setup
POST /api/v1/auth/2fa/verify

POST /api/v1/users/invite              # OWNER 邀请员工（BR-003）
POST /api/v1/users/:id/position-tags   # 分配岗位标签
GET  /api/v1/users/me/devices
DELETE /api/v1/users/me/devices/:id    # 远程下线

POST /api/v1/users/me/consents         # BR-505 出境授权 等

POST /api/v1/data-exports/request      # BR-104（走审批）
POST /api/v1/data-exports/:id/confirm

POST /api/v1/approvals/:id/sign        # 审批人签字（含 2FA）
GET  /api/v1/approvals/me/pending      # 我的待审批
GET  /api/v1/admin/approvals           # 平台运营总览

POST /api/v1/admin/platform-users      # PLATFORM_OWNER 创建运营人员
POST /api/v1/admin/agents/:id/dispose  # BR-103 智能管家清退（22 模块调用）
```

## 4. 4 道防线实现细节

详见 [`design-protocols.md` §10](../00-project-overview/design-protocols.md)。本 spec 实现具体代码：

```ts
// 防线 1：TenantContext
@Injectable()
export class TenantContextService {
  private storage = new AsyncLocalStorage<TenantCtx>();
  run<T>(ctx: TenantCtx, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(ctx, fn);
  }
  get(): TenantCtx {
    const ctx = this.storage.getStore();
    if (!ctx) throw new TenantContextMissingError();
    return ctx;
  }
}

// 防线 2：BaseRepository（详见 §10.4）

// 防线 3：scope-guard.middleware.ts（详见 §10.5）

// 防线 4：跨租户 e2e 测试
// 每个写接口在 tests/e2e/ 必须有 tokenA 创建 → tokenB 拒绝访问 测试
```

## 5. 审批引擎核心逻辑

```ts
@Injectable()
export class ApprovalEngineService {
  async createFlow(req: {
    type: string;
    resourceType: string;
    resourceId: string;
    initiatorId: string;
    meta?: object;
  }): Promise<ApprovalFlow> {
    // 1. 找 active template
    const template = await this.templateService.getActive(req.type);
    // 2. 创建 flow + 解析 steps
    const flow = await this.repo.create({
      ...req,
      template_id: template.id,
      status: 'pending',
      steps: { create: this.parseSteps(template.steps_schema) },
    });
    // 3. 通知第 1 步审批人（[`27-notification-center`]）
    await this.notify.notifyApprover(flow, 1);
    return flow;
  }

  async sign(flowId: string, approverId: string, decision: 'approved' | 'rejected', reason?: string, twoFaCode?: string) {
    const flow = await this.repo.findOne(flowId);
    const step = flow.steps.find(s => s.decision === 'pending' && this.canSign(s, approverId));
    if (!step) throw new BusinessError('AUTH.APPROVAL.NO_PENDING_STEP');
    if (step.requires_2fa && !await this.twoFa.verify(approverId, twoFaCode)) {
      throw new BusinessError('AUTH.2FA.INVALID');
    }
    // 写入决策 + 审计（协议 P-2）
    await this.repo.signStep(step.id, { approverId, decision, reason });
    await this.audit.write({ action: `APPROVAL_${decision.toUpperCase()}`, resourceId: flow.resource_id });
    // 推进下一步 / 关闭流
    if (decision === 'rejected') {
      await this.repo.closeFlow(flowId, 'rejected');
    } else if (this.allStepsSigned(flow)) {
      await this.repo.closeFlow(flowId, 'approved');
      await this.dispatchApproved(flow);  // 调回业务模块
    } else {
      await this.notify.notifyApprover(flow, step.step_no + 1);
    }
  }
}
```

## 6. 错误码命名空间

`AUTH.*` / `PERM.*` / `TENANT.*`，关键：
- `AUTH.LOGIN.PASSWORD_INVALID` (401)
- `AUTH.LOGIN.LOCKED_OUT` (429)
- `AUTH.TOKEN.EXPIRED` (401)
- `AUTH.2FA.INVALID` (401)
- `AUTH.CONSENT.MISSING` (422)
- `AUTH.APPROVAL.NO_PENDING_STEP` (422)
- `PERM.DENIED` (403)
- `PERM.TENANT_MISMATCH` (404 防泄漏)
- `TENANT.CREATE.ALREADY_EXISTS` (409)
- `TENANT.PENDING_REVIEW` (403)

## 7. PBT 落点（强制）

| 属性 | 函数 |
|---|---|
| 4 层 WHERE 自动注入 | BaseRepository.withScope |
| Idempotency 幂等 | idempotency.interceptor |
| 审批步骤完整性 | ApprovalEngine.sign |
| JWT 签发 / 验证 round-trip | jwt.service |

## 8. 后台覆盖

| key | 控制 |
|---|---|
| `auth.login.lockout_threshold` | 失败锁定阈值（默认 5）|
| `auth.session.access_token_ttl_min` | 默认 30 |
| `auth.session.refresh_token_ttl_days` | 默认 30 |
| `approval.templates.{type}.steps` | 审批模板（步骤 / 角色 / 2FA）|

## 9. 测试

- 单测：每个 service ≥ 85% 覆盖
- e2e：4 大注册流程 + 4 道防线跨租户拒绝 + 审批流（退款 / 提现 / 数据导出）

## 10. 关键设计权衡

| 决策 | 选择 | 理由 |
|---|---|---|
| Refresh token 存储 | DB（可吊销）| 符合 [`security-rules.md` §1](../../steering/security-rules.md) |
| 多租户隔离 | 4 道防线 + 单库 WHERE | [`design.md` §14.2](../00-project-overview/design.md) |
| 审批引擎 | 数据驱动 | [`design.md` §14.7](../00-project-overview/design.md) OPC 友好 |
| ABAC 实现 | 4 层 WHERE 自动 | 不引入策略引擎（OPA）|


---

## V4 升级·注册流程升级（R3.4-R3.6 设计）

### V4.1 手机号 + 微信扫码统一注册

```
apps/api/src/modules/auth/registration/
├── unified-registration.service.ts     # 手机号 + 短信 + 微信扫码绑定
├── domain-router.service.ts             # 3 域名分流 + 角色硬绑定
├── conflict-detector.service.ts         # P5 冲突检测（3 类场景）
├── customer-migration.service.ts        # 客服迁移流程（智能管家 ↔ 老板）
└── agent-proxy-register.service.ts      # AGENT 代客户注册（永久绑定到该 AGENT）
```

### V4.2 冲突检测逻辑

```typescript
async function checkRegistrationConflict(phone: string, targetRole: UserRole) {
  const existing = await userRepo.findByPhone(phone);
  if (!existing) return { ok: true };
  
  if (existing.role === 'BUILDING_COMPANY_USER' && targetRole === 'AGENT') {
    return {
      ok: false,
      reason: 'CONFLICT_COMPANY_TO_AGENT',
      message: '您的手机号已注册建筑企业。如需做智能管家，请使用其他手机号或联系客服迁移。',
      action: 'cs-migration-link'
    };
  }
  if (existing.role === 'AGENT' && targetRole === 'BUILDING_COMPANY_USER') {
    return {
      ok: false,
      reason: 'CONFLICT_AGENT_TO_COMPANY',
      message: '您是智能管家，企业身份会与现有业务冲突。建议用配偶 / 合伙人手机号注册。',
      action: 'agent-proxy-register'
    };
  }
  if (existing.role === 'GOV_USER') {
    return { ok: false, reason: 'GOV_CANNOT_DUAL_ROLE' };
  }
  return { ok: true };
}
```
