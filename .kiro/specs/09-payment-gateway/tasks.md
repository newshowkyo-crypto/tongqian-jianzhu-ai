# 09 支付网关 - Tasks

## 任务总数：11

- [x] **A1** Prisma：PaymentOrder / PaymentRefund / AutoChargeContract / AgentCommission / AgentWithdrawal + migration
- [x] **A2** 实现 `payment-provider.interface.ts` + `wechat.provider.ts`（H5 / 公众号 / Native / 协议支付）
- [x] **A3** 实现 `alipay.provider.ts`（H5 / Native / 周期扣款）
- [x] **A4** 实现 `orders/order.service.ts`（创建 + 状态机 + idempotency-key 唯一约束）
- [x] **A5** 实现 webhook：`wechat-webhook.controller.ts` + `alipay-webhook.controller.ts`（签名校验 PBT）
- [x] **A6** 实现 `refund/` 三件套（service + protection-period + refund-rule）+ 接 [`06`] 审批
- [x] **A7** 实现 `auto-charge/wechat-contract.service.ts`（协议签约 / 自动扣款 / 解约）
- [x] **A8** 实现 `commission/` 三件套（settlement BR-303 跨域 / lifecycle BR-304 状态机 / clawback BR-201 退款扣回）
- [x] **A9** 实现 `withdrawal/withdrawal.service.ts`（最低/最高 + 审批 + 银行卡 + 等级 T+N + 手续费）
- [x] **A10** API + OpenAPI 注册（含 GET /agent/commissions/me 给 22 工作台调）
- [x] **A11** e2e + PBT：订单 / 退款 / 跨域 5% 守恒 / 自动续费 / 提现

## 完成标准

- ✅ 微信 + 支付宝跑通沙箱
- ✅ 退款分级 + 审批 + 扣回完整链路
- ✅ 自动续费协议支付通过
- ✅ 跨域 5% PBT（服务方扣 = 归属方进，平台 0）


---

## V4 升级新增任务（P6 补丁）

- [x] **09-V4-1** RewardClaim 模型集成（与 26 spec 协同）
- [x] **09-V4-2** 大奖 ≥ ¥800 强制对公转账路由（拒微信红包路径）
- [x] **09-V4-3** 个税 20% 代扣计算 + 偶然所得税扣缴知情书电子签
- [x] **09-V4-4** PLATFORM_OWNER 双签审批 + 财务对公打款
- [x] **09-V4-5** e2e：抽奖 → 大奖触发 → 双签 → 代扣 → 对公到账
