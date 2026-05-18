export enum CreditSourceType {
  SUBSCRIPTION = 'subscription',
  TOP_UP = 'top_up',
  GIFT = 'gift',
  AI_FAILURE_REFUND = 'ai_failure_refund',
}

export enum CreditExpiryPolicy {
  CURRENT_MONTH = 'current_month',
  NEVER = 'never',
  DAYS_90 = 'days_90',
  RESTORE_ORIGINAL_LOT = 'restore_original_lot',
}

export interface CreditExpiryRule {
  sourceType: CreditSourceType;
  policy: CreditExpiryPolicy;
  defaultValidityDays?: number;
  carriesOver: boolean;
  refundRestoresOriginalLot: boolean;
}

export const CREDIT_EXPIRY_RULES: readonly CreditExpiryRule[] = [
  {
    sourceType: CreditSourceType.SUBSCRIPTION,
    policy: CreditExpiryPolicy.CURRENT_MONTH,
    carriesOver: false,
    refundRestoresOriginalLot: false,
  },
  {
    sourceType: CreditSourceType.TOP_UP,
    policy: CreditExpiryPolicy.NEVER,
    carriesOver: true,
    refundRestoresOriginalLot: false,
  },
  {
    sourceType: CreditSourceType.GIFT,
    policy: CreditExpiryPolicy.DAYS_90,
    defaultValidityDays: 90,
    carriesOver: true,
    refundRestoresOriginalLot: false,
  },
  {
    sourceType: CreditSourceType.AI_FAILURE_REFUND,
    policy: CreditExpiryPolicy.RESTORE_ORIGINAL_LOT,
    carriesOver: true,
    refundRestoresOriginalLot: true,
  },
];

export const CREDIT_SOURCE_TYPE_VALUES = Object.values(CreditSourceType);
export const CREDIT_EXPIRY_POLICY_VALUES = Object.values(CreditExpiryPolicy);

export type CreditSourceTypeValue = `${CreditSourceType}`;
export type CreditExpiryPolicyValue = `${CreditExpiryPolicy}`;
