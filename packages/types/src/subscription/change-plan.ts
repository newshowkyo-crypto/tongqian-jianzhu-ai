import type { MoneyAmount } from '../common/protocol.js';

import type { SubscriptionBillingCycle, SubscriptionPlanCode } from './plan.js';

export enum SubscriptionPlanChangeType {
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  CANCEL = 'cancel',
  RESUBSCRIBE = 'resubscribe',
}

export enum SubscriptionPlanChangeEffectiveAt {
  IMMEDIATE = 'immediate',
  NEXT_BILLING_CYCLE = 'next_billing_cycle',
}

export interface SubscriptionPlanChangeRequest {
  subscriptionId: string;
  fromPlan: SubscriptionPlanCode;
  toPlan?: SubscriptionPlanCode;
  type: SubscriptionPlanChangeType;
  billingCycle: SubscriptionBillingCycle;
  requestedByUserId: string;
  idempotencyKey: string;
  requestedAt: string;
  reason?: string;
}

export interface SubscriptionPlanChangeQuote {
  type: SubscriptionPlanChangeType;
  effectiveAt: SubscriptionPlanChangeEffectiveAt;
  proratedCharge?: MoneyAmount;
  unusedCreditOffset?: MoneyAmount;
  nextBillingAt?: string;
  creditReactivationAllowedUntil?: string;
}

export const SUBSCRIPTION_PLAN_CHANGE_TYPE_VALUES = Object.values(SubscriptionPlanChangeType);
export const SUBSCRIPTION_PLAN_CHANGE_EFFECTIVE_AT_VALUES = Object.values(SubscriptionPlanChangeEffectiveAt);

export type SubscriptionPlanChangeTypeValue = `${SubscriptionPlanChangeType}`;
export type SubscriptionPlanChangeEffectiveAtValue = `${SubscriptionPlanChangeEffectiveAt}`;
