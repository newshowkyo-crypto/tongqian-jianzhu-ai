export enum UserRole {
  BUILDING_COMPANY = 'BUILDING_COMPANY',
  GOV_SOE = 'GOV_SOE',
  AGENT = 'AGENT',
  PLATFORM = 'PLATFORM',
}

export enum PlatformRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  OPS_MANAGER = 'OPS_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  CUSTOMER_SUCCESS = 'CUSTOMER_SUCCESS',
  QUALITY_AUDITOR = 'QUALITY_AUDITOR',
  INDUSTRY_EXPERT = 'INDUSTRY_EXPERT',
  CONSULTANT = 'CONSULTANT',
  SECURITY_AUDITOR = 'SECURITY_AUDITOR',
}

export enum AgentSubtype {
  AGENT_QUAL = 'AGENT_QUAL',
  AGENT_TENDER = 'AGENT_TENDER',
  AGENT_FINANCE = 'AGENT_FINANCE',
  AGENT_GENERAL = 'AGENT_GENERAL',
}

export const USER_ROLE_VALUES = Object.values(UserRole);
export const PLATFORM_ROLE_VALUES = Object.values(PlatformRole);
export const AGENT_SUBTYPE_VALUES = Object.values(AgentSubtype);

export type UserRoleValue = `${UserRole}`;
export type PlatformRoleValue = `${PlatformRole}`;
export type AgentSubtypeValue = `${AgentSubtype}`;
