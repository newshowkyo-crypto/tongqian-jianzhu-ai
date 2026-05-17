# 24 平台后台 - Requirements

## Introduction

> 功能区 M：7 大可视化模块（数据源 / 规则 / Prompt / 模型路由 / 报告模板 / 审批流 / 业务运营）+ 智能管家管理 / 客户管理 / 退款 / 提现审批 + **BR-901/902 红线监控**。
>
> ❗ **OPC 模式核心**：[`requirements.md` R6](../00-project-overview/requirements.md) 强约束，运营人员（≤ 3 人）通过本后台**无须改代码**完成全部运营调整。

**前置依赖**：[`02`] / [`06`] / [`07`] / [`08`] / [`09`] / [`22-agent-workspace`]；后续被全部业务模块的"运营字段"消费（system_configs 接口）。

---

## Requirements

### Requirement 1：7 大可视化模块（[`requirements.md` R6.1](../00-project-overview/requirements.md)）

#### Acceptance Criteria

1. **数据源管理**：抓取任务监控 + 失败告警 + 手动触发
2. **规则库审核**：[`20`] / [`21`] 待审核条目 + 通过 / 拒绝 + 版本回滚
3. **Prompt 管理**：模板 CRUD + 版本 + A/B 灰度（v3 50% / v4 50%）+ **满意度对比**（消费 [`10-report-center`] ReportRating + [`04`] ai_tasks 关联）
4. **模型路由 / 渠道**：任务 → 模型映射后台调整 + provider 健康可视化 + 一键切渠道（60s 内全量生效）
5. **报告模板**：[`10`] 模板版本管理 + 拖拽编辑（一期 JSON 编辑）
6. **审批流配置**：[`06`] 审批模板拖拽 + 角色 / 2FA 配置
7. **业务运营**：实时看板（订阅 / 退款 / 异常 / AI 延迟 / 单点成本）+ BR-901 红线告警

### Requirement 2：BR-901 / BR-902 红线监控

#### Acceptance Criteria

1. 6 条红线（详见 [`design.md` §5.14 BR-901 监控指标](../00-project-overview/design.md) + [`design-protocols.md` 附录 B](../00-project-overview/design-protocols.md)）实时监控（cron 5min）
2. 越界告警：企业微信群 + 短信
3. BR-902 月度自检报告（每月 1 号自动生成）→ PLATFORM_OWNER

### Requirement 3：智能管家管理

#### Acceptance Criteria

1. 全部智能管家列表：等级 / 信誉分 / 月活 / 投诉数 / 待处理申诉
2. 手动调整信誉分（带审计日志）
3. 智能管家申诉处理工作台（BR-314 三级流程）

### Requirement 4：客户管理

#### Acceptance Criteria

1. 全部 tenant 列表：订阅状态 / 信誉分 / 投诉记录 / 风险标记
2. 手动调整客户信誉分 / 加入黑名单（带审计）

### Requirement 5：退款 / 提现 / 用印 审批工作台

#### Acceptance Criteria

1. 待审批工单（按角色过滤）
2. 强制 2FA 签字
3. 审批历史 + 决策原因可查

### Requirement 6：财务对账

#### Acceptance Criteria

1. 流水按"渠道 / tenant / 时间段"维度
2. 月度分润报表自动生成（每月 5 号）
3. 一键确认 + 批量打款

### Requirement 7：分润 / 推荐费明细

详见 [`22-agent-workspace`]，本 spec 提供平台运营视角的总览。

### Requirement 8：边界

1. SHALL NOT 暴露给非 PLATFORM_OWNER 公开访问（独立 admin.tongqian.com 子域 + 强制 2FA）
2. SHALL NOT 直接修改生产 DB 数据（必须经 service / migration）
3. SHALL NOT 跳过审计

### Requirement 9：依赖

- 强依赖：[`02`] / [`06`] / [`07`] / [`08`] / [`09`] / [`22`]
- 弱依赖：所有业务模块（运营字段集成）
- 后续阻塞：[`28-security-compliance`] 总审


### Requirement 13：Feature Flag 系统（V4 P1 补丁）

#### Acceptance Criteria

1. 每个新功能后台开关（ON/OFF）+ 立即生效
2. 灰度策略：
   - 按 tenant 灰度（指定 tenant_id 列表）
   - 按角色灰度（如先放给 LV4+ 智能管家）
   - 按地区灰度（先湖北后全国）
   - 按比例灰度（5% / 25% / 50% / 100%）
3. 一键回滚（异常时秒级关闭）
4. 操作审计：每次开关 / 调整记录操作人 / 时间 / 原因 / 范围

### Requirement 14：公告 / 通知系统（V4 P1 补丁）

#### Acceptance Criteria

1. 全平台公告（停服 / 升级 / 重大政策）
2. 按角色推送（仅智能管家 / 仅政企 / 仅 ¥499+ 客户）
3. 按 tenant 推送（VIP 单独通知）
4. 模板库 20+ 类（停服 / 升级 / 政策 / 节日 / 营销活动）
5. 多通道：站内 + 短信 + 公众号 + 企微
6. 推送审批（重大公告 ≥ 1000 用户必须 PLATFORM_OWNER 双签）

### Requirement 15：数据库管理（V4 P1 补丁）

#### Acceptance Criteria

1. 备份历史可视化（每天 / 每小时 / 临时）
2. 一键恢复（指定时间点）
3. 大表清理工具（审计日志按月分区 + 6 年滚动）
4. 数据导出 / 导入工具（含敏感字段脱敏）
5. 任何恢复 / 清理操作必须 PLATFORM_OWNER 双签 + 写审计

### Requirement 16：系统日志可视化（V4 P1 补丁）

#### Acceptance Criteria

1. 错误日志（按级别 / 模块 / 时间筛选）
2. 慢请求日志（P95 / P99 阈值告警）
3. 安全事件日志（越权 / 越界 / 异常登录 / 反薅命中）
4. 一键导出 + 关键字搜索
5. traceId 可追溯完整调用链（[`28`] R2 协同）

### Requirement 17：性能仪表盘（V4 P1 补丁）

#### Acceptance Criteria

1. 实时 QPS / 延迟 / 错误率
2. AI 单点成本曲线（按任务类型 / 模型 / 时段）
3. 各 provider 健康状态（OpenRouter / 阿里百炼 / 火山方舟）
4. 一键告警配置（阈值可调，触发企业微信）
5. 月度成本对比（环比 / 同比）

### Requirement 18：智能管家审核工作台（V4 P3 + 注册审核）

#### Acceptance Criteria

1. 智能管家注册队列工作台（CS 24-72h 审）
2. 每条申请展示：实名信息 + 子类型 + 历史业绩 + 反薅信号
3. 通过 / 拒绝 / 复议 三键操作 + 拒绝理由必填
4. 拒绝 → 7 天内可申诉（CS → 风控 → 客户成功仲裁 三级）
5. 通过 → 自动生成培训任务 + 推广码

### Requirement 19：案例市场审核工作台（V4 P7 补丁）

#### Acceptance Criteria

1. 智能管家上传的 UGC 案例审核队列
2. AI 预审已自动打码 + 拒绝违规 + 标记重复 / 抄袭
3. 专家审核（同乾团队周一三五各 1h）
4. 通过 → 上架 + 智能管家 +50 点
5. 优质案例（专家点赞）→ 智能管家 +200 点 + 信誉 +30
6. 失败 → 退回原因 + 优化建议

### Requirement 20：政策资金管理工作台（V4 P2 补丁）

#### Acceptance Criteria

1. 30+ 资金可视化 CRUD（新增 / 编辑 / 下线 / 排序）
2. **顶部红色"立即扫描最新政策"按钮**：触发即时抓取（2 分钟内出结果）
3. 待审池：AI 抽取的新资金 / 增量更新 → 专家审核
4. 灰度发布：5% / 25% / 50% / 100%
5. 推送配置：哪些用户收到 / 推送时机 / 通道

### Requirement 21：上瘾机制后台（V4 P6 补丁）

#### Acceptance Criteria

1. 16 个上瘾机制每个独立开关（ON/OFF）
2. 阈值可调（如签到累积 7/14/30/90 天 → 后台调整为 5/10/20/60 天）
3. 中奖概率可调（限时抽点）
4. 奖励配置（点数 / 实物 / 现金 三层）
5. **奖励发放清算**（V4 P6）：
   - 点数奖励：实时入账，写 user_credits.gift_credits
   - 实物奖励：客户成功后台确认地址 → 平台采购 → 月度对账
   - 现金 / 大奖 ≥ ¥800：必走对公转账（不走微信）+ 个税 20% 代扣


### Requirement 22：PARTNER 智能管家代理人管理（V4 IMPROVEMENTS）

#### Acceptance Criteria

1. PARTNER 列表（筛选：subtype = AGENT_PARTNER）
2. 展示字段：
   - 实名 + 推荐数 + 转化率 + 累计分润 + 一票否决次数
   - 信誉分（独立维度）
   - 最近 90 天推荐链可视化
3. 一键禁用 / 启用（带审计）
4. 反作弊告警（一年限额 / 同手机 / 同 IP / 异常推荐）
5. 与接单类智能管家 UI 区分（不同 tab）

### Requirement 23：依赖（V4 IMPROVEMENTS 升级）

- 强依赖：[`02`] / [`06`] / [`07`] / [`08`] / [`09`] / [`22`]
- 弱依赖：所有业务模块（运营字段集成）


### Requirement 24：运营成本红线监控（V4 IMPROVEMENTS · 漏洞 1 / BR-903）

#### Acceptance Criteria

1. 性能仪表盘扩展（R17 升级）：
   - 实时显示 4 条 V4 运营成本红线（BR-903）
   - 单日 / 单月赠送点数池消耗
   - 单客户 / 单租户 AI 成本 Top 10
   - 赠送 / 实扣比例曲线
2. 阈值告警：
   - 月赠送点 ≥ ¥30,000 → 自动暂停早安简报推送
   - 单客户日 AI ≥ ¥10 → 触发降级（与 04-spec R12 协同）
   - 单租户月 AI ≥ ¥1,000 → 风控人工审核
3. 月度自检报告新增 BR-903 红线段
