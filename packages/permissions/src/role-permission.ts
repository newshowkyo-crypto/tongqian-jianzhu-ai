import { PermissionPoints, type PermissionPoint } from './permission-points.js';
import { PlatformRole } from './platform-roles.js';
import { UserRole } from './roles.js';

export type RolePermissionSubject = UserRole | PlatformRole | string;

export const ROLE_PERMISSIONS: Readonly<Record<string, readonly PermissionPoint[]>> = {
  [UserRole.BUILDING_COMPANY]: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_CREATE,
    PermissionPoints.CONTRACT_UPDATE,
    PermissionPoints.SUBSCRIPTION_VIEW,
    PermissionPoints.SUBSCRIPTION_UPGRADE,
    PermissionPoints.CREDIT_VIEW,
    PermissionPoints.CREDIT_TOP_UP,
    PermissionPoints.DISPATCH_VIEW,
    PermissionPoints.DATA_EXPORT_TRIGGER,
    PermissionPoints.APPEAL_CREATE,
    PermissionPoints.OWNER_RISK_VIEW,
    PermissionPoints.OWNER_RISK_CREATE,
    PermissionPoints.OWNER_RISK_ANALYZE,
    PermissionPoints.OWNER_RISK_UNLOCK,
    PermissionPoints.OWNER_RISK_EXPORT,
    PermissionPoints.OWNER_RISK_SUBMIT_REVIEW,
    PermissionPoints.MARKET_SITUATION_VIEW,
    PermissionPoints.MARKET_SITUATION_UNLOCK,
    PermissionPoints.MARKET_SITUATION_SIMULATE,
    PermissionPoints.MARKET_SITUATION_CREATE_REPORT,
  ],
  BUILDING_COMPANY_USER: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_CREATE,
    PermissionPoints.CONTRACT_UPDATE,
    PermissionPoints.SUBSCRIPTION_VIEW,
    PermissionPoints.SUBSCRIPTION_UPGRADE,
    PermissionPoints.CREDIT_VIEW,
    PermissionPoints.CREDIT_TOP_UP,
    PermissionPoints.DISPATCH_VIEW,
    PermissionPoints.DATA_EXPORT_TRIGGER,
    PermissionPoints.APPEAL_CREATE,
    PermissionPoints.OWNER_RISK_VIEW,
    PermissionPoints.OWNER_RISK_CREATE,
    PermissionPoints.OWNER_RISK_ANALYZE,
    PermissionPoints.OWNER_RISK_UNLOCK,
    PermissionPoints.OWNER_RISK_EXPORT,
    PermissionPoints.OWNER_RISK_SUBMIT_REVIEW,
    PermissionPoints.MARKET_SITUATION_VIEW,
    PermissionPoints.MARKET_SITUATION_UNLOCK,
    PermissionPoints.MARKET_SITUATION_SIMULATE,
    PermissionPoints.MARKET_SITUATION_CREATE_REPORT,
  ],
  [UserRole.GOV_SOE]: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.DATA_EXPORT_TRIGGER,
    PermissionPoints.PROMPT_VIEW,
    PermissionPoints.RULE_VIEW,
  ],
  GOV_USER: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.DATA_EXPORT_TRIGGER,
    PermissionPoints.PROMPT_VIEW,
    PermissionPoints.RULE_VIEW,
  ],
  [UserRole.AGENT]: [
    PermissionPoints.DISPATCH_VIEW,
    PermissionPoints.DISPATCH_ACCEPT,
    PermissionPoints.DISPATCH_QUOTE,
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.APPEAL_CREATE,
    PermissionPoints.REPUTATION_VIEW,
  ],
  [UserRole.PLATFORM]: [
    PermissionPoints.TENANT_REVIEW,
    PermissionPoints.AUDIT_LOG_VIEW,
    PermissionPoints.SYSTEM_CONFIG_VIEW,
  ],
  [PlatformRole.PLATFORM_OWNER]: Object.values(PermissionPoints),
  [PlatformRole.OPS_MANAGER]: [
    PermissionPoints.TENANT_REVIEW,
    PermissionPoints.DISPATCH_ASSIGN,
    PermissionPoints.DISPATCH_TAKEOVER,
    PermissionPoints.SYSTEM_CONFIG_VIEW,
    PermissionPoints.AUDIT_LOG_VIEW,
    PermissionPoints.OWNER_RISK_ADMIN_MANAGE,
    PermissionPoints.MARKET_SITUATION_ADMIN_MANAGE,
  ],
  [PlatformRole.FINANCE_MANAGER]: [
    PermissionPoints.SUBSCRIPTION_INVOICE_VIEW,
    PermissionPoints.CREDIT_REFUND,
    PermissionPoints.WITHDRAWAL_APPROVE,
    PermissionPoints.WITHDRAWAL_REJECT,
    PermissionPoints.AUDIT_LOG_VIEW,
  ],
  [PlatformRole.CUSTOMER_SUCCESS]: [
    PermissionPoints.TENANT_REVIEW,
    PermissionPoints.DISPATCH_VIEW,
    PermissionPoints.APPEAL_DECIDE_INITIAL,
    PermissionPoints.REPUTATION_VIEW,
  ],
  [PlatformRole.QUALITY_AUDITOR]: [
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.RULE_REVIEW,
    PermissionPoints.APPEAL_DECIDE_RISK,
    PermissionPoints.REPUTATION_ADJUST,
  ],
  [PlatformRole.INDUSTRY_EXPERT]: [
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.RULE_REVIEW,
    PermissionPoints.PROMPT_VIEW,
  ],
  [PlatformRole.CONSULTANT]: [
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.PROMPT_VIEW,
    PermissionPoints.RULE_VIEW,
  ],
  [PlatformRole.SECURITY_AUDITOR]: [
    PermissionPoints.DATA_EXPORT_APPROVE,
    PermissionPoints.DATA_EXPORT_DOWNLOAD,
    PermissionPoints.AUDIT_LOG_VIEW,
    PermissionPoints.SYSTEM_CONFIG_VIEW,
  ],
} as const;

export function getRolePermissions(role: RolePermissionSubject): readonly PermissionPoint[] {
  return ROLE_PERMISSIONS[String(role)] ?? [];
}
