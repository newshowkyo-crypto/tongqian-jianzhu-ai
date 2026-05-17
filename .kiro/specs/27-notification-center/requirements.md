# 27 通知中心 - Requirements

## Introduction

> 功能区 P：微信公众号 + 企微 + 阿里短信 + 站内信 + 桌面通知 + 邮件 6 通道。

**前置依赖**：[`02`] / [`06`]；外部依赖：微信公众号 / 企微 / 阿里云短信。

---

## Requirements

### Requirement 1：6 大通道

#### Acceptance Criteria

1. 站内信（IM 消息）/ 微信公众号 / 企业微信 / 阿里云短信 / 邮件 / 桌面通知（[`05`] 通道）
2. 用户可在"通知偏好"开关每个通道

### Requirement 2：通知模板

#### Acceptance Criteria

1. 模板按场景分（订阅续费 / 资质到期 / 风险红灯 / 派单接单 / 评分提醒 / 月报 / 月度战报 等）
2. 每个模板对应多通道的具体内容
3. 后台可编辑

### Requirement 3：分级 + 节流

#### Acceptance Criteria

1. 紧急级别：critical（短信 + 站内）/ high（多通道）/ normal（站内 + 公众号）/ low（站内）
2. 节流：紧迫感 ≤ 3/日（BR-604）+ 智能管家评分催评 ≤ 1/订单 + 系统级 ≤ 50/用户/日

### Requirement 4：多通道收敛

#### Acceptance Criteria

1. 同一事件不重复推送（基于事件 hash 去重）
2. 失败 / 用户阻断 SHALL 自动降级到次优通道

### Requirement 5：审计 + 统计

#### Acceptance Criteria

1. 所有发送写日志
2. 后台看送达率 + 阅读率（公众号 / 邮件）

### Requirement 6：边界

1. SHALL NOT 在政府版开公众号 / 企微（仅站内 + 邮件）
2. SHALL NOT 公开订阅未确认的群发（防 spam）

### Requirement 7：依赖

- 强依赖：[`02`] / [`06`]
- 外部：阿里云短信 / 微信公众号 / 企业微信
- 全局被消费：所有业务模块
