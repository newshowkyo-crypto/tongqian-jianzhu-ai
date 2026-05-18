# 黄金测试案例格式规范

## 数量要求

- 5 个核心 Prompt × 10 案例 = 50 案例。
- 后续 25 个 Prompt × 10 案例 = 250 案例。
- 上线后每月新增 5-10 案例。

## 覆盖要求

每个 Prompt 至少覆盖：

- happy path：4 个
- boundary：2 个
- error：2 个
- exception：2 个

## JSON 格式

```json
{
  "id": "contract-review-pro-001",
  "input": {
    "scenario": "[PLACEHOLDER_SCENARIO]",
    "facts": "[PLACEHOLDER_DESENSITIZED_FACTS]"
  },
  "expected_output": {
    "summary": "[PLACEHOLDER_EXPERT_SUMMARY]",
    "risks": ["[PLACEHOLDER_RISK]"],
    "actions": ["[PLACEHOLDER_ACTION]"],
    "disclaimer": "[PLACEHOLDER_DISCLAIMER]",
    "tierBadge": "Tier 3",
    "confidence": "medium",
    "buttons": ["自己执行", "人工复核"]
  },
  "expert_id": "[PLACEHOLDER_EXPERT_ID]",
  "expert_score_baseline": 90,
  "min_passing_similarity": 0.7,
  "tags": ["construction", "happy"]
}
```

## 脱敏要求

- 删除手机号、身份证、银行卡、合同金额精确值。
- 公司名可改为“某施工企业 A”。
- 金额用区间，例如 “500-800 万”。
- 地区可保留省市级。

## 评分标准

- 结构完整：20 分
- 行业正确：30 分
- 可执行动作：25 分
- 风险边界：15 分
- 口吻适配：10 分

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
