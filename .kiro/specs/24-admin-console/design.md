# 24 平台后台 - Design

## 1. 模块结构

```
apps/api/src/modules/admin-ops/
├── admin-ops.module.ts
├── data-source/                       # 数据源管理（[`20`] 抓取监控）
├── rule-review/                       # 规则审核（[`20`] / [`21`]）
├── prompt-management/                 # Prompt 模板 + A/B
├── model-routing/                     # 模型路由 + provider 健康
├── report-template/                   # 报告模板
├── approval-flow/                     # 审批流配置
├── business-ops/                      # 业务运营看板
│   ├── kpi-dashboard.service.ts
│   └── red-line-monitor.service.ts    # BR-901 cron 5min
├── monthly-review/                    # BR-902
│   └── monthly-review.worker.ts       # 每月 1 号
├── agent-management/                  # 智能管家管理
│   ├── agent-list.service.ts
│   └── reputation-adjust.service.ts   # 手动调分（含审计）
├── client-management/                 # 客户管理
├── approval-desk/                     # 退款 / 提现 / 用印工作台
├── finance/                           # 财务对账
│   ├── reconciliation.service.ts
│   └── monthly-payout.worker.ts       # 每月 5 号
├── system-config/                     # ⭐ system_configs 后台（OPC 核心）
│   ├── system-config.service.ts       # 起步骨架由 [`02`] G1 实现
│   ├── config-history.service.ts
│   └── cache-invalidator.service.ts   # Redis pub/sub
└── audit-viewer/

apps/admin/src/                        # 前端
├── app/
│   ├── ops/                           # 业务运营看板首页
│   ├── prompts/
│   ├── routing/
│   ├── rules/
│   ├── templates/
│   ├── approvals/
│   ├── agents/
│   ├── clients/
│   ├── finance/
│   ├── audit/
│   └── system-config/
└── tailwind.config.ts                 # 表格密度 +20% + 移除装饰
```

## 2. 数据模型

```prisma
model SystemConfig {
  id            String   @id @default(cuid())
  key           String   @unique  // 'subscription.plans.v1' / 'dispatch.weights' / ...
  value         Json
  description   String?
  category      String   // subscription / dispatch / reputation / ai / ops
  is_active     Boolean  @default(true)
  updated_by    String?
  updated_at    DateTime @updatedAt
  created_at    DateTime @default(now())
}

model SystemConfigHistory {
  id            String   @id @default(cuid())
  config_key    String
  prev_value    Json?
  new_value     Json
  change_reason String?
  changed_by    String
  approval_flow_id String?  // 高敏感配置走审批
  changed_at    DateTime @default(now())
  @@index([config_key, changed_at])
}

model RedLineAlert {
  id            String   @id @default(cuid())
  red_line_key  String   // 'monthly_churn_rate' / 'ai_unit_cost' / ...
  threshold     Decimal
  actual_value  Decimal
  status        String   // open / resolved
  triggered_at  DateTime @default(now())
  resolved_at   DateTime?
  notes         String?
}

model MonthlyReview {
  id            String   @id @default(cuid())
  year_month    String   // 2025-05
  red_lines_status Json
  oq_status     Json
  preparation_checklist_status Json
  generated_at  DateTime @default(now())
}

model PromptABTest {
  id            String   @id @default(cuid())
  task_type     String
  version_a     String
  version_b     String
  weight_a      Int      // 0-100
  status        String
  metrics       Json     // satisfaction / cost / 重生成率
  started_at    DateTime
  ended_at      DateTime?
}
```

## 3. 关键服务

### 3.1 SystemConfigService（OPC 核心）

```ts
@Injectable()
export class SystemConfigService {
  private cache = new LRU<string, any>(200);

  async get<T>(key: string, fallback: T): Promise<T> {
    if (this.cache.has(key)) return this.cache.get(key);
    const cfg = await this.repo.findUnique({ where: { key, is_active: true } });
    const value = cfg?.value ?? fallback;
    this.cache.set(key, value);
    return value;
  }

  async set(key: string, value: unknown, ctx: { userId: string; reason: string }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const prev = await tx.systemConfig.findUnique({ where: { key } });
      await tx.systemConfig.upsert({
        where: { key },
        create: { key, value, updated_by: ctx.userId },
        update: { value, updated_by: ctx.userId },
      });
      await tx.systemConfigHistory.create({
        data: {
          config_key: key,
          prev_value: prev?.value ?? null,
          new_value: value,
          change_reason: ctx.reason,
          changed_by: ctx.userId,
        },
      });
      await this.audit.write({ action: 'CONFIG_CHANGE', resourceId: key });
    });
    // Redis pub/sub 全 instance 失效缓存
    await this.redis.publish('config:invalidate', key);
  }
}
```

### 3.2 RedLineMonitorService（BR-901）

cron 5 分钟扫描 6 条红线，越界写 RedLineAlert + 推送企业微信 + 短信。

## 4. 关键 API（截选）

```yaml
# 业务运营
GET  /api/v1/admin/dashboard/kpis
GET  /api/v1/admin/red-lines/status

# Prompt
GET  /api/v1/admin/prompts
POST /api/v1/admin/prompts/:id/versions
POST /api/v1/admin/prompts/:id/ab-test

# 模型路由
GET  /api/v1/admin/ai/providers/health
PUT  /api/v1/admin/ai/routing            # 后台覆盖

# 智能管家 / 客户
GET  /api/v1/admin/agents
POST /api/v1/admin/agents/:id/reputation-adjust
GET  /api/v1/admin/clients
POST /api/v1/admin/clients/:id/blacklist

# 审批
GET  /api/v1/admin/approvals/pending
POST /api/v1/admin/approvals/:id/sign

# 申诉
GET  /api/v1/admin/appeals/pending
POST /api/v1/admin/appeals/:id/decide

# 系统配置
GET  /api/v1/admin/system-configs
PUT  /api/v1/admin/system-configs/:key
GET  /api/v1/admin/system-configs/:key/history

# 月报
GET  /api/v1/admin/monthly-reviews/:yearMonth
```

## 5. 错误码 `ADMIN.*`

- `ADMIN.CONFIG_KEY_LOCKED` (423，需审批的高敏感配置)
- `ADMIN.RED_LINE.ALERT_OPEN` (warning)

## 6. PBT

| 属性 | 函数 |
|---|---|
| Config 改动幂等 | SystemConfig.set |
| 缓存失效顺序：DB 先 + pub/sub 后 | SystemConfigService |
| 红线触发触发告警 | RedLineMonitor |

## 7. 后台覆盖（自身）

`admin.config.locked_keys`：哪些 config_key 改动需走审批（如 `subscription.plans.v1` / `agent.commission_rates` 必须 PLATFORM_OWNER + 2FA）。


---

## V4 升级·可视化管理 9 大新模块（R13-R21 实现）

### V4.1 Feature Flag 系统（R13）

```prisma
model FeatureFlag {
  id           String   @id @default(cuid())
  flag_key     String   @unique  // 如 "agent.predict-card"
  name_zh      String
  description  String?
  enabled      Boolean  @default(false)
  rollout_pct  Int      @default(0)  // 0-100
  rollout_strategy Json   // { byTenant: [...], byRole: [...], byRegion: [...] }
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

model FeatureFlagAuditLog {
  id         String   @id @default(cuid())
  flag_key   String
  operator_id String
  action     String   // toggled / strategy_changed / rolled_back
  before     Json
  after      Json
  reason     String
  created_at DateTime @default(now())
  
  @@index([flag_key, created_at])
}
```

```
apps/api/src/modules/admin/feature-flag/
├── feature-flag.service.ts           # 检查 / 切换 / 灰度
├── flag-evaluator.service.ts         # 业务代码调用 isEnabled()
└── flag-audit.service.ts             # 操作审计
```

### V4.2 公告 / 通知系统（R14）

```prisma
model PlatformAnnouncement {
  id            String   @id @default(cuid())
  title         String
  content       String   // Markdown
  template_id   String?  // 复用模板
  target_audience Json   // { roles: [...], tenantIds: [...], regions: [...] }
  channels      String[] // station / sms / wechat_mp / wechat_work
  status        String   // draft / approved / sending / sent / cancelled
  approver_id   String?
  approved_at   DateTime?
  scheduled_at  DateTime?
  sent_at       DateTime?
  created_by    String
  created_at    DateTime @default(now())
}
```

```
apps/api/src/modules/admin/announcement/
├── announcement.service.ts
├── template-library.service.ts        # 20+ 类模板
└── delivery-router.service.ts         # 多通道分发
```

### V4.3 数据库管理（R15）

```
apps/api/src/modules/admin/database/
├── backup.service.ts                  # 备份历史可视化
├── restore.service.ts                 # 一键恢复（带双签）
├── partition-cleaner.worker.ts        # 6 年滚动清理审计日志
└── data-export.service.ts             # 脱敏导出
```

### V4.4 系统日志 + 性能仪表盘（R16 / R17）

```
apps/api/src/modules/admin/observability/
├── log-search.service.ts              # 错误 / 慢 / 安全事件
├── trace-viewer.service.ts            # traceId 全链路可视化
├── metrics-aggregator.service.ts      # QPS / 延迟 / 错误率 / AI 成本
└── alert-config.service.ts            # 阈值可调
```

### V4.5 智能管家审核工作台（R18）

```prisma
model AgentReviewQueue {
  id            String   @id @default(cuid())
  agent_id      String   @unique
  status        String   // pending / approved / rejected
  reviewer_id   String?
  reviewed_at   DateTime?
  reject_reason String?
  appeal_deadline DateTime?
  created_at    DateTime @default(now())
}
```

```
apps/api/src/modules/admin/agent-review/
├── review-queue.service.ts            # 24-72h 审核队列
├── review-action.service.ts           # 通过 / 拒绝 / 复议
└── appeal-handler.service.ts          # 7 天内申诉
```

### V4.6 案例市场审核工作台（R19）

```
apps/api/src/modules/admin/case-review/
├── case-queue.service.ts              # 队列（连接 22-spec AgentCaseStudy）
├── ai-pre-review-trigger.service.ts   # 触发 AI 自动审
└── expert-decision.service.ts         # 专家审 + +50/+200 点 + 信誉 +30
```

### V4.7 政策资金管理工作台（R20）

```
apps/api/src/modules/admin/policy-fund/
├── fund-crud.service.ts                # 30+ 资金 CRUD
├── trigger-scan.service.ts             # 红色"立即扫描"按钮
├── pending-pool.service.ts             # 待审池
└── rollout-control.service.ts          # 5/25/50/100% 灰度
```

### V4.8 上瘾机制后台（R21）

```prisma
model AddictionConfig {
  id           String   @id @default(cuid())
  hook_id      String   @unique  // 12.1 / 12.2 / S1 / S2 ...
  enabled      Boolean  @default(true)
  threshold_json Json    // 各机制阈值
  reward_config_json Json
  rollout_pct  Int      @default(100)
  updated_at   DateTime @updatedAt
}

model RewardClaim {
  id             String   @id @default(cuid())
  user_id        String
  hook_id        String
  reward_type    String   // credits / physical / cash
  amount         Decimal?
  status         String   // pending / approved / shipping / paid / completed
  shipping_address Json?
  approver_id    String?
  approved_at    DateTime?
  paid_at        DateTime?
  tax_withheld   Decimal?  // ≥¥800 个税 20% 代扣
  remark         String?
  created_at     DateTime @default(now())
}
```

```
apps/api/src/modules/admin/addiction-config/
├── hook-config.service.ts              # 16 个钩子开关 + 阈值
├── reward-clearing.service.ts          # 3 层清算（点数 / 实物 / 现金）
└── tax-withholding.service.ts          # ≥¥800 对公转账 + 20% 代扣
```
