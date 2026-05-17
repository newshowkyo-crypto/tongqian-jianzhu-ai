# 18 图纸智能识别 - Requirements

## Introduction

> 功能区 H：图纸解读 + 错误粗筛 + 版本对比 + 算量粗估。**SHALL NOT** 替代 BIM（[`requirements.md` R10.2](../00-project-overview/requirements.md)）。

**前置依赖**：[`02`] / [`04`] / [`10`]；模型用 Qwen-VL-Max（多模态）。

---

## Requirements

### Requirement 1：图纸上传 + 解读

#### Acceptance Criteria

1. 支持 DWG（先转图 / PDF）/ PDF / 图片，单文件 ≤ 100MB
2. AI 解读：图纸类型 / 关键尺寸 / 主要构件 / 设计参数（钢筋等级 / 砼标号）
3. T1（始终给摘要）

### Requirement 2：错误粗筛

1. 检测：尺寸不一致 / 标注缺失 / 与规范偏离
2. 输出风险点（粗筛精度有限，强制建议设计师确认）
3. T1，强制免责

### Requirement 3：版本对比

1. 上传新旧两版 → 输出变更点 + 影响范围

### Requirement 4：算量粗估

1. 主要构件量（混凝土 / 钢筋 / 砌体）粗估
2. 强制 ±30% 区间

### Requirement 5：边界

1. SHALL NOT 替代专业 BIM
2. SHALL NOT 自动算钢筋下料（仅总量粗估）
3. T2 起：误差大 / 复杂图 → 建议专业人工

### Requirement 6：依赖

- 强依赖：[`02`] / [`04`] / [`10`]
- 弱依赖：[`17`]（算量与造价联动）
