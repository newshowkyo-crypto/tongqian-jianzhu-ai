export type CreditLogType = 'commit' | 'expire' | 'gift' | 'pre_charge' | 'pre_charge_release' | 'refund' | 'topup';
export type CreditSourceType = 'ai_failure_refund' | 'gift' | 'subscription' | 'topup';

export interface CreditAccount {
  id: string;
  tenantId: string;
  totalBalance: number;
  userId: string;
}

export interface CreditLot {
  accountId: string;
  createdAt: string;
  expiresAt?: string;
  frozenUntil?: string;
  id: string;
  initialAmount: number;
  remainingAmount: number;
  source: string;
  sourceType: CreditSourceType;
}

export interface CreditLog {
  accountId: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  id: string;
  idempotencyKey?: string;
  sourceModule: string;
  sourceResource?: string;
  traceId: string;
  type: CreditLogType;
}

export interface LotAllocation {
  amount: number;
  lotId: string;
}
