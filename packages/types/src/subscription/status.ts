export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export enum SubscriptionStatusEvent {
  FIRST_PAYMENT_SUCCEEDED = 'first_payment_succeeded',
  AUTO_RENEWAL_FAILED_THREE_TIMES = 'auto_renewal_failed_three_times',
  MANUAL_RENEWAL_SUCCEEDED = 'manual_renewal_succeeded',
  PAST_DUE_GRACE_PERIOD_ENDED = 'past_due_grace_period_ended',
  RESUBSCRIBE_WITHIN_REACTIVATION_WINDOW = 'resubscribe_within_reactivation_window',
  REACTIVATION_WINDOW_ENDED = 'reactivation_window_ended',
}

export interface SubscriptionStatusTransition {
  from: SubscriptionStatus;
  to: SubscriptionStatus;
  event: SubscriptionStatusEvent;
  maxDaysSinceStatusChange?: number;
  note: string;
}

export const SUBSCRIPTION_STATUS_TRANSITIONS: readonly SubscriptionStatusTransition[] = [
  {
    from: SubscriptionStatus.TRIAL,
    to: SubscriptionStatus.ACTIVE,
    event: SubscriptionStatusEvent.FIRST_PAYMENT_SUCCEEDED,
    note: 'First paid subscription starts.',
  },
  {
    from: SubscriptionStatus.ACTIVE,
    to: SubscriptionStatus.PAST_DUE,
    event: SubscriptionStatusEvent.AUTO_RENEWAL_FAILED_THREE_TIMES,
    note: 'Auto-renewal failed after three retries.',
  },
  {
    from: SubscriptionStatus.PAST_DUE,
    to: SubscriptionStatus.ACTIVE,
    event: SubscriptionStatusEvent.MANUAL_RENEWAL_SUCCEEDED,
    maxDaysSinceStatusChange: 7,
    note: 'Manual renewal succeeds within the first grace window.',
  },
  {
    from: SubscriptionStatus.PAST_DUE,
    to: SubscriptionStatus.CANCELED,
    event: SubscriptionStatusEvent.PAST_DUE_GRACE_PERIOD_ENDED,
    maxDaysSinceStatusChange: 30,
    note: 'Past due remains unresolved for 30 days.',
  },
  {
    from: SubscriptionStatus.CANCELED,
    to: SubscriptionStatus.ACTIVE,
    event: SubscriptionStatusEvent.RESUBSCRIBE_WITHIN_REACTIVATION_WINDOW,
    maxDaysSinceStatusChange: 30,
    note: 'Canceled subscription is reactivated with credit recovery.',
  },
  {
    from: SubscriptionStatus.CANCELED,
    to: SubscriptionStatus.EXPIRED,
    event: SubscriptionStatusEvent.REACTIVATION_WINDOW_ENDED,
    maxDaysSinceStatusChange: 30,
    note: 'Reactivation window ends and remaining credits are voided.',
  },
];

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SubscriptionStatus);
export const SUBSCRIPTION_STATUS_EVENT_VALUES = Object.values(SubscriptionStatusEvent);

export type SubscriptionStatusValue = `${SubscriptionStatus}`;
export type SubscriptionStatusEventValue = `${SubscriptionStatusEvent}`;
