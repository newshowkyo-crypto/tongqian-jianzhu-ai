# 08 点数系统 - Tasks

## 任务总数：9

- [x] **A1** Prisma：CreditAccount / CreditLot / CreditLog + migration
- [x] **A2** 实现 `lot/lot.service.ts` + `lot-allocator.service.ts`（先到期先扣，PBT）
- [x] **A3** 实现 `preCharge/pre-charge.service.ts` / `commit.service.ts` / `refund.service.ts`（idempotent + 替换 [`04-ai-gateway`] B2 桩）
- [x] **A4** 实现 `topup/topup.service.ts` + `topup-package.service.ts`（4 档套餐 seed）
- [x] **A5** 实现 `gift` 入口（被 [`07`] 阶梯返点 / [`26`] 签到 / 邀请奖励调用）
- [x] **A6** 实现 `expiry/expiry.worker.ts`（每天 03:30 cron）
- [x] **A7** 实现 `reactivation/reactivation.service.ts`（BR-406 + freeze/unfreeze）
- [x] **A8** API：`GET /credits/balance` / `/lots` / `/logs` / `POST /topup` + OpenAPI
- [x] **A9** e2e + PBT：扣点 + 退点 + 充值 + 复活全流程；幂等 + 先到期先扣 + 余额一致性

## 完成标准

- ✅ [`04-ai-gateway`] 替换桩为真实 credit 调用
- ✅ 用户可见 UI 全部 `<CreditDisplay>`，ESLint 不容许直接 `点`/`元`
- ✅ PBT 全绿
