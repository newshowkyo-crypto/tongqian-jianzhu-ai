import { SubscriptionPlanCode, type SubscriptionPlan } from '@tongqian/types';

export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    code: SubscriptionPlanCode.TRIAL,
    displayName: 'Trial',
    monthlyPriceCny: 0,
    limits: { monthlyCredits: 500, maxProjects: 1, maxUsers: 1, tierAccess: [1] },
    features: {
      killerAppsTrialOnly: true,
      coBranding: false,
      projectTeamTools: false,
      exclusiveConsultant: false,
      flagshipBranding: false,
      priorityConsulting: false,
    },
    isSystemDefault: true,
    isActive: true,
  },
  {
    code: SubscriptionPlanCode.LITE,
    displayName: 'Lite',
    monthlyPriceCny: 39,
    limits: { monthlyCredits: 500, maxProjects: 3, maxUsers: 3, tierAccess: [1] },
    features: {
      killerAppsTrialOnly: false,
      coBranding: false,
      projectTeamTools: false,
      exclusiveConsultant: false,
      flagshipBranding: false,
      priorityConsulting: false,
    },
    isSystemDefault: true,
    isActive: true,
  },
  {
    code: SubscriptionPlanCode.STANDARD,
    displayName: 'Standard',
    monthlyPriceCny: 199,
    limits: { monthlyCredits: 2500, maxProjects: 20, maxUsers: 20, tierAccess: [1, 2] },
    features: {
      killerAppsTrialOnly: false,
      coBranding: false,
      projectTeamTools: false,
      exclusiveConsultant: false,
      flagshipBranding: false,
      priorityConsulting: false,
    },
    isSystemDefault: true,
    isActive: true,
  },
  {
    code: SubscriptionPlanCode.ENTERPRISE,
    displayName: 'Enterprise',
    monthlyPriceCny: 499,
    limits: { monthlyCredits: 7000, maxProjects: 100, maxUsers: 100, tierAccess: [1, 2, 3] },
    features: {
      killerAppsTrialOnly: false,
      coBranding: true,
      projectTeamTools: true,
      exclusiveConsultant: false,
      flagshipBranding: false,
      priorityConsulting: false,
    },
    isSystemDefault: true,
    isActive: true,
  },
  {
    code: SubscriptionPlanCode.FLAGSHIP,
    displayName: 'Flagship',
    monthlyPriceCny: 999,
    limits: { monthlyCredits: 15000, maxProjects: undefined, maxUsers: undefined, tierAccess: [1, 2, 3, 4] },
    features: {
      killerAppsTrialOnly: false,
      coBranding: true,
      projectTeamTools: true,
      exclusiveConsultant: true,
      flagshipBranding: true,
      priorityConsulting: true,
    },
    isSystemDefault: true,
    isActive: true,
  },
] as const satisfies readonly SubscriptionPlan[];

export function seedSystemConfigs() {
  return [
    {
      key: 'subscription.plans.v1',
      value: DEFAULT_SUBSCRIPTION_PLANS,
      description: 'Default 5-tier subscription plans.',
      isOverridable: true,
    },
  ] as const;
}
