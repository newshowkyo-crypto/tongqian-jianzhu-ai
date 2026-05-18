# 上线前合规自查

## 基本信息

- 检查日期：[PLACEHOLDER_DATE]
- 检查人：[PLACEHOLDER_OWNER]
- 版本：[PLACEHOLDER_COMMIT_SHA]

## 必查项

| 项目 | 状态 | 证据 |
|---|---|---|
| ICP 备案 | [PLACEHOLDER_STATUS] | [PLACEHOLDER_LINK] |
| 用户协议 | [PLACEHOLDER_STATUS] | docs/legal/user-agreement-draft.md |
| 隐私政策 | [PLACEHOLDER_STATUS] | docs/legal/privacy-policy-draft.md |
| 智能管家协议 | [PLACEHOLDER_STATUS] | docs/legal/agent-cooperation-agreement-draft.md |
| 数据出境授权 | [PLACEHOLDER_STATUS] | docs/legal/data-export-consent-draft.md |
| 审计日志 | done | `audit_logs` / `gov_audit_logs` |
| 反作弊 | done | `fraud_signals` / blacklist |
| 备份 | deferred | [PLACEHOLDER_OSS_BUCKET] |
| 紧急熔断 | done | admin emergency API |
| Prompt 红线 | done | AI output validator |

## 结论

- 可上线：[PLACEHOLDER_YES_NO]
- 阻塞项：[PLACEHOLDER_BLOCKERS]
- 创始人签字：[PLACEHOLDER_SIGNATURE]

由 Codex 自动生成 + 创始人 / 律师 / 专家审核
