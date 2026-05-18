import type { MoneyAmount } from '../common/protocol.js';

export enum AutoRenewalStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  RETRYING = 'retrying',
  EXHAUSTED = 'exhausted',
}

export enum AutoRenewalFailureReason {
  PAYMENT_DECLINED = 'payment_declined',
  PAYMENT_PROVIDER_UNAVAILABLE = 'payment_provider_unavailable',
  AGREEMENT_EXPIRED = 'agreement_expired',
  UNKNOWN = 'unknown',
}

export interface AutoRenewalPolicy {
  defaultEnabled: true;
  reminderDaysBeforeExpiry: readonly [7, 3, 1];
  maxRetryAttempts: 3;
  retryIntervalHours: 24;
}

export interface AutoRenewalState {
  subscriptionId: string;
  status: AutoRenewalStatus;
  enabled: boolean;
  nextRenewalAt: string;
  retryAttempts: number;
  lastAttemptAt?: string;
  lastFailureReason?: AutoRenewalFailureReason;
  nextRetryAt?: string;
  amountDue?: MoneyAmount;
}

export const DEFAULT_AUTO_RENEWAL_POLICY: AutoRenewalPolicy = {
  defaultEnabled: true,
  reminderDaysBeforeExpiry: [7, 3, 1],
  maxRetryAttempts: 3,
  retryIntervalHours: 24,
};

export const AUTO_RENEWAL_STATUS_VALUES = Object.values(AutoRenewalStatus);
export const AUTO_RENEWAL_FAILURE_REASON_VALUES = Object.values(AutoRenewalFailureReason);

export type AutoRenewalStatusValue = `${AutoRenewalStatus}`;
export type AutoRenewalFailureReasonValue = `${AutoRenewalFailureReason}`;
