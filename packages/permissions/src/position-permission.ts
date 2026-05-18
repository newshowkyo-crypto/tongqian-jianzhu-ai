import { PermissionPoints, type PermissionPoint } from './permission-points.js';
import { PositionTag } from './position-tags.js';

export type PositionPermissionSubject = PositionTag | string;

export const POSITION_PERMISSIONS: Readonly<Record<string, readonly PermissionPoint[]>> = {
  [PositionTag.OWNER]: [
    PermissionPoints.CONTRACT_APPROVE,
    PermissionPoints.SUBSCRIPTION_CANCEL,
    PermissionPoints.DATA_EXPORT_APPROVE,
    PermissionPoints.WITHDRAWAL_APPROVE,
  ],
  [PositionTag.GENERAL_MANAGER]: [
    PermissionPoints.CONTRACT_APPROVE,
    PermissionPoints.SUBSCRIPTION_UPGRADE,
    PermissionPoints.DISPATCH_CREATE,
  ],
  [PositionTag.FINANCE_DIRECTOR]: [
    PermissionPoints.CREDIT_VIEW,
    PermissionPoints.CREDIT_TOP_UP,
    PermissionPoints.CREDIT_REFUND,
    PermissionPoints.SUBSCRIPTION_INVOICE_VIEW,
  ],
  [PositionTag.CONTRACT_MANAGER]: [
    PermissionPoints.CONTRACT_CREATE,
    PermissionPoints.CONTRACT_UPDATE,
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.CONTRACT_EXPORT,
  ],
  [PositionTag.LEGAL_MANAGER]: [
    PermissionPoints.CONTRACT_REVIEW,
    PermissionPoints.CONTRACT_APPROVE,
    PermissionPoints.DATA_EXPORT_APPROVE,
  ],
  [PositionTag.TENDER_MANAGER]: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_CREATE,
    PermissionPoints.DISPATCH_CREATE,
  ],
  [PositionTag.PROJECT_MANAGER]: [
    PermissionPoints.CONTRACT_VIEW,
    PermissionPoints.CONTRACT_UPDATE,
    PermissionPoints.DISPATCH_VIEW,
  ],
  [PositionTag.ACCOUNTANT]: [
    PermissionPoints.CREDIT_VIEW,
    PermissionPoints.SUBSCRIPTION_INVOICE_VIEW,
  ],
};

export function getPositionPermissions(positionTag: PositionPermissionSubject): readonly PermissionPoint[] {
  return POSITION_PERMISSIONS[String(positionTag)] ?? [];
}
