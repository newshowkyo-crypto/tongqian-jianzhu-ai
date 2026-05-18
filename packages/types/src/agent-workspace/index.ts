import type { AgentSubtype } from '../auth/role.js';

export type AgentLevel = 'LV1' | 'LV2' | 'LV3' | 'LV4' | 'LV5';
export type DispatchClass = 'A' | 'B' | 'C';
export type AgentDispatchStatus = 'bidding' | 'canceled' | 'classified' | 'completed' | 'created' | 'escalated_to_tongqian' | 'in_service' | 'rated' | 'selected';
export type QuoteColor = 'green' | 'over' | 'red' | 'yellow';

export interface AgentProfileView {
  activityStatus: 'active' | 'disposed' | 'dormant' | 'pending_dispose';
  id: string;
  isBlacklisted: boolean;
  promoCode: string;
  region: string;
  subtype: `${AgentSubtype}`;
  tenantId: string;
  userId: string;
}

export interface AgentDashboardView {
  clientSignals: AgentClientSignalView[];
  customersCount: number;
  dailyCard: { copy: string; h5Url: string };
  earnings: { frozenCny: number; referralCny: number; withdrawableCny: number };
  pendingDispatches: number;
  reputation: ReputationScoreView;
}

export interface ReputationScoreView {
  entityId: string;
  entityType: 'agent' | 'client_tenant' | 'partner';
  level: AgentLevel;
  nextLevelNeed: number;
  score: number;
}

export interface DispatchView {
  amountCny: number;
  assignedAgentId?: string;
  class: DispatchClass;
  clientTenantId: string;
  id: string;
  pool?: 'cross' | 'owned' | 'public';
  selectedAgentId?: string;
  sourceModule: string;
  status: AgentDispatchStatus;
  type: string;
}

export interface DispatchQuoteView {
  agentId: string;
  color: QuoteColor;
  description: string;
  dispatchId: string;
  id: string;
  isSelected: boolean;
  priceCny: number;
  refPriceId?: string;
}

export interface PremiumServiceItemView {
  category: string;
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  priceHighCny?: number;
  priceLowCny?: number;
}

export interface ReferralFeeView {
  agentId: string;
  feeAmountCny: number;
  feePct: number;
  freezeDays: number;
  id: string;
  status: 'frozen' | 'paid' | 'settlable' | 'withdrawable';
  triggerReason: string;
}

export interface AgentClientSignalView {
  actedAction?: string;
  agentId: string;
  clientId: string;
  cooldownUntil?: string;
  expiresAt: string;
  id: string;
  message: string;
  signalType: 'AR_OVERDUE' | 'INACTIVE_RISK' | 'PERFORMANCE_ADDED' | 'QUAL_EXPIRING' | 'TENDER_FAILED' | 'TENDER_UPLOADED';
  urgency: 'green' | 'red' | 'yellow';
}

export interface AgentCaseStudyView {
  agentId: string;
  category: string;
  downloadCount: number;
  id: string;
  isFeatured: boolean;
  status: 'pending_ai_review' | 'pending_expert' | 'published' | 'rejected';
  title: string;
}

export interface PartnerReferralView {
  expiresAt: string;
  id: string;
  partnerId: string;
  referredType: 'agent' | 'building_company' | 'tongqian_consult';
  referredUserId: string;
  status: 'active' | 'expired' | 'pending' | 'refunded';
  totalCommissionCny: number;
}
