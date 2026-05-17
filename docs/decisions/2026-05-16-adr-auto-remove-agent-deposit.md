# ADR-AUTO-2026-05-16：取消中介注册保证金

**日期**：2026-05-16
**决策人**：创始人（产品宪法变更）
**状态**：accepted（覆盖 22 spec R2 / 06 spec 中介注册流程的早期版本）

## 背景

早期产品宪法（22-agent-workspace R2 / 06-auth-rbac §3.4）要求中介注册时缴纳 ¥1000 保证金作为准入门槛和反薅手段。2026-05-16 创始人指出该条件已不应继续保留。

## 决策

**正式取消中介保证金 ¥1000 收费要求。** 中介注册改为：

- 零门槛入驻（不再缴纳任何资金）
- 实名资料审核（身份证 + 名片 + 历史业绩选填）
- 4 子类型选择保留（BR-004：AGENT_QUAL / TENDER / FIN / GENERAL）
- 强制培训通关（智能管家学院 6 节课）
- 信誉分基础 500 + LV2 见习起步（BR-331 / BR-332 不变）

### 状态机简化

```
旧: pending_deposit → pending_review → training → active
新: pending_review → training → active
```

`pending_deposit` 状态枚举移除。`agent_deposit` 支付订单类型移除。`deposit_amount` 字段保留为 nullable Decimal 以兼容历史数据，新注册中介统一写入 null。

## 备选方案

| 方案 | 优点 | 缺点 | 决策 |
|---|---|---|---|
| A. 保留 ¥1000 保证金 | 反薅效果直接 | 招募阻力大 + 与"推荐 0 抽成"理念冲突 + 拒绝时退款链路复杂 | ❌ 已采用过，本次取消 |
| B. 取消保证金 + 强化实名 + 培训 + 信誉分 | 零摩擦 + 长期约束 + 与品牌理念对齐 | 需要审核团队投入 + 培训内容建设 | ✅ 本次采用 |
| C. 保留象征性 ¥1（验证通道）| 保留资金通道 | 体验更糟（非零门槛但又象征化）| ❌ 否决 |

## 替代准入约束（如何保证质量）

去掉保证金后，准入和质量约束依靠以下机制（已在原 spec 中存在）：

1. **实名审核**：身份证 + 名片 + 子类型证据（24-72h 人工核验）
2. **反薅检查**（BR-315）：手机 / 身份证 / IP / 设备指纹 / 营业执照 5 维去重 + 黑名单
3. **强制培训**（status=training 期间不可派单）
4. **信誉分约束**（BR-331 / BR-332）：基础 500 / LV2 / 30 天保护期 / **LV1 重启 6 次封顶**
5. **客户保护期 + 退款扣回分润**（BR-201 / BR-313）
6. **拒绝/封禁机制**：rejected 冻结 + 7 天申诉

## 影响

### 受影响文件（已同步更新）

| 文件 | 改动 |
|---|---|
| `.kiro/steering/decision-defaults.md` | 中介保证金条目改为"取消" + 引用本 ADR |
| `.kiro/specs/00-project-overview/design-flows.md` | §3.1 TL;DR + §3.4 流程 3 重写 mermaid（去 Pay 参与方）+ 关键约束改写 |
| `.kiro/specs/06-auth-rbac/requirements.md` | R1.3 中介注册描述 + R12 依赖（移除对 09-payment-gateway 的弱依赖） |
| `.kiro/specs/06-auth-rbac/tasks.md` | B2 任务描述 + 验收 |
| `.kiro/specs/06-auth-rbac/design.md` | TenantStatus 枚举移除 `pending_deposit` |
| `.kiro/specs/09-payment-gateway/design.md` | 订单 type 枚举移除 `agent_deposit`；POST /payments/orders 注释移除 `deposit` |
| `.kiro/specs/22-agent-workspace/design.md` | `deposit_amount` 改为 nullable，去掉 `@default(1000)` |
| `docs/marketing/poster-master.md` | 方向 A 文案 2 处改为"免保证金加盟" |
| `docs/marketing/brochure-deck.md` | 第 7 张 / 第 8 张 prompt 改为"零门槛入驻 / 免保证金 / ¥0" |

### 不受影响

- 其他建筑业行业术语保证金（投标保证金 / 履约保证金 / 质保金）保留在 `docs/glossary.md`，与中介准入无关。
- 中介保护期 / 信誉分 / 推荐 0 抽成 / 跨域 5% / 7 天客户保护期等其他规则全部保留。

### 数据迁移

历史中介（如有 `deposit_amount = 1000` 的记录）：
- 字段保留 nullable
- 历史值不动（作为该用户已缴的存证）
- 后续退还由客服按工单处理（不进入新流程）

## 后续

- [ ] 一期上线前需补充：智能管家学院 6 节培训课内容大纲（22-agent-workspace 后续 task）
- [ ] 反薅 5 维去重在智能管家注册场景的强化（28-security-compliance）
- [ ] 营销物料（公众号文章 / 朋友圈卡片）后续生产时统一用"免保证金 + 实名审核 + 强制培训"话术
