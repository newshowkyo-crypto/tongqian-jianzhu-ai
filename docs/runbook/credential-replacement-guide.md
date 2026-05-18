# Admin 凭证替换指南

## 入口

- 本地：admin `http://localhost:3011/admin/credentials`
- 生产：`https://admin.[PLACEHOLDER_DOMAIN]/admin/credentials`

## 替换原则

- 真实凭证只从后台表单录入。
- 禁止把密钥写入代码、PR、issue、聊天记录。
- P1 缺失时继续使用 mock provider，不阻塞上线演练。
- 切换为 `real` 必须由 `PLATFORM_OWNER` 审批。

## 操作步骤

1. 打开“系统配置 · 凭证管理”。
2. 选择 provider：`wechat_pay` / `alipay` / `aliyun_oss` / `aliyun_sms` / `dashvector`。
3. 输入凭证 Key，例如 `WECHAT_PAY_MCH_ID`。
4. 模式选择：
   - `mock`：立即生效。
   - `real`：进入 `pending_approval`。
5. 输入真实凭证值 `[PLACEHOLDER_REAL_SECRET_INPUT]`。
6. 填写变更原因。
7. 填写审批流 ID `[PLACEHOLDER_APPROVAL_FLOW_ID]`。
8. 提交后等待 `PLATFORM_OWNER` 审批。
9. 审批通过后验证 `system_configs.credentials.*` 已热更新。
10. 查看审计日志包含：
    - `credential.upsert`
    - `system_config.sync`
    - `audit_log.write`

## 截图占位

- [PLACEHOLDER_SCREENSHOT_CREDENTIAL_LIST]
- [PLACEHOLDER_SCREENSHOT_MOCK_REAL_TOGGLE]
- [PLACEHOLDER_SCREENSHOT_APPROVAL_FLOW]
- [PLACEHOLDER_SCREENSHOT_AUDIT_LOG]

## 验证清单

- mock/real toggle 可见。
- real 模式显示 `pending_approval`。
- 审批人为 `PLATFORM_OWNER`。
- 审计日志可追踪操作人、原因、时间。
- system config 热更新失败时自动回退 mock。

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
