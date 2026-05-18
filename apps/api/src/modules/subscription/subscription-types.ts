export type PlanCode = 'ent' | 'flag' | 'lite' | 'std' | 'trial';
export type SubStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'trial';

export interface SubscriptionRecord {
  autoRenew: boolean;
  canceledAt?: string;
  conciergeUserId?: string;
  consecutiveMonths: number;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  expiredAt?: string;
  id: string;
  pastDueSince?: string;
  planCode: PlanCode;
  status: SubStatus;
  tenantId: string;
  totalPaid: number;
  totalPaidMonths: number;
}

export interface SubscriptionPlanView {
  code: PlanCode;
  creditsPerMonth: number;
  features: Record<string, boolean>;
  isActive: boolean;
  monthlyPriceCny: number;
  name: string;
  yearlyPriceCny?: number;
}
