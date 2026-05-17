# 14 资质智能管家 - Design

## 1. 模块结构

```
apps/api/src/modules/qualification/
├── qualification.module.ts
├── archive/                          # 资质档案
│   ├── ocr.service.ts
│   └── archive.service.ts
├── checkup/                          # 资质体检
│   ├── checkup.service.ts
│   └── prompts/checkup.ts
├── upgrade-path/                     # 升级 / 增项路径
│   ├── upgrade.service.ts
│   └── prompts/upgrade-path.ts
├── performance/                      # 业绩库
│   ├── performance.service.ts
│   └── matcher.service.ts            # 业绩 ↔ 资质 匹配
├── personnel/                        # 主要人员
│   └── personnel.service.ts
├── safety-license/                   # 安许
│   └── safety-license.service.ts
├── expiry-monitor/                   # 到期监控
│   └── expiry-monitor.worker.ts      # cron 每天 06:00
├── dynamic-review/                   # 动态核查
│   └── dynamic-review.service.ts
└── dispatch-trigger/
    └── qual-dispatch-trigger.service.ts
```

## 2. 数据模型

```prisma
model QualificationCert {
  id              String   @id @default(cuid())
  tenant_id       String
  category        String   // 总承包 / 专业承包 / 施工劳务 / 设计 / 监理
  sub_type        String?  // 房建 / 市政 / 公路 / 水利 ...
  level           String   // 特级 / 一级 / 二级 / 三级
  cert_no         String
  issued_at       DateTime
  valid_until     DateTime
  issuer          String
  raw_image_url   String
  status          String   // active / expired / revoked
  meta            Json?
  @@index([tenant_id, valid_until])
}

model SafetyLicense {
  id              String   @id @default(cuid())
  tenant_id       String   @unique
  license_no      String
  issued_at       DateTime
  valid_until     DateTime
  status          String
}

model KeyPersonnel {
  id              String   @id @default(cuid())
  tenant_id       String
  name            String
  id_card_masked  String   // 脱敏后
  role            String   // 一级建造师 / 安全员 / 八大员 / 工程师 ...
  cert_type       String
  cert_no         String
  cert_valid_until DateTime
  is_attached     Boolean  // 是否挂证
  @@index([tenant_id, role])
}

model PerformanceRecord {
  id              String   @id @default(cuid())
  tenant_id       String
  project_name    String
  contract_amount Decimal  @db.Decimal(15,2)
  contract_url    String?
  acceptance_url  String?
  industry        String
  start_at        DateTime
  end_at          DateTime?
  matched_qualifications Json  // ['总承包-房建-一级' 等]
  meta            Json?
}

model QualificationCheckup {
  id              String   @id @default(cuid())
  tenant_id       String
  health_score    Int
  completeness    Int
  validity        Int
  upgrade_potential Int
  risk_points     Json
  ai_task_id      String   @unique
  report_id       String?
  created_at      DateTime @default(now())
}

model UpgradePathReport {
  id              String   @id @default(cuid())
  tenant_id       String
  from_level      String
  to_level        String
  category        String
  path_steps      Json
  gap_analysis    Json
  ai_task_id      String   @unique
  report_id       String?
}
```

## 3. PromptTemplate 关键约束

- `qualification.checkup`：T1（始终主动给方案）
- `qualification.upgrade_path`：tier(ctx) by `from + to`：
  - 增项 / 三级 → 二级：T1
  - 二级 → 一级：T2
  - 一级 / 特级：T3
- `qualification.dynamic_review`：T1

## 4. 关键 API

```yaml
POST /api/v1/qualifications/certs        # 上传资质证书 + OCR
GET  /api/v1/qualifications/me           # 我的资质档案
POST /api/v1/qualifications/checkup      # 体检
POST /api/v1/qualifications/upgrade-path
POST /api/v1/qualifications/performance  # 业绩录入
GET  /api/v1/qualifications/personnel    # 主要人员
POST /api/v1/qualifications/dispatch     # 触发资质代办派单
```

## 5. 错误码

`QUAL.*`：
- `QUAL.OCR.FAILED` (502)
- `QUAL.UPGRADE.PATH_NOT_AVAILABLE` (422)
- `QUAL.PERSONNEL.ATTACHED_DETECTED` (warning，仅提示挂证风险)

## 6. PBT

| 属性 | 函数 |
|---|---|
| Tier 解析 by from+to | upgrade-path PromptTemplate |
| 到期推送上限 3 / 日 | expiry-monitor |
| 业绩匹配单调 | performance/matcher |

## 7. 后台覆盖

| key | 内容 |
|---|---|
| `qualification.expiry_push_thresholds` | [90, 60, 30, 7] |
| `qualification.tier_thresholds` | upgrade level 阈值 |


---

## V4 升级·智能管家业务延伸（R10-R13 设计）

### V4.1 流量分配逻辑（R10 实现）

```
apps/api/src/modules/qualification/dispatch-router/
├── classify-need.service.ts       # A/B 类需求分类
├── route-to-agent.service.ts      # A 类 → 22-spec dispatch
├── route-to-tongqian.service.ts   # B 类 → 同乾方略服务货架
└── tier-resolver.service.ts       # 项目金额 → Tier 1/2/3
```

A 类（占 80%）：续证 / 安许续期 / 人员补充 / 业绩补录 / 二级以下升级 / 增项一般类别 / 人员社保 / 安许整改
B 类（占 20%）：一级 / 特级升级 / 资质合并剥离重组 / 央国企资质规划 / 涉诉资质问题

### V4.2 智能管家专属工具 5 件套（R11 实现）

```
apps/api/src/modules/qualification/agent-tools/
├── client-archive.service.ts          # 工具 1：客户资质档案库
├── upgrade-planner.service.ts         # 工具 2：AI 升级路径规划器
├── personnel-pool.service.ts          # 工具 3：人员匹配池（合规化）
├── performance-matcher.service.ts     # 工具 4：业绩库自动匹配
└── earnings-aggregator.service.ts     # 工具 5：智能管家收益结算
```

### V4.3 挂证合规规避（R12 实现）

```prisma
model PersonnelComplianceCheck {
  id              String   @id @default(cuid())
  qualification_id String
  personnel_id    String
  check_type      String   // social_uniqueness / performance_uniqueness / cert_consistency
  result          String   // pass / warning / fail
  evidence        Json     // 检测证据（其他企业社保 / 重复业绩等）
  audit_log_id    String?  // 关联审计日志
  triggered_at    DateTime @default(now())
  
  @@index([qualification_id])
}
```

```
apps/api/src/modules/qualification/compliance/
├── personnel-checker.worker.ts        # 自动核验四库一平台
├── alert-render.service.ts            # 异常 → 弹窗 + 写审计
└── blacklist-share.service.ts         # 跨域共享黑名单
```

合规模式（鼓励，非违规模式）：
- 真用工：建造师人才池
- 项目劳务派遣
- 联合体投标

违规模式（禁止）：
- 挂证（人证分离）
- 假社保

平台 SHALL NOT 提供：挂证撮合 / 假社保代缴 / 业绩造假渠道。

### V4.4 派单标准（R13 实现）

复用 22-spec dispatch 服务，资质类专属计分覆盖 BR-336：

```typescript
// dispatch-rules-qualification.ts
const QUAL_DISPATCH_SCORE = {
  ownership: 100,           // 归属优先
  region: { same_city: 20, same_province: 10, cross_province: 0 },
  subtype: { exact: 30, compatible: 15 },
  level: { LV5: 20, LV4: 15, LV3: 10, LV2: 5, LV1: 1 },
  satisfaction: { '5star': 10, '4star': 5, '3star': 0, below: -999 },
  history_success: 5,       // 同类资质成功 +5 / 件
  response_speed: 5,        // 平均接单 < 2h +5
  price_reasonable: 5,      // 参考价 ±10% +5
};
```

### V4.5 接单要求 + 结算保护（R13 实现）

```prisma
model QualificationServiceOrder {
  id            String   @id @default(cuid())
  client_id     String
  agent_id      String
  qualification_target String  // 升级目标
  quoted_amount Decimal
  service_terms String   // ≥ 200 字
  service_period_days Int     // 精确到自然日
  failure_compensation Int    // 30 / 50 / 100 三档
  
  milestones    Json     // [{ name, weight: 30, status }]
  
  payment_status String  // frozen_7d / partial / completed
  client_acceptance_at DateTime?
  acceptance_window_until DateTime?  // 30 天客户验收
  
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

里程碑解冻：
- 里程碑 1（人员补足）→ 解冻 30%
- 里程碑 2（业绩补录）→ 解冻 30%
- 最终交付 + 客户验收 → 解冻 40%
- 全部解冻 + 30 天客户验收期 → 进入"可结算"
