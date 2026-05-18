export enum TenantType {
  BUILDING_COMPANY = 'BUILDING_COMPANY',
  GOV_SOE = 'GOV_SOE',
  AGENT_ORG = 'AGENT_ORG',
  PLATFORM = 'PLATFORM',
}

export enum TenantStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface Tenant {
  id: string;
  type: TenantType;
  status: TenantStatus;
  name: string;
  unifiedSocialCreditCode?: string;
  parentTenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export const TENANT_TYPE_VALUES = Object.values(TenantType);
export const TENANT_STATUS_VALUES = Object.values(TenantStatus);

export type TenantTypeValue = `${TenantType}`;
export type TenantStatusValue = `${TenantStatus}`;
