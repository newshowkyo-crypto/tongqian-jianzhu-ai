# 12 标书工厂 - Design

## 1. 模块结构

```
apps/api/src/modules/tender/
├── tender.module.ts
├── tender.controller.ts
├── upload/
│   └── tender-upload.service.ts        # 文件上传 + 病毒扫描 + OSS
├── summary/
│   ├── summary.service.ts              # 招标速读
│   └── prompts/summary.ts
├── eligibility/
│   ├── eligibility.service.ts          # 资格自查
│   └── prompts/eligibility.ts
├── framework/
│   ├── framework.service.ts            # 标书框架
│   └── prompts/framework.ts
├── section/
│   ├── section-writer.service.ts       # 章节续写
│   └── prompts/section/                # 多个章节 prompt
├── packaging/
│   └── document-packager.service.ts    # 资质资料打包
├── scoring/
│   └── score-predictor.service.ts      # 评分预判
└── dispatch-trigger/
    └── tender-dispatch-trigger.service.ts  # 触发 [`22`]
```

## 2. 数据模型

```prisma
model TenderProject {
  id              String   @id @default(cuid())
  tenant_id       String
  user_id         String
  name            String
  region          String?
  industry        String?
  amount_estimate Decimal? @db.Decimal(15,2)
  source_file_url String   // OSS
  status          String   // uploaded / parsed / framework_generated / submitted
  meta            Json?
  created_at      DateTime @default(now())
}

model TenderSummary {
  id              String   @id @default(cuid())
  project_id      String   @unique
  ai_task_id      String   @unique
  report_id       String?
  key_points      Json
  schedule        Json
  eligibility_req Json
  scoring_summary Json
  created_at      DateTime @default(now())
}

model TenderEligibility {
  id              String   @id @default(cuid())
  project_id      String
  status          String   // pass / partial / fail
  missing_items   Json
  remediation     Json
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model TenderFramework {
  id              String   @id @default(cuid())
  project_id      String   @unique
  business_outline Json
  technical_outline Json
  template_code   String
  ai_task_id      String   @unique
  created_at      DateTime @default(now())
}

model TenderSectionDraft {
  id              String   @id @default(cuid())
  project_id      String
  section_key     String   // 'business.tech_solution' / 'tech.org_design' / ...
  version         Int
  content         String   @db.Text
  ai_task_id      String   @unique
  approved_by     String?
  created_at      DateTime @default(now())
  @@index([project_id, section_key])
}

model TenderPackage {
  id              String   @id @default(cuid())
  project_id      String   @unique
  pdf_url         String
  included_docs   Json
  created_at      DateTime @default(now())
}

model TenderScorePrediction {
  id              String   @id @default(cuid())
  project_id      String
  predicted_score Decimal  @db.Decimal(5,2)
  breakdown       Json
  improvements    Json
  ai_task_id      String   @unique
}
```

## 3. 关键 PromptTemplate

- `tender.summary`：T1（不分项目大小，速读始终给详细）
- `tender.eligibility`：T1（结论清晰）
- `tender.framework`：tier(ctx) 按金额（< 1000w → T1 / 1000-5000w → T2 / ≥ 5000w → T3 仅框架）
- `tender.section.{key}`：T2 起（默认建议人工复核）
- `tender.score_prediction`：T2

## 4. 关键 API

```yaml
POST /api/v1/tender/projects                # 创建（上传文件）
GET  /api/v1/tender/projects/:id
POST /api/v1/tender/projects/:id/summary    # 招标速读
POST /api/v1/tender/projects/:id/eligibility
POST /api/v1/tender/projects/:id/framework
POST /api/v1/tender/projects/:id/sections/:key/generate  # 章节续写
POST /api/v1/tender/projects/:id/package    # 资质打包
POST /api/v1/tender/projects/:id/score-predict
POST /api/v1/tender/projects/:id/dispatch-tender-writer  # 触发派单
```

## 5. 错误码

`TENDER.*`：
- `TENDER.FILE.TOO_LARGE` (413)
- `TENDER.PARSE.FAILED` (502)
- `TENDER.SECTION.NOT_FOUND` (404)
- `TENDER.ELIGIBILITY.QUALIFICATION_DATA_MISSING` (422)

## 6. PBT

| 属性 | 函数 |
|---|---|
| Tier 解析单调 | PromptTemplate.tier |
| 章节续写不超字数上限 | section-writer |
| 评分预判 ∈ [0, 100] | score-predictor |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `tender.section.cost.{key}` | 单章节扣点 |
| `tender.framework.tier_thresholds` | 1000w / 5000w |
| `tender.upload.max_file_size` | 默认 50MB |


---

## V4 升级·标书工厂精细化（R10-R15 设计）

### V4.1 服务结构

```
apps/api/src/modules/tender-factory/
├── interpret/
│   ├── tender-reading.service.ts       # 招标速读 800 点（< 50 页）
│   ├── tender-reading-cascade.service.ts # 模型级联 1500 点（≥ 50 页：Qwen-Max → Claude）
│   └── eligibility-check.service.ts    # 资格自查 + 缺失补救
├── framework/
│   ├── framework-generator.service.ts  # 商务标 + 技术标 双框架
│   └── chapter-writer.service.ts        # 章节续写（按章节扣点）
├── employee-tools/
│   ├── tender-staff-workbench.controller.ts # 投标工作台
│   ├── daily-quiz.service.ts            # 每日真题（每天 1 免，第 2 题 50 点）
│   ├── resource-pack.service.ts         # 资料一键打包
│   └── score-prediction.service.ts      # 评分预判 500 点
├── agent-tools/
│   ├── ai-quote-tool.service.ts         # 智能管家 AI 报价工具 50 点
│   └── co-brand-report.service.ts       # 联合品牌报告（¥499+）
└── dispatch-trigger/
    └── tender-dispatch.service.ts       # ≥ 1000w 触发 22 派单
```

### V4.2 5 档订阅功能墙

实施 `subscription-feature-wall.service.ts`：按档位限制速读次数 / 框架次数 / 章节续写次数等。
