import type { SubStatus } from './subscription-types.js';

export type SubscriptionEvent =
  | 'auto_renewal_failed_three_times'
  | 'first_payment_succeeded'
  | 'manual_renewal_succeeded'
  | 'past_due_grace_period_ended'
  | 'reactivation_window_ended'
  | 'resubscribe_within_reactivation_window';

const TRANSITIONS: Readonly<Record<SubStatus, Partial<Record<SubscriptionEvent, SubStatus>>>> = {
  active: { auto_renewal_failed_three_times: 'past_due' },
  canceled: { reactivation_window_ended: 'expired', resubscribe_within_reactivation_window: 'active' },
  expired: {},
  past_due: { manual_renewal_succeeded: 'active', past_due_grace_period_ended: 'canceled' },
  trial: { first_payment_succeeded: 'active' },
};

export function transitionSubscriptionStatus(status: SubStatus, event: SubscriptionEvent): SubStatus {
  const next = TRANSITIONS[status][event];
  if (!next) throw new Error('SUB.STATUS.INVALID_TRANSITION');
  return next;
}
