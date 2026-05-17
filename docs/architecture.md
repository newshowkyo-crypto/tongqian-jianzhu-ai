# 系统架构（Architecture）

> 本文档描述同乾方略 · 建筑 AI 经营管家的总体架构。所有 AI 编码助手 + 工程师在写代码前必须读完。

## 1. 整体架构总图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户终端层                                │
├─────────────────────────────────────────────────────────────────┤
│  Web 浏览器 │ Tauri 桌面端 │ 微信小程序 │ 公众号 / 企微 │ 外部 API │
└────┬────────────┬──────────────┬─────────────┬──────────────┬───┘
     │            │              │             │              │
     └────────────┴──────────────┴─────────────┴──────────────┘
                              ↓
                  ┌───────────────────────┐
                  │   Nginx 反向代理 + WAF │
                  └───────────┬───────────┘
                              ↓
                  ┌───────────────────────┐
                  │   API Gateway         │
                  │   - 鉴权 (JWT)        │
                  │   - 限流              │
                  │   - 租户识别          │
                  │   - 链路追踪 traceId  │
                  └───────────┬───────────┘
                              ↓
        ┌──────────┬──────────┬──────────┬──────────┐
        ↓          ↓          ↓          ↓          ↓
   建筑企业 API  政府版 API  智能管家 API  平台 API  外部 API
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                              ↓
                  ┌───────────────────────┐
                  │  统一业务服务层        │
                  │  - 17 个功能模块       │
                  │  - 审批引擎           │
                  │  - 通知系统           │
                  │  - 任务调度           │
                  └───────────┬───────────┘
                              ↓
        ┌─────────────┬───────────────┬────────────┬────────────┐
        ↓             ↓               ↓            ↓            ↓
  AI Gateway   规则库引擎   知识库引擎   支付网关   对接外部 API
        │             │               │            │            │
        ↓             ↓               ↓            ↓            ↓
  ┌────────┐   ┌──────────┐   ┌────────────┐  ┌────────┐  ┌────────┐
  │模型路由│   │规则查询   │   │向量检索     │  │微信支付│  │OCR     │
  │       │   │规则审核   │   │RAG 召回    │  │支付宝  │  │OSS     │
  │       │   │           │   │             │  │        │  │快递    │
  └───┬────┘   └─────┬────┘   └──────┬─────┘  └────────┘  └────────┘
      │              │               │
      ↓              ↓               ↓
  ┌──────────┬──────────────────┬─────────────┐
  │  PostgreSQL  │  Redis (缓存+队列)  │  DashVector │
  │             │                    │  阿里云 OSS  │
  └─────────────┴────────────────────┴─────────────┘
                              ↓
                  ┌───────────────────────┐
                  │  审计日志 / 监控 / 告警 │
                  └───────────────────────┘

         旁路：异步 Worker（数据采集 / OCR / 通知 / 报表生成）
```

## 2. Monorepo 目录结构

```
tongqian-jianzhu-ai/
├── AGENTS.md                  # AI 助手总指令
├── README.md                  # 项目说明
├── package.json               # pnpm workspace
├── pnpm-workspace.yaml
├── tsconfig.base.json         # 基础 TS 配置
├── .github/                   # GitHub Actions CI/CD
├── .kiro/
│   ├── steering/              # 全局规则（每次会话自动加载）
│   └── specs/                 # 21 个子 spec
├── docs/
│   ├── architecture.md        # 本文件
│   ├── business-model.md      # 商业模型
│   ├── glossary.md            # 术语表
│   ├── decisions/             # ADR 决策记录
│   └── changelog/             # 变更日志
├── packages/
│   ├── types/                 # 共享类型定义
│   ├── contracts/             # OpenAPI 契约
│   ├── permissions/           # 角色 / 权限 / 资源
│   ├── errors/                # 统一错误类
│   ├── constants/             # 全局常量
│   ├── ui/                    # 共享 UI 组件库（shadcn 封装）
│   └── utils/                 # 工具函数
├── prisma/
│   ├── schema.prisma          # 数据库总 schema
│   ├── migrations/            # 迁移文件
│   └── seed/                  # 初始化数据
├── apps/
│   ├── web/                   # 建筑企业前台 (Next.js)
│   ├── gov/                   # 政府 / 央国企版前台 (Next.js)
│   ├── agent/                 # 智能管家工作台 (Next.js)
│   ├── admin/                 # 平台管理后台 (Next.js)
│   ├── api/                   # 主 API (NestJS)
│   ├── worker/                # 异步任务 (NestJS)
│   └── desktop/               # Tauri Windows 客户端
├── infra/
│   ├── docker-compose.yml     # 本地开发
│   ├── docker-compose.prod.yml # 生产
│   ├── nginx/                 # Nginx 配置
│   └── deploy/                # 部署脚本
└── scripts/                   # 运维脚本
```

## 3. 技术栈

### 后端
- **NestJS 10+**（模块化、装饰器、强类型）
- **Prisma 5+**（PostgreSQL ORM）
- **PostgreSQL 15+**（主库）
- **Redis 7+**（缓存 + BullMQ 队列 + 限流）
- **DashVector**（向量库 RAG）
- **pino**（日志）
- **zod / class-validator**（校验）
- **OpenTelemetry**（链路追踪）

### 前端
- **Next.js 14+ (App Router)**
- **React 18+**
- **TypeScript 5.4+ (strict)**
- **Tailwind CSS + shadcn/ui**
- **TanStack Query**（数据请求）
- **Zustand**（状态管理）
- **react-hook-form + zod**（表单）
- **lucide-react**（图标）

### 桌面端
- **Tauri 2+**（Rust + 系统 webview）
- 复用 Web 前端代码

### AI 调用层
- **AI Gateway**（自建抽象层）
- 渠道接入：阿里百炼、火山方舟、OpenRouter、B.AI、自建 HK 直连（6 个月后）
- 节流：Prompt Caching + 结果缓存 + 模型级联 + 输入精简 + 异步批

### 运维 / 部署
- **GitHub** 私有仓库 + GitHub Actions CI
- **Docker Compose** + **Nginx** + **PM2**（备选）
- **VPS**（阿里云轻量）
- **OSS** 文件存储 + 自动备份
- **Uptime Kuma** + **Grafana** 监控

## 4. 核心子系统

### 4.1 多租户 + RBAC + ABAC

```
租户 (Tenant)
  ├── 类型：BUILDING_COMPANY / GOV_ORG / SOE / AGENT / PLATFORM
  ├── 一个租户可有多个 User
  └── 数据完全隔离（每张业务表必带 tenant_id）

User（用户）
  ├── 一个用户属于一个 Tenant（不允许跨租户用户）
  ├── 一个用户在租户内有 1+ Role（角色）
  └── 角色决定 RBAC 权限

岗位标签（针对建筑企业内部）
  ├── 老板 / 经营 / 标书 / 总工 / 项目经理 / 资料员 / 安全员 / 质检员 / 财务 / HR / 法务
  ├── 不是注册角色，是企业内部"岗位"
  └── 决定 UI 显示 + 部分权限
```

注册时只有 4 大角色：BUILDING_COMPANY_USER / GOV_USER / AGENT_USER / PLATFORM_USER。
建筑企业内部岗位由企业老板进入系统后自行分配。

### 4.2 AI Gateway

详见 `.kiro/steering/ai-gateway-rules.md`。

### 4.3 审批流引擎

数据驱动，运营人员在后台拖拽配置：

```
ApprovalFlow (审批流)
  ├── flow_id
  ├── tenant_id（每企业独立配置）
  ├── trigger_resource（contract / payout / leave / ...）
  ├── trigger_condition（amount > 100000）
  └── steps[]
      ├── step_1: 部门主管
      ├── step_2: 财务总监
      └── step_3: 老板
```

详见 `.kiro/specs/approval-flow/`。

### 4.4 知识库与数据采集系统

```
[数据源（政策网站 / 招投标平台 / 四库一平台）]
            ↓
[Crawler Service 抓取]
            ↓
[OCR / 文档智能解析]
            ↓
[AI 抽取 → 结构化 JSON]
            ↓
[冲突检测 + 置信度标注]
            ↓
[专家审核台 → 终审]
            ↓
[规则库 + 政策库 + 业绩库 + 招标模板库]
            ↓
[业务模块查询接口]
```

详见 `.kiro/specs/knowledge-system/` 和 `.kiro/specs/rules-engine/`。

### 4.5 可视化后台 7 大模块

1. 数据源管理（添加 / 暂停 / 删除政策网站、招标平台）
2. 规则库审核（专家用，左原文右抽取，逐字段审核）
3. Prompt 管理（在线编辑 + 版本 + A/B 测试 + 回滚）
4. 模型路由 / API 渠道（一键切换 OpenRouter / B.AI / Azure / AWS / 直连）
5. 报告模板（章节拖拽编辑 + 灰度发布）
6. 审批流配置（拖拽节点 + 触发条件 + 审批人动态选择）
7. 业务运营（用户 / 智能管家 / 订单 / 财务 / 派单 / 数据看板）

详见 `.kiro/specs/admin-console/`。

## 5. 关键流程

### 5.1 AI 任务调用流程

```
用户点击"审一份合同"
    ↓
前端 POST /api/v1/contracts/review (multipart 上传)
    ↓
API 鉴权 + 限流 + 租户识别
    ↓
ContractReviewService
    ├── 文件存 OSS + 触发 OCR 任务
    ├── 创建 ai_task 记录（状态 = queued）
    └── 返回 taskId 给前端（201）
    ↓
前端轮询 GET /api/v1/ai-tasks/:taskId 或订阅 SSE
    ↓
Worker 收到队列消息
    ├── AI Gateway.invoke({ taskType: CONTRACT_REVIEW_PRO, ... })
    │     ├── 1. 预扣点数
    │     ├── 2. 缓存查询（命中 → 退点 + 返回）
    │     ├── 3. 模型路由（Claude Sonnet 4.6 + 阿里 Qwen-Max 兜底）
    │     ├── 4. Sanitizer 脱敏（合同含敏感字段）
    │     ├── 5. Prompt Builder
    │     ├── 6. 调用 Provider
    │     ├── 7. 输出反脱敏 + Schema 校验 + 安全过滤
    │     ├── 8. 审计日志 + 成本记录
    │     └── 9. 实扣点数
    ├── 解析输出 → 写入 contract_review 表
    ├── 生成 PDF / H5 报告
    └── 通知用户（SSE / 短信 / 公众号）
```

### 5.2 智能管家派单流程（详见 ADR-002）

```
用户在系统操作 → 触发"需求信号"
（资质升级 / 标书代写 / 融资 / 等）
    ↓
NeedsDetectionService 识别需求类型 + 金额
    ↓
DispatchEngine.classify(needType, amount)
    ↓
┌──────────┬──────────┬──────────┐
│ A 类      │ B 类      │ C 类      │
│ 标准服务  │ 高端服务  │ 灰色地带  │
└──────────┴──────────┴──────────┘
     ↓ A 类                ↓ B/C 类
┌───────────────┐       ┌──────────────────┐
│ 智能管家池路由    │       │ 同乾方略服务货架   │
│ 1. 归属智能管家   │       │ 直接接管           │
│ 2. 跨域池     │       │ 智能管家按 BR-313     │
│ 3. 公开池     │       │ 拿 10–20% 推荐费  │
│ 4. 客服兜底   │       └──────────────────┘
└───────────────┘
     ↓
4 维加权匹配（地区+子类+等级+评分），Top 3 限时 1h 抢单
     ↓
智能管家接单 → 填【报价 + 服务说明】
     ↓
ReferencePriceService.compare(quote, refPrice)
   ├── ≤ 100% → 🟢 绿色推荐
   ├── 100–150% → 🟡 黄色提示
   ├── 150–200% → 🔴 红色 + 推 3 家备选
   └── > 200% → 🔴 红色 + "切到同乾方略"按钮
     ↓
客户选择候选智能管家（看到报价 + 评分）
     ↓
服务进行
     ↓
服务完成 → 强制双向评分
   ├── 客户评智能管家（必填）→ 智能管家月度评分聚合
   └── 智能管家评客户（选填）→ 客户标签库
     ↓
评分通过 → 智能管家分润进入"冻结"
     ↓
7 天客户保护期无投诉 → 转"可结算"
     ↓
月底统一结算 → 转"可提现"
     ↓
智能管家申请提现 → 平台审核 → 打款

【自动接管 6 触发条件】
  1. B/C 类需求 → 直接进入
  2. 智能管家 24h 未响应 → 自动转
  3. 报价 > 参考价 200% 且客户主动切换
  4. 客户主动选"申请同乾方略"
  5. 客户对智能管家评分 < 3★ → 重新派单
  6. 系统识别复杂度（化债 / ABS / REITs / 混改 等）

【智能管家申诉机制】
  暂停 / 待清退 → 智能管家申诉
     ├── 客服初审（24h）
     ├── 风控审核（72h）
     └── 客户成功仲裁（终审）
  暂停期 SHALL NOT 自动恢复（防躺平）

【防黑核心子模块】
  - apps/api/src/modules/dispatch/      派单引擎
  - apps/api/src/modules/rating/        双向评分
  - apps/api/src/modules/anti-fraud/    防薅 / 防黑
  - apps/api/src/modules/ref-price/     市场参考价库
```

### 5.3 智能管家网络流程

```
智能管家 A 推荐客户 X
    ↓
X 通过 A 的推广码注册 → 永久归属 A
    ↓
X 订阅 ¥199/月
    ↓
分润计算
    ├── 30% × 首年订阅 = 月度分润给 A（递延确认）
    ├── 15% × 客户充值 = 即时分润给 A
    ├── 派单成交 = A 拿 100%（平台不抽）
    └── X 转咨询 = A 拿 10–20% 推荐费
    ↓
A 推荐智能管家 B 加盟
    ├── B 的所有分润永久 10% 给 A
    └── B 首笔达 ¥1000 → A 一次性奖 ¥200
```

## 6. 部署架构

### 开发环境
```
本地：Docker Compose 一键起 PG + Redis + 应用
```

### 生产环境（VPS）
```
VPS（8 核 16G 起）
├── Nginx（80 / 443 / WAF）
├── PostgreSQL（主从）
├── Redis（主备）
├── apps/api（PM2 守护，多实例）
├── apps/worker（PM2 守护）
├── apps/web / apps/admin / apps/agent / apps/gov（Next.js standalone）
└── 备份：定时同步到 OSS
```

### CI/CD
```
开发者 push → GitHub
    ↓
GitHub Actions
    ├── 1. lint + typecheck + test
    ├── 2. build Docker 镜像
    ├── 3. push 到 阿里云 ACR
    └── 4. SSH 到 VPS → 拉镜像 → docker-compose up -d
```

## 7. 数据流向（合规视角）

```
中国境内数据：用户企业资料、合同、应收等
    ↓ 全部存阿里云 OSS（境内）+ PostgreSQL（境内）

调用国产模型（阿里百炼 / 火山）：原文不出境
    ↓
调用海外模型（Claude / GPT）：
    ├── 1. 用户协议明示 + 单独授权
    ├── 2. Sanitizer 脱敏（公司名 / 人名 / 金额 → 占位符）
    ├── 3. 仅脱敏后的内容出境
    ├── 4. 出境记录写审计日志
    └── 5. 季度合规自查
```

## 8. 性能目标

| 指标 | 目标 |
|---|---|
| API p95（普通）| ≤ 500ms |
| API p95（列表查询）| ≤ 1s |
| AI 同步接口 p95 | ≤ 30s |
| AI 异步任务首次响应 | ≤ 200ms |
| 数据库查询 p95 | ≤ 100ms |
| Redis 命中率 | ≥ 90% |
| 缓存命中率（AI 结果）| ≥ 30% |
| 数据库主从延迟 | ≤ 1s |
| 系统可用性 | ≥ 99.5% |

## 9. 容量规划

### 一期（首年中性 2300 客户）
- 应用服务器：2 核 4G × 2 实例
- 数据库：4 核 8G × 1（含主从）
- Redis：2G
- OSS：1 TB 起
- 月 AI 调用量：约 300 万次
- 月 OCR 调用量：约 50 万页

### 二期（第二年 6000 客户）
- 应用服务器：4 核 8G × 4 实例
- 数据库：8 核 16G × 1（含主从）
- Redis：8G
- OSS：5 TB
- 数据库分区开始（审计日志按月分表）

## 10. 监控告警

- **业务指标**：注册数、订阅数、点数余额异常、退款异常、提现失败
- **技术指标**：QPS、错误率、延迟、CPU、内存、磁盘
- **AI 指标**：模型成功率、缓存命中率、单点成本、单日成本
- **告警渠道**：企业微信群机器人 + 短信（紧急）

## 11. 灾备

- 数据库：主从同步 + 每日全量备份（OSS 跨区域复制）
- 文件：OSS 自带跨区域复制
- 应用：双 VPS 热备（次年扩展）
- RTO：≤ 4 小时
- RPO：≤ 1 小时
