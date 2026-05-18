import { ReputationEventType } from '@tongqian/types';

export const DEFAULT_REPUTATION_RULES = {
  initialScore: 500,
  minScore: 0,
  maxScore: 1000,
  monthlyRecoveryDelta: 20,
  customerPrepayRequiredBelow: 300,
  customerDispatchSuspendedBelow: 100,
  highQualityCustomerAtLeast: 800,
  eventDeltas: {
    [ReputationEventType.ORDER_COMPLETED]: 5,
    [ReputationEventType.CUSTOMER_FIVE_STAR]: 10,
    [ReputationEventType.CUSTOMER_LOW_RATING]: -20,
    [ReputationEventType.ON_TIME_DELIVERY]: 5,
    [ReputationEventType.LATE_DELIVERY]: -10,
    [ReputationEventType.SERVICE_REFUND]: -50,
    [ReputationEventType.COMPLAINT_CONFIRMED]: -50,
    [ReputationEventType.APPEAL_SUCCEEDED]: 20,
    [ReputationEventType.CASE_EXPERT_LIKED]: 30,
    [ReputationEventType.PROACTIVE_CONTACT_SUCCESS]: 10,
    [ReputationEventType.PRIVATE_DEAL_WARNING]: -200,
    [ReputationEventType.PRIVATE_DEAL_CONFIRMED]: -300,
    [ReputationEventType.TRAINING_COMPLETED]: 20,
    [ReputationEventType.MONTHLY_ACTIVITY_MET]: 20,
    [ReputationEventType.MONTHLY_ACTIVITY_MISSED]: -30,
    [ReputationEventType.PREMIUM_REFERRAL_ACCEPTED]: 100,
  },
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'reputation.rules',
      value: DEFAULT_REPUTATION_RULES,
      description: 'Default agent and customer reputation scoring rules.',
      isOverridable: true,
    },
  ] as const;
}
