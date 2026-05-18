import { seedSystemConfigs as seedCommissionRateConfigs } from './commission-rates.js';
import { seedSystemConfigs as seedCreditPricingConfigs } from './credit-pricing.js';
import { seedSystemConfigs as seedDiscountLadderConfigs } from './discount-ladders.js';
import { seedSystemConfigs as seedDispatchRateConfigs } from './dispatch-rates.js';
import { seedSystemConfigs as seedDispatchThresholdConfigs } from './dispatch-thresholds.js';
import { seedSystemConfigs as seedReferralFeeRateConfigs } from './referral-fee-rates.js';
import { seedSystemConfigs as seedSubscriptionPlanConfigs } from './subscription-plans.js';
import { seedSystemConfigs as seedTierThresholdConfigs } from './tier-thresholds.js';

export {
  DEFAULT_SUBSCRIPTION_PLANS,
  seedSystemConfigs as seedSubscriptionPlanConfigs,
} from './subscription-plans.js';
export {
  DEFAULT_DISCOUNT_LADDERS,
  seedSystemConfigs as seedDiscountLadderConfigs,
} from './discount-ladders.js';
export {
  CREDIT_EXCHANGE_RATE,
  DEFAULT_CREDIT_PACKAGES,
  DEFAULT_CREDIT_PRICING,
  seedSystemConfigs as seedCreditPricingConfigs,
} from './credit-pricing.js';
export {
  DEFAULT_COMMISSION_RATES,
  seedSystemConfigs as seedCommissionRateConfigs,
} from './commission-rates.js';
export {
  DEFAULT_DISPATCH_THRESHOLDS,
  seedSystemConfigs as seedDispatchThresholdConfigs,
} from './dispatch-thresholds.js';
export {
  DEFAULT_DISPATCH_RATES,
  seedSystemConfigs as seedDispatchRateConfigs,
} from './dispatch-rates.js';
export {
  DEFAULT_REFERRAL_FEE_RATES,
  seedSystemConfigs as seedReferralFeeRateConfigs,
} from './referral-fee-rates.js';
export {
  DEFAULT_TIER_THRESHOLDS,
  seedSystemConfigs as seedTierThresholdConfigs,
} from './tier-thresholds.js';

export function seedSystemConfigs() {
  return [
    ...seedSubscriptionPlanConfigs(),
    ...seedDiscountLadderConfigs(),
    ...seedCreditPricingConfigs(),
    ...seedCommissionRateConfigs(),
    ...seedDispatchThresholdConfigs(),
    ...seedDispatchRateConfigs(),
    ...seedReferralFeeRateConfigs(),
    ...seedTierThresholdConfigs(),
  ] as const;
}
