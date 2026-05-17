# 25 AI 全局聊天 - Requirements

## Introduction

> 功能区 N：全局 AI 聊天窗口（workbuddy 风格）+ 任务编排 + 公众号 / 企微 / 桌面端 / 外部 API 接入。
>
> 用户场景：建筑老板用聊天问"上个月哪个项目利润最高"、"帮我催款 3 笔"、"看看这个合同有什么风险"。

**前置依赖**：[`02`] / [`04`]；可调任意业务模块（杀手锏 / 助理）。

---

## Requirements

### Requirement 1：全局聊天窗口（apps/web 右下角浮窗）

#### Acceptance Criteria

1. 全局浮窗（apps/web / desktop / agent / gov 都可见，按各自上下文）
2. 多轮对话 + 历史保留（最近 30 天）
3. 短对话同步（< 3s）；长任务异步（[`04`] P-8）

### Requirement 2：意图识别 + 任务编排

#### Acceptance Criteria

1. 用户问题 → AI 识别意图 → 触发对应业务能力
2. 起步意图：
   - 问内部数据（[`15-ops-toolkit`] 助理）
   - 触发合同审查（[`13`]）
   - 触发催收函（[`15`]）
   - 政策问答（[`20`]）
   - 资质体检（[`14`]）
   - 项目可投性（[`11`]）
3. AI 回复含"已为您触发 XXX 任务，进度可在 XX 页查看"

### Requirement 3：多通道接入

#### Acceptance Criteria

1. **网页**：apps/web / agent / gov 浮窗
2. **桌面端**：[`05`] 剪贴板桥（Ctrl+Alt+V）
3. **公众号**：用户在公众号发消息 → 经统一聊天 hub 处理
4. **企业微信**：同上
5. **外部 API**：开放 RESTful endpoint（OAuth）+ 限流

### Requirement 4：上下文记忆

#### Acceptance Criteria

1. 单租户内对话历史（最近 3 轮原文 + 更早摘要 200 字）
2. 跨设备同步（同一用户在 web / 桌面 / 公众号都看到同一对话流）

### Requirement 5：边界

1. SHALL NOT 替代杀手锏的专用入口（聊天仅是触发 / 摘要，详细在专门页）
2. SHALL NOT 把对话历史用于 AI 训练（合规）

### Requirement 6：依赖

- 强依赖：[`02`] / [`04`]
- 弱依赖：所有业务模块（任务编排目标）/ [`27`]
- 后续：[`26-addiction-system`] 上瘾入口
