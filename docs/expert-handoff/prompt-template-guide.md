# 专家 Prompt 内容填写指南

## 目标

让建筑行业专家把经验写成可测试、可维护、可上线的 Prompt 内容。

## 必填结构

每个 Prompt 至少包含：

- 适用场景
- 输入字段
- 输出结构
- 禁止事项
- 免责声明
- Tier 边界
- AI 信心度规则
- 角色引导按钮

## 价值密度 6 问

填写前逐项回答：

1. 客户本次点数成本是多少。
2. 外部替代成本是否 ≥ 10 倍。
3. 客户读完是否觉得值。
4. 免费钩子输出是否 ≥ 50-100 点价值。
5. 干货是否 ≥ 70%。
6. 是否依赖本平台知识库/数据/模型。

## 输出口吻

- 建筑老板：短句、可执行、强调钱和风险。
- 智能管家：强调跑腿、窗口、关系、兜底。
- 政企用户：稳健、留痕、合规。
- 员工：明确上报、执行、材料清单。

## 禁止

- 不得硬编码“中介”。
- 不得承诺绝对法律结论。
- 不得用恐吓、误导、虚假稀缺。
- 不得让客户为低价值内容付点数。

## 交付格式

```md
# [PROMPT_NAME] v1

## System Prompt
[PLACEHOLDER_SYSTEM_PROMPT]

## User Prompt Template
[PLACEHOLDER_USER_PROMPT]

## Variables
- [PLACEHOLDER_VARIABLE]

## Output JSON Schema
[PLACEHOLDER_SCHEMA]

## Fallback
[PLACEHOLDER_FALLBACK]
```

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
