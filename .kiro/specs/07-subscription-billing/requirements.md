# 07 订阅与计费（Subscription Billing）- Requirements

## Introduction

> 5 档订阅 + 阶梯优惠 + 自动续费 + 状态机闭环。落地 [`design.md` §5.6 BR-401 至 BR-407 / BR-408 / BR-409 / BR-205](../00-project-overview/design.md)。

**前置依赖**：[`02`] / [`06`] 完成；弱依赖 [`09-payment-gateway`]（可桩）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| 5 档订阅 | trial（永久免费）/ 轻享 ¥39 / 标准 ¥199 / 企业 ¥499 / 旗舰 ¥999 |
| 阶梯优惠 | 连续付费月数累加（counter）→ 越续越便宜 |
| 自动续费 | 默认开 + 失败重试 3 次 + 转 past_due |
| 旗舰版专属顾问 | 既有咨询团队按地区 / 行业 / 负载分配（BR-409，每顾问最多 30 客户）|

---

## Requirements

### Requirement 1：5 档订阅（BR-401）

#### Acceptance Criteria

1. THE 订阅档位 SHALL 在 `subscription_plans` 表 + `packages/constants/subscription-plans.ts` 默认值，**支持 system_configs 后台覆盖**：

| 档位 | 月费 | 年费（连续付费 12 月） | 含点数 / 月 | 关键功能 |
|---|---|---|---|---|
| trial | ¥0 | — | 500 注册 + 50 周签到 | 5 大杀手锏限次试用 |
| lite | ¥39 | ¥390 | 4000 | 杀手锏不限次（部分降级模型） |
| std | ¥199 | ¥1990 | 25000 | 全功能 + Tier 1/2 AI + 联合品牌（智能管家引流的客户） |
| ent | ¥499 | ¥4990 | 80000 | + 项目部生产 / 资料员功能 + Tier 2 |
| flag | ¥999 | ¥9990 | 200000 | + 专属顾问 + 旗舰品牌 + 优先咨询通道 |

2. THE 试用版功能 SHALL 部分降级（BR-321 Tier 1 限次 / 报告水印）。

### Requirement 2：阶梯优惠（BR-402 / BR-205）

#### Acceptance Criteria

1. THE 用户每月续费成功 SHALL 累加 `subscriptions.consecutive_months` counter
2. THE 任一月未续费 SHALL counter=0；重新订阅 counter=1
3. 折扣阈值（默认值）：
   - 连续 3 个月：8.5 折
   - 连续 6 个月：8 折
   - 连续 12 个月：7 折（封顶）
4. THE 折扣 SHALL 通过"客户付原价 → 差价转点数赠送"实现（BR-205）：
   - 客户付 ¥199（订阅）→ 系统检测 counter 触发折扣 → 自动赠点数（差价 × 100，gift type，90 天有效）
5. THE 一次性预付（6/12/24 月）SHALL 独立结算，**不参与** counter 累计

### Requirement 3：自动续费（BR-403 / BR-408）

#### Acceptance Criteria

1. THE 订阅 SHALL 默认开启 `auto_renew=true`，首单页面明确告知
2. THE 续费提醒 SHALL 在到期前 7/3/1 天推送（[`27-notification-center`]）
3. THE 失败重试：间隔 24h 重试 3 次；仍失败 → 状态 `active → past_due`
4. THE 完整状态机（BR-408）：
   ```
   trial → active（首次付费）
   active → past_due（自动续费连续 3 次失败）
   past_due → active（用户 7 天内手动续费成功）
   past_due → canceled（持续 30 天用户仍未恢复）
   canceled → active（30 天内重新订阅；点数复活，BR-406）
   canceled → expired（超 30 天 → 点数永久作废）
   ```

### Requirement 4：升降档（BR-407）

#### Acceptance Criteria

1. **升档**：立即生效，按比例补差价（剩余天数 × 新档日均价 - 已付未消耗的旧档余额）
2. **降档**：当月有效，下月生效
3. **退订**：当月有效，下月停服

### Requirement 5：旗舰版专属顾问（BR-409）

#### Acceptance Criteria

1. 升级旗舰版时 SHALL 自动分配 1 名 PLATFORM_CONSULT 顾问
2. 分配规则：客户行业 + 地区 + 顾问当前负载（每顾问最多 30 个旗舰客户）
3. 超额时由 OPS_MGR 手动调度
4. 客户首页右上角显示顾问头像 + 在线状态 + 一键预约视频

### Requirement 6：发票

#### Acceptance Criteria

1. 自动续费成功后 24h 内开具增值税专用发票（电子）+ 发送到预留邮箱
2. 用户可在"我的发票"页查看 + 下载

### Requirement 7：边界

1. SHALL NOT 实现完整的 SaaS 多版本切换（仅 5 档固定）
2. SHALL NOT 实现按年套餐自动续费时的"年付优惠 vs 阶梯优惠"叠加（只取一种）
3. SHALL NOT 实现团队席位（一期：tenant 内员工不限数）

### Requirement 8：依赖

- 强依赖：[`02`] / [`06`] / [`08-credit-system`]
- 弱依赖：[`09-payment-gateway`]（可桩）/ [`27-notification-center`]
- 后续阻塞：[`24-admin-console`] 业务运营看板
