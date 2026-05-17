# 08 点数系统 - Requirements

## Introduction

> 点数账户 + 流水 + 多池余额 + AI 失败退点幂等 + 有效期管理。落地 [`design.md` §5.6 BR-204 / BR-404 / BR-405 / BR-406](../00-project-overview/design.md)。
>
> ⚠️ 一期"用户可见"统一以"点"显示（BR-405），1 元 = 100 点，运营后台保留双轨（元 / 点）。

**前置依赖**：[`02`] / [`06`]；与 [`04-ai-gateway`]、[`07-subscription-billing`]、[`09-payment-gateway`] 互相消费。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| Credit Lot | 点数批次（每笔来源独立计算有效期）|
| 预扣 / 实扣 / 退还 | AI 调用三阶段（idempotent）|
| 多池余额 | 订阅 / 充值 / 赠送 三种池子，按"先到期先扣"消费 |

---

## Requirements

### Requirement 1：点数有效期分类（BR-404）

| 来源 | 有效期 |
|---|---|
| 订阅赠送（每月）| 当月有效，**不结转** |
| 充值 | 永久有效 |
| 赠送（签到 / 邀请 / 阶梯优惠返点 / 抽点 等）| 90 天有效（默认，可后台调）|
| AI 失败退还 | 还原到原 lot（保留原 expires_at）|

### Requirement 2：扣费消费顺序

按"先到期先扣 + 多 lot 池"原则：
1. 当月订阅赠送（最早到期）
2. 赠送（90 天）
3. 充值（永久）

### Requirement 3：UI 一致性（BR-405）

#### Acceptance Criteria

1. 用户可见 UI **强制**用"点"显示（通过 `<CreditDisplay>` 组件）
2. 业务代码 SHALL NOT 直接渲染 `元`/`点` 字符（ESLint 拦截）
3. 运营 / 财务后台可同时显示双轨（元 / 点）

### Requirement 4：AI 失败退点幂等（BR-204）

#### Acceptance Criteria

1. 退点 SHALL 通过同 `idempotency_key` 重复调用只成功 1 次
2. 部分完成的任务（如 4 章生成 3 章）SHALL 按比例退还
3. PBT 强制：相同 idempotency_key + 不同时间 → 退点结果一致

### Requirement 5：充值流程

#### Acceptance Criteria

1. 充值套餐：¥100 = 10000 点 / ¥500 = 50500 点（含赠送）/ ¥1000 = 102000 点 / ¥5000 = 530000 点
2. 充值流程：发起 → 微信 / 支付宝 → 回调 → 入账 → 生成 lot
3. 充值点数永久有效（BR-404）

### Requirement 6：复活机制（BR-406）

#### Acceptance Criteria

1. 用户退订 30 天内重新订阅 → 复活原 lot（解除 frozen_until）
2. 超 30 天 → 全部 lot 作废

### Requirement 7：流水

#### Acceptance Criteria

1. 每次预扣 / 实扣 / 退还 / 充值 / 赠送 SHALL 写 credit_logs（永不修改）
2. 用户可在"我的点数"页查看流水（按时间倒序，分页）

### Requirement 8：边界

1. SHALL NOT 实现点数转账（用户间转账）
2. SHALL NOT 实现点数兑换实物（一期）
3. SHALL NOT 在用户端展示金额（`元`），后台双轨

### Requirement 9：依赖

- 强依赖：[`02`] / [`06`]
- 弱依赖：[`04`] / [`07`] / [`09`]
- 后续阻塞：[`24-admin-console`] 业务运营 / 财务对账
