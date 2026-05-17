# 16 项目部生产模块 - Design

## 1. 模块结构

```
apps/api/src/modules/project-site/
├── project-site.module.ts
├── projects/                          # 项目维度
├── construction-log/
│   ├── log.service.ts
│   └── prompts/log-summary.ts
├── contact-letter/                    # 联系函
│   ├── contact-letter.service.ts
│   └── prompts/letters/               # 10+ 模板
├── progress-payment/                  # 进度款
│   ├── progress.service.ts
│   └── prompts/progress-application.ts
├── major-hazard/                      # 危大方案
│   ├── major-hazard.service.ts
│   └── prompts/major-hazard.ts
└── archive/
    ├── archive-checklist.service.ts
    └── archive-self-check.service.ts
```

## 2. 数据模型

```prisma
model Project {
  id              String   @id @default(cuid())
  tenant_id       String
  name            String
  contract_id     String?
  status          String   // ongoing / completed / suspended
  start_at        DateTime?
  expected_end_at DateTime?
  region          String?
  type            String?  // 房建 / 市政 / ...
  pm_user_id      String?
  meta            Json?
  @@index([tenant_id, status])
}

model ConstructionLog {
  id              String   @id @default(cuid())
  project_id      String
  log_date        DateTime
  photos_urls     Json     // OSS urls
  user_input      String
  ai_summary      String
  tags            Json     // [{type:'部位', value:'地下室'}]
  ai_task_id      String   @unique
  created_by      String
  created_at      DateTime @default(now())
  @@index([project_id, log_date])
}

model ContactLetter {
  id              String   @id @default(cuid())
  project_id      String
  type            String   // 模板 key
  content         String   @db.Text
  pdf_url         String?
  status          String   // draft / approved / sent
  approval_flow_id String?
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model ProgressPaymentApp {
  id              String   @id @default(cuid())
  project_id      String
  period          String   // 2025-05
  completed_value Decimal  @db.Decimal(15,2)
  application_doc_url String
  ai_task_id      String   @unique
  status          String
  created_at      DateTime @default(now())
}

model MajorHazardPlan {
  id              String   @id @default(cuid())
  project_id      String
  hazard_type     String   // 深基坑 / 高大模板 / ...
  outline_doc_url String
  needs_expert_review Boolean @default(true)
  ai_task_id      String   @unique
}

model ArchiveChecklist {
  id              String   @id @default(cuid())
  project_id      String
  region          String
  project_type    String
  required_items  Json
  uploaded_items  Json
  missing_items   Json
  ai_task_id      String   @unique
}
```

## 3. PromptTemplate

- `site.log.summarize`：T1
- `site.contact_letter.{type}`：T1（10+ 模板）
- `site.progress_payment`：T1
- `site.major_hazard`：T1，但强制建议专家论证
- `site.archive.checklist`：T1（按地区数据来自 [`20`]）

## 4. 关键 API

```yaml
POST /api/v1/projects
GET  /api/v1/projects/me
POST /api/v1/projects/:id/logs
POST /api/v1/projects/:id/contact-letters
POST /api/v1/projects/:id/progress-payments
POST /api/v1/projects/:id/major-hazards
POST /api/v1/projects/:id/archive-checklist
```

## 5. 错误码

`SITE.*`：
- `SITE.PROJECT_NOT_FOUND` (404)
- `SITE.SUBSCRIPTION.PLAN_INSUFFICIENT` (402, 需 ¥499+)
- `SITE.PHOTO_LIMIT_EXCEEDED` (413)

## 6. PBT

| 属性 | 函数 |
|---|---|
| 仅 ¥499+ 可访问 | guards |
| 联系函必含项目编号 | letter prompt |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `site.daily_photo_limit` | 默认 20 |
| `site.contact_letter.types` | 10+ 模板列表 |


---

## V4 升级·安全生产降级（R7 / P3 决策）

### V4.1 SHALL NOT 清单（合规边界）

- SHALL NOT 实现"安全生产工作台"
- SHALL NOT 实现"实名制管理"
- SHALL NOT 实现"农民工工资专户管理"
- SHALL NOT 实现"危大工程方案专家论证"
- 安全生产仅作为"轻量月度提醒"，不占首页 / 主菜单

### V4.2 月度提醒服务（轻量）

```
apps/api/src/modules/project-site/safety-reminder/
├── policy-update-notifier.worker.ts   # 政策更新月度推送
├── seasonal-checklist.service.ts       # 雨季 / 春节安全自查清单
└── safety-officer-tracker.service.ts   # 资质动态核查中安全员变更提醒
```

提醒触达通过 27-spec notification-center，作为消息中心的一类，不显眼推送。
