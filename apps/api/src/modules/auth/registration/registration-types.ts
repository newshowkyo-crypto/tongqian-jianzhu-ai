export type RegistrationRole = 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM';

export interface RegistrationInput {
  agentSubtype?: string;
  domain?: string;
  name: string;
  phone: string;
  ref?: string;
  role: RegistrationRole;
  smsCode?: string;
  socialCreditCode?: string;
  unionId?: string;
}

export interface RegistrationResult {
  approvalRequired: boolean;
  defaultDashboard: string;
  status: 'active' | 'pending_review' | 'training';
  tenantId: string;
  userId: string;
}
