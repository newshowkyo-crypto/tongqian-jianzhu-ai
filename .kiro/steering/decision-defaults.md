---
inclusion: always
---

# Autopilot 默认决策表（遇歧义即查此表，不问用户）

> 当 spec 没明确约定时，Codex / Claude Code **必须**先查本表。本表覆盖 [`autopilot-rules.md` §6 fallback 链](./autopilot-rules.md) 第 1 步。
>
> 用户已在创始人对话中明确以下偏好，所有歧义按本表默认。

## 1. 商业 / 业务默认

| 歧义点 | 默认决策 | 来源 |
|---|---|---|
| 5 档订阅价 | trial 0 / 轻享 39 / 标准 199 / 企业 499 / 旗舰 999（元/月）| BR-401 |
| 阶梯优惠 | 连续 3 月 8.5 折 / 6 月 8 折 / 12 月 7 折封顶 | 07 spec R2 |
| 订阅分润 | 首年 30% / 次年 20% / 充值 15% | BR-302 |
| 派单 0 抽成 | 跨域介绍费 5% 给归属智能管家 | BR-303 |
| 客户保护期 | 7 天 + 退款扣回智能管家分润 | BR-201 |
| 推荐费冻结期 | A/B 标准 7d / B 高端 30d / 政府专项债跨境 45d | BR-313 |
| 智能管家保证金 | **取消**（早期版本要求 ¥1000，2026-05-16 ADR-AUTO 取消，改为零门槛 + 实名审核 + 强制培训）| 22 spec R2 / ADR-AUTO-2026-05-16 |
| 智能管家信誉基础分 | 500 / LV2 / 30 天保护期 + LV1 重启 6 次 | BR-331 / BR-332 |
| 客户信誉挂载 | 挂 tenant 维度，不挂 user | BR-105 / BR-333 |
| 派单 4 维加权 | LV5+20 / LV4+15 / LV3+10 / LV2+5 / LV1+1（等级权重最大）| BR-336 |
| AI 输出 Tier 阈值 | 项目 < 1000w T1 / 1000-5000w T2 / ≥ 5000w T3；涉诉 T4 | BR-321 |
| AI 单点成本红线 | ≥ ¥0.07 触发告警 | BR-901 |
| AI 毛利底线 | ≥ 70% | BR-503 |
| 政府版数据出境 | 强制禁用（即使有 BR-505 授权）| 23 spec |
| 客户邀请客户红包 | 200 点 + 10% | BR-301 |
| 智能管家推荐智能管家 | 永久 10% + 二级封顶 + 首笔 1000 一次性 200 | BR-301 / BR-305 |
| 充值套餐 | 100/500/1000/5000 元，赠送比例 0/1%/2%/6% | 08 spec R5 |
| 9 大上瘾连续签到 | 7/14/30/90 天解锁奖励 | BR-602 |
| 抽点频率 | 每周二 / 周五各 1 次 | BR-603 |
| 紧迫感推送上限 | 每日 ≤ 3 条 | BR-604 |
| 旗舰版顾问负载上限 | 30 客户/顾问 | BR-409 |
| 旗舰版价格 | 999/月（不再调整）| ADR-001 |

## 2. 技术 / 架构默认

| 歧义点 | 默认决策 | 来源 |
|---|---|---|
| 包管理 | pnpm 9.12.0（packageManager 锁定）| 01 spec |
| Node 版本 | 22 LTS | 01 spec |
| TypeScript | 5.4+，strict 全开 | coding-standards |
| ORM | Prisma 5.x（不切 Drizzle / TypeORM）| ADR-001 |
| 数据库 | PostgreSQL 15+ 主从 | ADR-001 |
| 缓存 / 队列 | Redis 7 + BullMQ 5.x | ADR-001 |
| Mono 工具 | Turborepo 2.x | 01 spec |
| 后端 | NestJS 10.x | ADR-001 |
| 前端 | Next.js 14.x App Router | ADR-001 |
| 桌面 | Tauri 2.x，仅复用 apps/web | DOQ-004 |
| UI 库 | shadcn/ui + Tailwind，不引入 antd / mui | ui-ux-rules |
| 表单 | react-hook-form + zod | frontend-rules |
| 数据请求 | TanStack Query 5+ | frontend-rules |
| 全局状态 | Zustand 4+ | frontend-rules |
| 测试 | Vitest（单测）+ Playwright（e2e）+ supertest（API）| testing-rules |
| 部署 | 单 VPS + Docker Compose（一期不上 K8s）| ADR-001 |
| CI | GitHub Actions | 01 spec |
| 容器仓库 | 阿里云 ACR | 01 spec |
| 文件存储 | 阿里云 OSS | ADR-001 |
| 向量库 | DashVector | 04 spec |
| 监控 | Uptime Kuma + 阿里 SLS | 01 spec |
| 通知通道 | 站内信 + 微信公众号 + 企微 + 阿里短信 + 邮件 + 桌面 | 27 spec |

## 3. 编码默认

| 歧义点 | 默认决策 |
|---|---|
| 文件名 | kebab-case |
| 类名 | PascalCase |
| 函数 / 变量 | camelCase |
| 常量 | UPPER_SNAKE_CASE |
| 数据库表 | snake_case 复数（user_profiles）|
| 数据库字段 | snake_case（created_at）|
| API 路径 | kebab-case 复数（/api/v1/agent-payouts）|
| 错误抛出 | `BusinessError` + 错误码（packages/errors）|
| 异常处理 | 不允许裸 catch + console.log，必须 rethrow / log / fallback |
| 注释 | service 方法必有 JSDoc；TODO 必带责任人 + 日期 |
| import 顺序 | builtin → external → internal → parent → sibling → index |
| 异步 | 一律 async / await，不用 .then 链 |
| ID | cuid（Prisma 默认）|
| 金额字段 | Prisma.Decimal 不用 Float / Number |
| 时区 | Asia/Shanghai 显示 / UTC 存储 |
| 列表上限 | 单页 ≤ 100 条 |
| 大文件上传 | ≤ 50MB 普通 / 100MB 多模态（图纸 / 音频）|
| 限流 | API 全局 10/秒/IP；登录 5/分钟；AI 30/分钟/用户 |

## 4. 前端默认

| 歧义点 | 默认决策 |
|---|---|
| 颜色 | 必从 packages/ui/tokens 取，不用 inline color |
| 字号 | text-2xl/xl/lg/base/sm/xs 6 档（详见 ui-visual-spec §3.2）|
| 圆角 | rounded-md（按钮 / 输入）/ rounded-lg（卡片）/ rounded-xl（弹窗）|
| 阴影 | shadow-sm 默认 / shadow hover / shadow-md 弹窗 |
| 间距 | Tailwind 4px 倍数 p-4/p-6/gap-6 |
| EmptyState | 每个空列表必有（图标 + 标题 + 描述 + CTA）|
| LoadingState | Skeleton（不用 Spinner，除非按钮内）|
| ErrorState | 含重试按钮 |
| 关键操作 | 必须 toast.success / toast.error 反馈 |
| 中文文案 | 用"您"，不用"你" |
| 数字 | tabular-nums + 千分位 + 万 / 亿自动转 |
| 时间 | 相对时间 + hover 显示绝对时间 |
| 图标 | 必从 lucide-react，不用 emoji 当功能图标 |
| 字段必填 | label 后加 `<span class="text-danger-500">*</span>` |
| 表格 | 默认带排序 + 分页 + 搜索 + 批量操作 |
| 移动端 | mobile first，触控目标 ≥ 44px |
| 字体 | 中文 PingFang SC / Microsoft YaHei；英文 Inter；代码 JetBrains Mono |

## 5. 安全 / 合规默认

| 歧义点 | 默认决策 |
|---|---|
| 密码加密 | bcrypt cost=12 |
| JWT access | 30 分钟 |
| JWT refresh | 30 天，入库可吊销 |
| 登录失败锁定 | 5 次/15 分钟 |
| 2FA 强制角色 | PLATFORM_OWNER / FIN / RISK / EXPERT / CSM |
| 数据导出 | 仅 OWNER + PLATFORM_OWNER；二次密码 + 短信 + 审计 |
| 出境授权 | checkbox 注册时 + 用户协议 + user_consents 表 |
| 政府版 | 强制国产模型（even with 出境授权）|
| 审计字段 | id / traceId / userId / tenantId / action / resource / before / after / ip / userAgent / createdAt |
| 审计留存 | 6 年（按月分区）|
| 备份 | 全量每日 03:00 + 增量每小时 + OSS 跨区域 + 30 天保留 |
| 反薅 | 同手机 / 身份证 / 营业执照 / IP / 设备指纹 5 维去重 |

## 6. AI / Prompt 默认

| 歧义点 | 默认决策 |
|---|---|
| 默认主模型 | Qwen-Max（chat 长任务）/ Qwen-Plus（短任务）|
| 海外主模型 | claude-sonnet-4（合同 / 标书 / 化债 / 重大，经 OpenRouter 调用）|
| 备用国产模型 | DeepSeek-V3（DeepSeek 直连 API）|
| AI 渠道（一期上线 3 个）| 阿里百炼（主国产）+ OpenRouter（海外汇聚）+ DeepSeek 直连（备用 + 性价比）|
| ❌ 已移除 | 火山方舟（与 DeepSeek 直连冗余，详见 ADR-AUTO-2026-05-16-IMPROVEMENTS）|
| 模型路由 fallback | 主模型 → 兜底模型 → 切渠道（最多 3 次）|
| 缓存 TTL | 24h（精确缓存）|
| 语义相似度阈值 | 0.95 |
| Prompt 缓存 | 标记 cache_control |
| 历史窗口 | 最近 3 轮原文 + 更早摘要 200 字 |
| 知识库召回 | Top-5 |
| 长文档 | ≥ 50 页用 Qwen-Max 抽 → Claude 深度 |
| 输出 schema 重试 | ≤ 2 次 |
| Prompt 黄金测试集 | 每个 Prompt ≥ 10 案例 + 语义相似度 ≥ 0.7 才能上线（详见 29-prompt-testing）|
| 红线表述 | 禁"必须 / 一定 / 绝对" / 必"建议关注 / 通常做法 / 参考行业惯例" |

## 7. 测试 / 质量默认

| 歧义点 | 默认决策 |
|---|---|
| 覆盖率基线 | 核心 85% / 杀手锏 75% / AI Gateway 80% / 前端 60% / 工具 90% |
| 单测放置 | `*.spec.ts` 与源码同目录 |
| e2e 放置 | `tests/e2e/` |
| Mock 策略 | AI / 第三方 API mock；DB / Redis 用真实测试库 |
| PBT 工具 | fast-check |
| 限流 e2e | 每写接口必测跨租户拒绝 |
| 关键路径 e2e | CI 必跑 5 个场景（design-protocols §13）|

## 8. 工程 / 部署默认

| 歧义点 | 默认决策 |
|---|---|
| Branch 策略 | main / develop / feature/* / fix/* / chore/* / hotfix/* |
| Commit 规范 | Conventional Commits |
| PR 触发 | CI 全套必通过 |
| Staging 部署 | merge to develop 自动 |
| Prod 部署 | merge to main 自动灰度 5% → 25% → 50% → 100% |
| 灰度间隔 | 10/30/60 分钟观察 |
| 回滚 | 用 prod-previous tag 切回 |
| 镜像存储 | 保留 prod-latest + prod-previous + 最近 10 个 sha tag |
| 凭证存储 | GitHub Secrets（CI 凭证）/ VPS .env.prod（业务凭证）|

## 9. UI 视觉决策的 fallback

当前端任务遇到具体视觉歧义时按以下顺序查：
1. 本表 §4 前端默认
2. [`ui-visual-spec.md`](./ui-visual-spec.md) 对应章节
3. [`ui-ux-rules.md`](./ui-ux-rules.md) 对应章节
4. 既有 `packages/ui` 组件实现
5. 仍无 → 按"最简、最少装饰、最大可读性"原则实现 + 写到 changelog

## 10. 找不到任何匹配时的兜底

最低优先级 fallback：
1. 实现"最少破坏既有约束的简单方案"
2. 在 `docs/decisions/auto-{date}-{topic}.md` 写一行 ADR：[问题 / 决策 / 理由 / 影响]
3. 标记 `ADR_AUTO`（区分人工 ADR）
4. 继续推进，绝不停下

## 11. 启动前依赖凭证清单（缺则 BLOCKED）

以下 P0 凭证必须在 `.env` 或 `~/.kiro/secrets/` 就绪，缺则在根目录写 `BLOCKED.md` 暂停：

### P0 一期上线必备（8 项最小集 V4 升级）

```
DATABASE_URL                  # PostgreSQL（开发期 Docker 起）
REDIS_URL                     # Redis（开发期 Docker 起）
ALIYUN_DASHSCOPE_API_KEY      # 阿里百炼 主国产模型
OPENROUTER_API_KEY            # OpenRouter 海外汇聚（Claude/GPT/DeepSeek 都能调）
DEEPSEEK_API_KEY              # DeepSeek 直连备用
JWT_SECRET                    # 至少 64 位随机
WECHAT_PAY_MCH_ID             # 微信支付商户号（已申请）
WECHAT_MP_APP_ID              # 公众号（已更新）
```

### P1 开发中后期必备（W4 后逐步补）

```
ALIYUN_OSS_ACCESS_KEY_ID      # 阿里云 OSS（待开通）
ALIYUN_OSS_ACCESS_KEY_SECRET
ALIYUN_OSS_BUCKET
ALIYUN_OSS_REGION
ALIYUN_OCR_ENABLED            # 阿里云 OCR / 文档智能（待开通）
ALIYUN_DOCMIND_ENABLED
ALIYUN_SLS_PROJECT            # 阿里云 SLS 日志（待开通）
ALIYUN_SLS_LOGSTORE
ALIYUN_SLS_ENDPOINT
ALIYUN_SMS_ACCESS_KEY_ID      # 阿里云短信（需 1-3 天审签名）
ALIYUN_SMS_ACCESS_KEY_SECRET
ALIYUN_SMS_SIGN_NAME
ALIYUN_SMS_TEMPLATE_VERIFY
WECHAT_PAY_API_KEY            # 微信支付密钥（已申请到位）
WECHAT_PAY_CERT_PATH
WECHAT_MP_APP_SECRET
WECHAT_WORK_AGENT_ID          # 企微（已有）
WECHAT_WORK_SECRET
ALIPAY_APP_ID                 # 支付宝（已申请）
ALIPAY_PRIVATE_KEY
DASHVECTOR_API_KEY            # 阿里向量库
```

### P2 二期或可推迟

```
ICP_RECORD_NO                 # ICP 备案号（上线前完成即可）
TAURI_UPDATER_PRIVATE_KEY     # 桌面端签名（桌面端发布前）
```

### ❌ 已移除（不再需要）

```
VOLC_ARK_API_KEY              # 火山方舟（与 DeepSeek 直连冗余，详见 ADR-AUTO-2026-05-16-IMPROVEMENTS）
```

启动 Autopilot 前先读 `.env` 检查；缺 P0 任一项 → 写 BLOCKED.md 列出缺失项 → 停。
