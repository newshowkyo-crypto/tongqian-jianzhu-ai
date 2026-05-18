import type { EntityId, TenantId, UserId } from '../common/protocol.js';

export enum ReputationSubjectType {
  AGENT = 'agent',
  CUSTOMER_TENANT = 'customer_tenant',
  PARTNER = 'partner',
}

export enum ReputationLevel {
  LV1 = 'LV1',
  LV2 = 'LV2',
  LV3 = 'LV3',
  LV4 = 'LV4',
  LV5 = 'LV5',
}

export enum ReputationEventType {
  ORDER_COMPLETED = 'order_completed',
  CUSTOMER_FIVE_STAR = 'customer_five_star',
  CUSTOMER_LOW_RATING = 'customer_low_rating',
  ON_TIME_DELIVERY = 'on_time_delivery',
  LATE_DELIVERY = 'late_delivery',
  SERVICE_REFUND = 'service_refund',
  COMPLAINT_OPENED = 'complaint_opened',
  COMPLAINT_CONFIRMED = 'complaint_confirmed',
  COMPLAINT_REJECTED = 'complaint_rejected',
  APPEAL_SUCCEEDED = 'appeal_succeeded',
  APPEAL_FAILED = 'appeal_failed',
  CASE_APPROVED = 'case_approved',
  CASE_EXPERT_LIKED = 'case_expert_liked',
  CASE_PLAGIARISM_CONFIRMED = 'case_plagiarism_confirmed',
  PROACTIVE_CONTACT_SUCCESS = 'proactive_contact_success',
  CUSTOMER_PREPAY_REQUIRED = 'customer_prepay_required',
  CUSTOMER_PAYMENT_OVERDUE = 'customer_payment_overdue',
  CUSTOMER_ORDER_CANCELED = 'customer_order_canceled',
  CUSTOMER_HIGH_QUALITY = 'customer_high_quality',
  PRIVATE_DEAL_WARNING = 'private_deal_warning',
  PRIVATE_DEAL_CONFIRMED = 'private_deal_confirmed',
  BLACK_MARKET_REPORT_CONFIRMED = 'black_market_report_confirmed',
  DUPLICATE_ACCOUNT_CONFIRMED = 'duplicate_account_confirmed',
  TRAINING_COMPLETED = 'training_completed',
  MONTHLY_ACTIVITY_MET = 'monthly_activity_met',
  MONTHLY_ACTIVITY_MISSED = 'monthly_activity_missed',
  FIRST_ORDER_PROTECTION = 'first_order_protection',
  LV1_RESTART_ORDER_COMPLETED = 'lv1_restart_order_completed',
  PLATFORM_MANUAL_ADJUSTMENT = 'platform_manual_adjustment',
  RISK_CONTROL_PENALTY = 'risk_control_penalty',
  WITHDRAWAL_REVIEW_DELAY = 'withdrawal_review_delay',
  PREMIUM_REFERRAL_ACCEPTED = 'premium_referral_accepted',
}

export interface ReputationScore {
  subjectType: ReputationSubjectType;
  subjectId: EntityId;
  tenantId?: TenantId;
  userId?: UserId;
  score: number;
  level: ReputationLevel;
  updatedAt: string;
}

export interface ReputationLevelRule {
  level: ReputationLevel;
  minScore: number;
  maxScore: number;
  dispatchWeight: number;
  maxReferralRatePercent: number;
  withdrawalDelayDays: number;
}

export interface ReputationEventLog {
  id: EntityId;
  subjectType: ReputationSubjectType;
  subjectId: EntityId;
  eventType: ReputationEventType;
  delta: number;
  reason: string;
  appealableUntil?: string;
  createdAt: string;
}

export const REPUTATION_LEVEL_RULES: readonly ReputationLevelRule[] = [
  { level: ReputationLevel.LV1, minScore: 0, maxScore: 499, dispatchWeight: 1, maxReferralRatePercent: 10, withdrawalDelayDays: 30 },
  { level: ReputationLevel.LV2, minScore: 500, maxScore: 699, dispatchWeight: 5, maxReferralRatePercent: 12, withdrawalDelayDays: 15 },
  { level: ReputationLevel.LV3, minScore: 700, maxScore: 849, dispatchWeight: 10, maxReferralRatePercent: 15, withdrawalDelayDays: 7 },
  { level: ReputationLevel.LV4, minScore: 850, maxScore: 949, dispatchWeight: 15, maxReferralRatePercent: 18, withdrawalDelayDays: 3 },
  { level: ReputationLevel.LV5, minScore: 950, maxScore: 1000, dispatchWeight: 20, maxReferralRatePercent: 20, withdrawalDelayDays: 0 },
];

export const REPUTATION_SUBJECT_TYPE_VALUES = Object.values(ReputationSubjectType);
export const REPUTATION_LEVEL_VALUES = Object.values(ReputationLevel);
export const REPUTATION_EVENT_TYPE_VALUES = Object.values(ReputationEventType);

export type ReputationSubjectTypeValue = `${ReputationSubjectType}`;
export type ReputationLevelValue = `${ReputationLevel}`;
export type ReputationEventTypeValue = `${ReputationEventType}`;
