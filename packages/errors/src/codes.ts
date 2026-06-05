export interface ErrorCodeDef {
  code: string;
  httpStatus: number;
  message: string;
  userActionable: boolean;
}

export const ErrorCodes = {
  AUTH_LOGIN_PASSWORD_INVALID: { code: 'AUTH.LOGIN.PASSWORD_INVALID', httpStatus: 401, message: 'Invalid username or password.', userActionable: true },
  PERM_ACTION_DENIED: { code: 'PERM.ACTION.DENIED', httpStatus: 403, message: 'Permission denied.', userActionable: true },
  TENANT_NOT_FOUND: { code: 'TENANT.READ.NOT_FOUND', httpStatus: 404, message: 'Tenant not found.', userActionable: false },
  SUB_PLAN_UNAVAILABLE: { code: 'SUB.PLAN.UNAVAILABLE', httpStatus: 422, message: 'Subscription plan is unavailable.', userActionable: true },
  CREDIT_INSUFFICIENT: { code: 'CREDIT.DEDUCT.INSUFFICIENT', httpStatus: 422, message: 'Insufficient credits.', userActionable: true },
  PAY_ORDER_CONFLICT: { code: 'PAY.ORDER.CONFLICT', httpStatus: 409, message: 'Payment order state conflict.', userActionable: false },
  REPORT_RENDER_FAILED: { code: 'REPORT.RENDER.FAILED', httpStatus: 500, message: 'Report rendering failed.', userActionable: false },
  OPP_SOURCE_UNAVAILABLE: { code: 'OPP.SOURCE.UNAVAILABLE', httpStatus: 503, message: 'Opportunity source is temporarily unavailable.', userActionable: false },
  TENDER_DOC_INVALID: { code: 'TENDER.DOC.INVALID', httpStatus: 400, message: 'Tender document is invalid.', userActionable: true },
  CONTRACT_REVIEW_UNSUPPORTED: { code: 'CONTRACT.REVIEW.UNSUPPORTED', httpStatus: 422, message: 'Contract review is unsupported for this input.', userActionable: true },
  QUAL_RULE_NOT_FOUND: { code: 'QUAL.RULE.NOT_FOUND', httpStatus: 404, message: 'Qualification rule not found.', userActionable: false },
  OPS_TASK_INVALID: { code: 'OPS.TASK.INVALID', httpStatus: 400, message: 'Operations task is invalid.', userActionable: true },
  SITE_PROJECT_REQUIRED: { code: 'SITE.PROJECT.REQUIRED', httpStatus: 400, message: 'Project is required.', userActionable: true },
  COST_ESTIMATE_INVALID: { code: 'COST.ESTIMATE.INVALID', httpStatus: 400, message: 'Cost estimate input is invalid.', userActionable: true },
  DRAW_FILE_UNSUPPORTED: { code: 'DRAW.FILE.UNSUPPORTED', httpStatus: 415, message: 'Drawing file type is unsupported.', userActionable: true },
  CASH_PERIOD_INVALID: { code: 'CASH.PERIOD.INVALID', httpStatus: 400, message: 'Cashflow period is invalid.', userActionable: true },
  KB_DOCUMENT_NOT_FOUND: { code: 'KB.DOCUMENT.NOT_FOUND', httpStatus: 404, message: 'Knowledge document not found.', userActionable: false },
  RULE_EVALUATION_FAILED: { code: 'RULE.EVALUATION.FAILED', httpStatus: 422, message: 'Rule evaluation failed.', userActionable: false },
  AGENT_PROFILE_INCOMPLETE: { code: 'AGENT.PROFILE.INCOMPLETE', httpStatus: 422, message: 'Agent profile is incomplete.', userActionable: true },
  DISPATCH_NO_AGENT_MATCHED: { code: 'DISPATCH.MATCH.NO_AGENT', httpStatus: 422, message: 'No matched agent is currently available.', userActionable: false },
  RATING_WINDOW_CLOSED: { code: 'RATING.WINDOW.CLOSED', httpStatus: 422, message: 'Rating window is closed.', userActionable: true },
  REPUTATION_EVENT_INVALID: { code: 'REPUTATION.EVENT.INVALID', httpStatus: 400, message: 'Reputation event is invalid.', userActionable: false },
  APPEAL_WINDOW_CLOSED: { code: 'APPEAL.WINDOW.CLOSED', httpStatus: 422, message: 'Appeal window is closed.', userActionable: true },
  REFP_RATE_INVALID: { code: 'REFP.RATE.INVALID', httpStatus: 422, message: 'Referral fee rate is invalid.', userActionable: false },
  GOV_DOMESTIC_MODEL_REQUIRED: { code: 'GOV.AI.DOMESTIC_MODEL_REQUIRED', httpStatus: 403, message: 'Government workspace must use domestic model routing.', userActionable: false },
  ADMIN_CONFIG_LOCKED: { code: 'ADMIN.CONFIG.LOCKED', httpStatus: 423, message: 'Admin configuration is locked.', userActionable: false },
  CHAT_SESSION_NOT_FOUND: { code: 'CHAT.SESSION.NOT_FOUND', httpStatus: 404, message: 'Chat session not found.', userActionable: false },
  ADDICT_REWARD_LIMITED: { code: 'ADDICT.REWARD.LIMITED', httpStatus: 429, message: 'Reward frequency limit reached.', userActionable: true },
  NOTIF_CHANNEL_UNAVAILABLE: { code: 'NOTIF.CHANNEL.UNAVAILABLE', httpStatus: 503, message: 'Notification channel is unavailable.', userActionable: false },
  SEC_REDLINE_TRIGGERED: { code: 'SEC.REDLINE.TRIGGERED', httpStatus: 403, message: 'Security redline triggered.', userActionable: false },
  FRAUD_RISK_DETECTED: { code: 'FRAUD.RISK.DETECTED', httpStatus: 403, message: 'Fraud risk detected.', userActionable: false },
  AUDIT_LOG_WRITE_FAILED: { code: 'AUDIT.LOG.WRITE_FAILED', httpStatus: 500, message: 'Audit log write failed.', userActionable: false },
  EXPORT_APPROVAL_REQUIRED: { code: 'EXPORT.APPROVAL.REQUIRED', httpStatus: 202, message: 'Data export requires approval.', userActionable: true },
  AI_GATEWAY_UNAVAILABLE: { code: 'AI.GATEWAY.UNAVAILABLE', httpStatus: 503, message: 'AI service is temporarily unavailable and credits were refunded.', userActionable: true },
  AI_PROMPT_RED_LINE_VIOLATION: { code: 'AI.PROMPT.RED_LINE_VIOLATION', httpStatus: 422, message: 'Prompt contains red-line language.', userActionable: false },

  // Owner Risk Radar
  OWNER_RISK_PROFILE_NOT_FOUND: { code: 'OWNER_RISK.PROFILE.NOT_FOUND', httpStatus: 404, message: 'Owner risk profile not found.', userActionable: false },
  OWNER_RISK_CARD_NOT_FOUND: { code: 'OWNER_RISK.CARD.NOT_FOUND', httpStatus: 404, message: 'Owner risk card not found.', userActionable: false },
  OWNER_RISK_CARD_ALREADY_UNLOCKED: { code: 'OWNER_RISK.CARD.ALREADY_UNLOCKED', httpStatus: 409, message: 'Owner risk card is already unlocked.', userActionable: true },
  OWNER_RISK_REPORT_NOT_FOUND: { code: 'OWNER_RISK.REPORT.NOT_FOUND', httpStatus: 404, message: 'Owner risk report not found.', userActionable: false },
  OWNER_RISK_REVIEW_REQUEST_NOT_FOUND: { code: 'OWNER_RISK.REVIEW_REQUEST.NOT_FOUND', httpStatus: 404, message: 'Owner risk review request not found.', userActionable: false },
  OWNER_RISK_INSUFFICIENT_CREDITS: { code: 'OWNER_RISK.CREDIT.INSUFFICIENT', httpStatus: 422, message: 'Insufficient credits for this operation.', userActionable: true },
  OWNER_RISK_GENERATION_FAILED: { code: 'OWNER_RISK.GENERATION.FAILED', httpStatus: 500, message: 'Owner risk analysis generation failed.', userActionable: false },
  OWNER_RISK_CREDIT_DEDUCT_FAILED: { code: 'OWNER_RISK.CREDIT.DEDUCT_FAILED', httpStatus: 500, message: 'Credit deduction failed.', userActionable: false },
  OWNER_RISK_CREDIT_REFUND_FAILED: { code: 'OWNER_RISK.CREDIT.REFUND_FAILED', httpStatus: 500, message: 'Credit refund failed.', userActionable: false },

  // Market Situation Radar
  MARKET_SIGNAL_NOT_FOUND: { code: 'MARKET_SIGNAL.NOT_FOUND', httpStatus: 404, message: 'Market signal not found.', userActionable: false },
  MARKET_SIGNAL_ALREADY_UNLOCKED: { code: 'MARKET_SIGNAL.ALREADY_UNLOCKED', httpStatus: 409, message: 'Market signal is already unlocked.', userActionable: true },
  MARKET_SIGNAL_REPORT_NOT_FOUND: { code: 'MARKET_SIGNAL.REPORT.NOT_FOUND', httpStatus: 404, message: 'Market signal report not found.', userActionable: false },
  MARKET_SIGNAL_SIMULATION_NOT_FOUND: { code: 'MARKET_SIGNAL.SIMULATION.NOT_FOUND', httpStatus: 404, message: 'Market signal simulation not found.', userActionable: false },
  MARKET_SIGNAL_INSUFFICIENT_CREDITS: { code: 'MARKET_SIGNAL.CREDIT.INSUFFICIENT', httpStatus: 422, message: 'Insufficient credits for this operation.', userActionable: true },
  MARKET_SIGNAL_GENERATION_FAILED: { code: 'MARKET_SIGNAL.GENERATION.FAILED', httpStatus: 500, message: 'Market signal analysis generation failed.', userActionable: false },
  MARKET_SIGNAL_UNVERIFIED_SOURCE: { code: 'MARKET_SIGNAL.SOURCE.UNVERIFIED', httpStatus: 422, message: 'Market signal requires verified source.', userActionable: true },

  // Compliance
  COMPLIANCE_SENSITIVE_TERM_BLOCKED: { code: 'COMPLIANCE.SENSITIVE_TERM.BLOCKED', httpStatus: 422, message: 'Input contains sensitive terms that are not allowed.', userActionable: true },
  COMPLIANCE_RED_LINE_VIOLATION: { code: 'COMPLIANCE.RED_LINE.VIOLATION', httpStatus: 403, message: 'Request violates compliance red lines.', userActionable: false },
  COMPLIANCE_AUDIT_FLAGGED: { code: 'COMPLIANCE.AUDIT.FLAGGED', httpStatus: 422, message: 'AI output has been flagged for compliance review.', userActionable: false },
} as const satisfies Record<string, ErrorCodeDef>;

export type ErrorCodeKey = keyof typeof ErrorCodes;
export type ErrorCode = (typeof ErrorCodes)[ErrorCodeKey]['code'];
