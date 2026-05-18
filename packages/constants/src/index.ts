import { seedSystemConfigs as seedCommissionRateConfigs } from './commission-rates.js';
import { seedSystemConfigs as seedCreditPricingConfigs } from './credit-pricing.js';
import { seedSystemConfigs as seedDiscountLadderConfigs } from './discount-ladders.js';
import { seedSystemConfigs as seedDispatchRateConfigs } from './dispatch-rates.js';
import { seedSystemConfigs as seedDispatchThresholdConfigs } from './dispatch-thresholds.js';
import { seedSystemConfigs as seedDispatchWeightConfigs } from './dispatch-weights.js';
import { seedSystemConfigs as seedPremiumServiceConfigs } from './premium-services.js';
import { seedSystemConfigs as seedRedLineConfigs } from './red-lines.js';
import { seedSystemConfigs as seedReferralFeeRateConfigs } from './referral-fee-rates.js';
import { seedSystemConfigs as seedReputationLevelConfigs } from './reputation-levels.js';
import { seedSystemConfigs as seedReputationRuleConfigs } from './reputation-rules.js';
import { seedSystemConfigs as seedSubscriptionPlanConfigs } from './subscription-plans.js';
import { seedSystemConfigs as seedTakeoverTriggerConfigs } from './takeover-triggers.js';
import { seedSystemConfigs as seedTierThresholdConfigs } from './tier-thresholds.js';

export { DEFAULT_AI_RATE_LIMITS } from './ai-rate-limits.js';
export { AGENT_ACTIVITY_THRESHOLDS } from './agent-activity-thresholds.js';
export { AGENT_REFERRAL_BONUS } from './agent-referral-bonus.js';
export { DEFAULT_CACHE_TTL_SECONDS } from './cache-ttl.js';
export { CHECKIN_REWARDS } from './checkin-rewards.js';
export { COST_FLOOR } from './cost-floor.js';
export { CURRENCY_DISPLAY } from './currency-display.js';
export { FISSION_RATES } from './fission-rates.js';
export { LOTTERY_SCHEDULE } from './lottery-schedule.js';
export { DEFAULT_RATE_LIMITS } from './rate-limits.js';
export { REACTIVATION_WINDOW } from './reactivation-window.js';
export { REFUND_POLICY } from './refund-policy.js';
export { REFUND_TIERS } from './refund-tiers.js';
export { URGENCY_LIMITS } from './urgency-limits.js';

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
  DEFAULT_REPUTATION_RULES,
  seedSystemConfigs as seedReputationRuleConfigs,
} from './reputation-rules.js';
export {
  DEFAULT_REPUTATION_LEVELS,
  seedSystemConfigs as seedReputationLevelConfigs,
} from './reputation-levels.js';
export {
  DEFAULT_DISPATCH_WEIGHTS,
  seedSystemConfigs as seedDispatchWeightConfigs,
} from './dispatch-weights.js';
export {
  DEFAULT_RED_LINES,
  seedSystemConfigs as seedRedLineConfigs,
} from './red-lines.js';
export {
  DEFAULT_TAKEOVER_TRIGGERS,
  seedSystemConfigs as seedTakeoverTriggerConfigs,
} from './takeover-triggers.js';
export {
  DEFAULT_PREMIUM_SERVICES,
  seedSystemConfigs as seedPremiumServiceConfigs,
} from './premium-services.js';
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
    ...seedReputationRuleConfigs(),
    ...seedReputationLevelConfigs(),
    ...seedDispatchWeightConfigs(),
    ...seedRedLineConfigs(),
    ...seedTakeoverTriggerConfigs(),
    ...seedPremiumServiceConfigs(),
    ...seedTierThresholdConfigs(),
  ] as const;
}
