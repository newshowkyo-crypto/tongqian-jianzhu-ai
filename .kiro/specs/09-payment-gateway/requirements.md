# 09 支付网关 - Requirements

## Introduction

> 微信支付 + 支付宝 + 自动续费授权 + 退款分级 + 智能管家提现。落地：
> - [`design.md` §5.4 BR-201 至 BR-205](../00-project-overview/design.md)（保护期 / 退款）
> - [`§5.5 BR-303 / BR-304`](../00-project-overview/design.md)（分润递延 / 跨域代扣代付）
> - [`§5.9 BR-313`](../00-project-overview/design.md)（同乾方略推荐费）

**前置依赖**：[`02`] / [`06`] / [`07`] / [`08`]；弱依赖 [`22-agent-workspace`] 推荐费（可桩）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| 自动续费授权 | 微信支付商户号高级权限，用户首次授权后系统可自动扣款 |
| 代扣代付 | 平台从服务方实收金额扣 5% → 自动入归属智能管家账户（BR-303）|
| 提现 | 智能管家将"可提现余额"申请转出到银行卡 |

---

## Requirements

### Requirement 1：支付通道

#### Acceptance Criteria

1. THE 支付通道 SHALL 包括：微信支付（H5 / 公众号 / 小程序 / 桌面 Native）/ 支付宝（H5 / Native）
2. THE 通道 SHALL 抽象为 `PaymentProvider` 接口，新增通道（如银联）只需新增 provider 实现

### Requirement 2：自动续费授权

#### Acceptance Criteria

1. 用户首次订阅 SHALL 走"协议支付"接口（微信高级权限）
2. 后续续费 SHALL 调用授权 API 自动扣款（无需用户每次确认）
3. 支持随时关闭自动续费

### Requirement 3：退款（BR-201 至 BR-203）

#### Acceptance Criteria

1. 客户保护期 7 天内 SHALL 全额退款（BR-201）
2. 7-30 天 SHALL 50% 退款（BR-202）
3. 30 天后 SHALL 不退（除非系统故障 + 客服 + 财务双签）
4. 审批分级（BR-203）：< ¥500 客服 / ≥ ¥500 财务 / ≥ ¥10000 PLATFORM_OWNER
5. 退款 SHALL 触发归属智能管家对应分润扣回（BR-201）

### Requirement 4：跨域介绍费代扣代付（BR-303）

#### Acceptance Criteria

1. A 类派单成交 + 跨域类型 → 服务方上报实收金额
2. 平台自动从服务方"可提现余额"扣 5%
3. 5% 自动入归属智能管家"待结算"账户
4. 资金流标记 `cross_domain_fee_5pct`（写流水但**不计入平台收入**）

### Requirement 5：分润递延状态机（BR-304）

```
frozen → settlable → withdrawable → paid
  ↑           ↑            ↑          ↑
客户付费   保护期满      月底统一    提现成功
            7-45 天      结算       打款
```

#### Acceptance Criteria

1. 7 天保护期适用 A 类派单服务（BR-201 / BR-313）
2. 30 天客户验收期适用 B 类高端服务（化债 / ABS 等，BR-313）
3. 45 天适用政府专项债 / 跨境投融资（BR-313）

### Requirement 6：提现

#### Acceptance Criteria

1. 智能管家可申请提现（最低 ¥100，最高单次 ¥50,000）
2. 提现走审批引擎（< ¥500 系统自动 / ≥ ¥500 财务）
3. 等级影响提现速度（BR-332）：LV1 T+30 / LV2 T+15 / LV3 T+7 / LV4 T+3 / LV5 T+0
4. 提现到银行卡（手续费用户承担）

### Requirement 7：发票

详见 [`07-subscription-billing`]，本 spec 仅提供"开票请求 / 发票回调"接口。

### Requirement 8：边界

1. SHALL NOT 自建支付清结算系统（必须用合规通道）
2. SHALL NOT 实现境外支付（一期）
3. SHALL NOT 实现 P2P 转账

### Requirement 9：依赖

- 强依赖：[`02`] / [`06`] / [`07`] / [`08`]
- 弱依赖：[`22-agent-workspace`]（推荐费 / 跨域结算的桩）/ [`27-notification-center`]


---

## V4 升级（P6 补丁）

### Requirement 10：大奖对公转账（V4 P6 补丁）

#### Acceptance Criteria

1. 上瘾机制中奖 / 实物奖励金额 ≥ ¥800 → **必走对公转账**
2. SHALL NOT 通过微信红包发放大奖（避税要求）
3. 流程：
   - 客户成功在 admin 后台审批 + PLATFORM_OWNER 双签
   - 国税局个人偶然所得 20% 代扣
   - 财务通过对公转账打款
   - 写审计日志 6 年留存
4. 与 [`26-addiction-system`] R15 协同
5. 中奖人必须在线签订《偶然所得税扣缴知情书》（电子签名）
