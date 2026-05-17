# 20 知识系统 - Requirements

## Introduction

> 平台知识库基础设施：4 大数据库（政策 / 业绩 / 合同条款 / 招标结构）+ 抓取流水线 + RAG 检索 + 内容审核台。
>
> 被 [`11`] / [`14`] / [`15`] / [`19`] / [`23`] 等多个模块消费。

**前置依赖**：[`02`] / [`04`]；后续被 [`21-rules-engine`] 协同（规则库基于知识库）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| 知识库 | 4 类：policies / performances / contract_clauses / tender_structures |
| 抓取 | 自动化从公开数据源抓取（政府网站 / 招标公告 / 公示信息）|
| RAG | Retrieval-Augmented Generation，向量检索 + LLM 生成 |
| DashVector | 阿里云向量数据库 |
| 专家审核台 | 抓取的内容由专家审核（[`24-admin-console`]）后入生产库 |

---

## Requirements

### Requirement 1：4 大数据库

#### Acceptance Criteria

1. **政策库**：基建 / 化债 / 专项债 / 国资 / 资质 等政策原文 + AI 摘要
2. **业绩库**：行业项目业绩公示数据（中标公告 / 完工验收）
3. **合同条款库**：标准条款 + 风险条款 + 修改建议（用于 [`13`]）
4. **招标结构库**：典型招标文件结构 + 评分标准模板（用于 [`12`]）

### Requirement 2：抓取流水线

#### Acceptance Criteria

1. 数据源：政府网站 / 招标公告平台 / 公示信息（公开 + 合规）
2. 抓取频率：日 / 周 / 月（按数据源）
3. 流程：抓取 → 清洗 → 抽取（AI）→ 入库（pending review）→ 专家审核 → published
4. 失败重试 + 数据源断流告警

### Requirement 3：向量索引（RAG）

#### Acceptance Criteria

1. 4 大数据库内容均嵌入 → DashVector
2. 业务模块（[`11`] / [`13`] / [`14`] / [`19`] 等）调本模块 `retrieve(query)` 返回 Top-5 相关条目

### Requirement 4：专家审核台（在 [`24-admin-console`] 实现 UI）

#### Acceptance Criteria

1. 待审核条目列表：原文 + AI 抽取结果 + 置信度 + 冲突提示
2. 专家点击通过 → published 状态 + 进生产库
3. 拒绝 → 写原因 + 反馈给 AI 优化

### Requirement 5：业务模块查询接口

#### Acceptance Criteria

1. `policy.search({topics, level, date_range})` → 政策列表
2. `performance.search({region, industry, amount_range})` → 业绩
3. `contract_clause.search({type, risk_level})` → 合同条款
4. `tender_structure.get_template({industry, project_type})` → 招标模板

### Requirement 6：政策推送（与 [`27-notification-center`] / [`15-ops-toolkit`] 联动）

#### Acceptance Criteria

1. 用户订阅政策主题 → 新政发布 24h 内推送
2. 推送内容含 AI 摘要 + 影响分析

### Requirement 7：边界

1. SHALL NOT 抓取需登录的内容（合规）
2. SHALL NOT 自动发布未审核内容（防 AI 抽取错误污染生产）
3. SHALL NOT 提供"在线编辑器"（专家仅审核，不创建新条目）

### Requirement 8：依赖

- 强依赖：[`02`] / [`04`]
- 弱依赖：[`24-admin-console`]（专家审核台 UI）/ [`27`]（政策推送）
- 后续阻塞：[`11`] / [`13`] / [`14`] / [`15`] / [`19`] / [`21`] / [`23`]
