export const PermissionPoints = {
  CONTRACT_VIEW: 'contract:view',
  CONTRACT_CREATE: 'contract:create',
  CONTRACT_UPDATE: 'contract:update',
  CONTRACT_DELETE: 'contract:delete',
  CONTRACT_APPROVE: 'contract:approve',
  CONTRACT_REVIEW: 'contract:review',
  CONTRACT_EXPORT: 'contract:export',

  SUBSCRIPTION_VIEW: 'subscription:view',
  SUBSCRIPTION_UPGRADE: 'subscription:upgrade',
  SUBSCRIPTION_CANCEL: 'subscription:cancel',
  SUBSCRIPTION_REACTIVATE: 'subscription:reactivate',
  SUBSCRIPTION_INVOICE_VIEW: 'subscription-invoice:view',

  CREDIT_VIEW: 'credit:view',
  CREDIT_TOP_UP: 'credit:top-up',
  CREDIT_GIFT: 'credit:gift',
  CREDIT_REFUND: 'credit:refund',

  DISPATCH_VIEW: 'dispatch:view',
  DISPATCH_CREATE: 'dispatch:create',
  DISPATCH_ACCEPT: 'dispatch:accept',
  DISPATCH_QUOTE: 'dispatch:quote',
  DISPATCH_ASSIGN: 'dispatch:assign',
  DISPATCH_TAKEOVER: 'dispatch:takeover',

  DATA_EXPORT_TRIGGER: 'data-export:trigger',
  DATA_EXPORT_APPROVE: 'data-export:approve',
  DATA_EXPORT_DOWNLOAD: 'data-export:download',

  WITHDRAWAL_REQUEST: 'withdrawal:request',
  WITHDRAWAL_APPROVE: 'withdrawal:approve',
  WITHDRAWAL_REJECT: 'withdrawal:reject',

  APPEAL_CREATE: 'appeal:create',
  APPEAL_DECIDE_INITIAL: 'appeal:decide:initial',
  APPEAL_DECIDE_RISK: 'appeal:decide:risk',
  APPEAL_DECIDE_FINAL: 'appeal:decide:final',

  PROMPT_VIEW: 'prompt:view',
  PROMPT_EDIT: 'prompt:edit',
  MODEL_ROUTE_VIEW: 'model-route:view',
  MODEL_ROUTE_EDIT: 'model-route:edit',
  RULE_VIEW: 'rule:view',
  RULE_REVIEW: 'rule:review',
  REPUTATION_VIEW: 'reputation:view',
  REPUTATION_ADJUST: 'reputation:adjust',
  SYSTEM_CONFIG_VIEW: 'system-config:view',
  SYSTEM_CONFIG_EDIT: 'system-config:edit',
  TENANT_REVIEW: 'tenant:review',
  AUDIT_LOG_VIEW: 'audit-log:view',
  ADMIN_INGEST_RUN: 'admin:ingest:run',

  // Owner Risk Radar
  OWNER_RISK_VIEW: 'owner-risk:view',
  OWNER_RISK_CREATE: 'owner-risk:create',
  OWNER_RISK_ANALYZE: 'owner-risk:analyze',
  OWNER_RISK_UNLOCK: 'owner-risk:unlock',
  OWNER_RISK_EXPORT: 'owner-risk:export',
  OWNER_RISK_SUBMIT_REVIEW: 'owner-risk:submit-review',
  OWNER_RISK_ADMIN_MANAGE: 'owner-risk:admin-manage',

  // Market Situation Radar
  MARKET_SITUATION_VIEW: 'market-situation:view',
  MARKET_SITUATION_UNLOCK: 'market-situation:unlock',
  MARKET_SITUATION_SIMULATE: 'market-situation:simulate',
  MARKET_SITUATION_CREATE_REPORT: 'market-situation:create-report',
  MARKET_SITUATION_ADMIN_MANAGE: 'market-situation:admin-manage',
} as const;

export type PermissionPointKey = keyof typeof PermissionPoints;
export type PermissionPoint = (typeof PermissionPoints)[PermissionPointKey];

export const PERMISSION_POINT_VALUES = Object.values(PermissionPoints);
