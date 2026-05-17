# 23 政府 / 央国企 - Design

## 1. 模块结构

```
apps/api/src/modules/gov-soe/
├── gov-soe.module.ts
├── policy-learning/                    # 复用 [`20-knowledge-system`] 政策库
│   └── policy.controller.ts            # 仅政府用户可访问
├── document-drafting/                  # 公文起草
│   ├── drafting.service.ts
│   └── prompts/
│       ├── official-letter.ts
│       ├── leadership-speech.ts
│       ├── research-report.ts
│       └── ...
├── project-sourcing/                   # 项目寻源
│   ├── sourcing.service.ts
│   ├── matching.service.ts             # 政府项目 ↔ 建筑企业
│   ├── secure-chat.service.ts          # 脱敏聊天
│   └── witness-log.service.ts          # 平台见证
├── consult-entry/                      # 化债 / 投融资入口
│   └── consult.service.ts              # 调 [`22`] premium-shelf
└── compliance/
    ├── field-mask.service.ts           # 字段级权限
    ├── domestic-only.guard.ts          # 强制国产模型
    └── gov-audit.service.ts            # 独立审计

apps/gov/src/                           # 独立前端
├── app/
│   ├── policy/
│   ├── docs/
│   ├── sourcing/
│   └── consult/
└── tailwind.config.ts                  # accent 移除 + 字号 +1
```

## 2. 数据模型

```prisma
model GovProjectSourcing {
  id              String   @id @default(cuid())
  publisher_tenant_id String
  title           String
  description     String   @db.Text
  region          String
  industry        String
  amount_estimate Decimal? @db.Decimal(15,2)
  masked_summary  String   @db.Text
  contact_revealed Boolean  @default(false)
  status          String
  published_at    DateTime @default(now())
}

model GovProjectIntent {
  id              String   @id @default(cuid())
  sourcing_id     String
  bidder_tenant_id String
  status          String   // submitted / accepted / rejected
  chat_room_id    String?
  created_at      DateTime @default(now())
}

model SecureChatMessage {
  id              String   @id @default(cuid())
  room_id         String
  sender_id       String
  content_masked  String
  attachments_masked Json?
  witness_hash    String   // 防篡改
  sent_at         DateTime @default(now())
}

model GovDocumentDraft {
  id              String   @id @default(cuid())
  tenant_id       String
  user_id         String
  doc_type        String
  content         String   @db.Text
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model GovConsultIntent {
  id              String   @id @default(cuid())
  tenant_id       String
  topic           String   // 化债 / ABS / REITs / SPV
  amount_estimate Decimal?
  status          String
  consulting_order_id String?
  assigned_consult_id String?
  created_at      DateTime @default(now())
}

model GovAuditLog {
  // 独立审计表（与 audit_log 不同表，6 年留存）
  id              String   @id @default(cuid())
  // ... 同 audit_log 字段 + retention_until
}
```

## 3. 强制国产模型 Guard

```ts
// apps/api/src/modules/gov-soe/compliance/domestic-only.guard.ts
@Injectable()
export class DomesticOnlyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (req.tenantContext.scopeType === 'GOV') {
      // 调 ai-gateway 时强制 needsSanitize=false + provider=domestic
      req.aiOverrides = { force_domestic: true };
    }
    return true;
  }
}
```

## 4. 关键 API

```yaml
# 政策（复用 [`20`]，限政府用户）
GET  /api/v1/gov/policies
POST /api/v1/gov/policies/:id/impact

# 公文
POST /api/v1/gov/docs                  # 生成
GET  /api/v1/gov/docs/me

# 项目寻源
POST /api/v1/gov/sourcing              # 政府发布
GET  /api/v1/gov/sourcing
POST /api/v1/gov/sourcing/:id/intent   # 建筑企业表达意向
POST /api/v1/gov/sourcing/:id/reveal-contact  # 双方确认后揭示

# 咨询
POST /api/v1/gov/consult-intents
GET  /api/v1/gov/consult-intents/me
```

## 5. 错误码 `GOV.*`

- `GOV.OVERSEA_MODEL_FORBIDDEN` (403)
- `GOV.FIELD_MASKED` (forbidden field) 

## 6. PBT

| 属性 | 函数 |
|---|---|
| 政府用户 AI 调用强制国产 | DomesticOnlyGuard |
| 公文输出禁政治敏感词 | output-validator |
| 项目寻源在揭示前不暴露联系方式 | sourcing.service |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `gov.field_mask.policies` | 字段级隔离规则 |
| `gov.consult.min_amount` | 默认 150000 |


---

## V4 升级·政策性资金作战地图（R5 实现）

### V4.1 数据模型

```prisma
model PolicyFund {
  id            String   @id @default(cuid())
  code          String   @unique  // 资金代号（如 ULTRA_BOND / SPECIAL_BOND）
  category      PolicyFundCategory  // 5 大类
  name_zh       String   // 中文全名
  name_short    String   // 简称
  authority     String   // 主管部门
  scope         String[] // 适用项目类型 / 行业
  amount_pool   String?  // 总盘子描述（"年发 1.3 万亿"）
  apply_window  Json?    // 申报窗口期（多段）{start, end, batch_no}
  evaluation_points Json // 评审打分要点
  doc_links     String[] // 政策文件 PDF 链接
  ai_summary    String   // AI 抽取摘要
  status        PolicyFundStatus
  province      String?  // 省级专项的省名
  rollout_pct   Int      @default(0)  // 灰度百分比 0-100
  pinned        Boolean  @default(false) // 置顶
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  expert_review_at DateTime?
  expert_id     String?
  
  @@index([category, status])
  @@index([apply_window], type: Gin)
}

enum PolicyFundCategory {
  NATIONAL_COMPREHENSIVE  // A 国家级综合 11 项
  MINISTRY_SPECIAL        // B 部委专项 9 项
  PROVINCIAL_SPECIAL      // C 省级专项 8 项
  INDUSTRY_FUND           // D 行业基金 / 国资 4 项
  POLICY_LOAN             // E 政策性银行贷款 4 项
}

enum PolicyFundStatus {
  draft           // 抓取后待审
  pending_expert  // 待专家审
  rolling_out     // 灰度中
  published       // 100% 上线
  retired         // 已下线（资金过期 / 终止）
}

model PolicyFundUserFollow {
  id           String   @id @default(cuid())
  fund_id      String
  user_id      String
  tenant_id    String
  notify_30d   Boolean  @default(true)
  notify_14d   Boolean  @default(true)
  notify_7d    Boolean  @default(true)
  notify_1d   Boolean  @default(true)
  created_at   DateTime @default(now())
  
  @@unique([fund_id, user_id])
}

model PolicyFundApplication {
  id           String   @id @default(cuid())
  fund_id      String
  tenant_id    String
  applicant_id String   // 申请人 user_id
  project_name String
  amount_applied Decimal?
  status       String   // submitted / publicity / approved / paid / rejected
  submitted_at DateTime?
  approved_at  DateTime?
  rejected_reason String?
  ai_explanation String?  // 失败原因 AI 解读
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}
```

### V4.2 服务结构

```
apps/api/src/modules/gov/policy-fund/
├── crawler/                          # 4 层数据更新机制
│   ├── policy-fund-crawler.worker.ts # Layer 1：每日 6/12/18 三次定时
│   ├── manual-trigger.service.ts     # Layer 3：admin 一键扫描
│   └── source-registry.ts            # 11 大爬源
├── ai-extractor/
│   └── policy-fund-extractor.service.ts  # Layer 2：AI 抽取入待审池
├── expert-review/
│   └── policy-fund-review.service.ts # Layer 4：专家审 + 灰度发布
├── public-api/
│   ├── fund-list.service.ts          # 资金日历 / 列表 / 详情
│   ├── fund-match.service.ts         # 资金匹配引擎（500 点）
│   ├── fund-evaluation.service.ts    # 评审要点解读（300 点）
│   └── fund-template.service.ts      # 模板库
├── application/
│   └── application.service.ts        # 申报历史追踪 + AI 解读失败原因
└── notify/
    └── window-notifier.worker.ts     # 30/14/7/1 天节点提醒
```

### V4.3 一案两书（R5.5 实现）

```
apps/api/src/modules/gov/two-books/
├── implementation-plan.service.ts    # 项目实施方案
├── financial-eval.service.ts          # 财评（甲级造价咨询机构 placeholder）
├── legal-eval.service.ts              # 法评（律所 placeholder）
└── package-builder.service.ts         # 三件套打包成 PDF（含水印）
```

扣点 1500，强制国产模型，强制水印。

---

## V4 升级·政企公文水印（R8 / 28 spec R7 实现）

### V4.4 PDF / 报告水印服务

```
apps/api/src/modules/document-watermark/
├── watermark-renderer.service.ts     # 45° 倾斜 5% 透明度水印
├── watermark-meta-builder.service.ts # 生成人 + 时间 + IP + traceId
└── watermark-detector.service.ts     # 检测尝试去水印 → 写审计
```

水印内容：`内部使用，不对外 · {生成人} · {时间} · {IP}` + 尾页 traceId 二维码
