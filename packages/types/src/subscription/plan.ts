export enum SubscriptionPlanCode {
  TRIAL = 'trial',
  LITE = 'lite',
  STANDARD = 'std',
  ENTERPRISE = 'ent',
  FLAGSHIP = 'flag',
}

export enum SubscriptionBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  PREPAID = 'prepaid',
}

export interface SubscriptionPlanLimits {
  monthlyCredits: number;
  maxProjects?: number;
  maxUsers?: number;
  maxAgentClients?: number;
  tierAccess: readonly number[];
}

export interface SubscriptionPlanFeatureFlags {
  killerAppsTrialOnly: boolean;
  coBranding: boolean;
  projectTeamTools: boolean;
  exclusiveConsultant: boolean;
  flagshipBranding: boolean;
  priorityConsulting: boolean;
}

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  displayName: string;
  monthlyPriceCny: number;
  yearlyPriceCny?: number;
  limits: SubscriptionPlanLimits;
  features: SubscriptionPlanFeatureFlags;
  isSystemDefault: boolean;
  isActive: boolean;
}

export const SUBSCRIPTION_PLAN_CODE_VALUES = Object.values(SubscriptionPlanCode);
export const SUBSCRIPTION_BILLING_CYCLE_VALUES = Object.values(SubscriptionBillingCycle);

export type SubscriptionPlanCodeValue = `${SubscriptionPlanCode}`;
export type SubscriptionBillingCycleValue = `${SubscriptionBillingCycle}`;
