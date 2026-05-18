# 月度自检 Runbook

## 执行时间

每月 1 日 09:30，由 admin 触发或 worker cron 自动生成。

## 输入

- BR-901 红线数据
- BR-903 运营成本红线
- 审计日志统计
- AI provider 成本与失败率
- 客诉、退款、派单异常

## Cron 输出格式

```json
{
  "month": "[PLACEHOLDER_YYYY_MM]",
  "red_lines": [
    {
      "key": "gift_credit_monthly_pool_cny",
      "threshold": 30000,
      "actual": 0,
      "status": "green"
    }
  ],
  "audit": {
    "total": 0,
    "high_risk_actions": 0
  },
  "cost": {
    "ai_unit_cost_cny": 0,
    "refund_rate": 0
  },
  "actions": ["[PLACEHOLDER_ACTION]"]
}
```

## 人工复核

- 任一红线为 red：创始人当天复核。
- AI 单点成本上升 > 20%：检查模型路由。
- 退款率 > 阈值：检查支付与服务承诺。
- 审计高危动作 > 0：抽查操作人和审批流。

## 输出

- 保存到 admin 月报。
- 发送给创始人。
- 归档到 `docs/changelog/` 或运营台。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
