import { Injectable } from '@nestjs/common';
import { AgentSubtype } from '@tongqian/types';
import type {
  AgentCaseStudyView,
  AgentClientSignalView,
  AgentDashboardView,
  AgentLevel,
  AgentProfileView,
  DispatchClass,
  DispatchQuoteView,
  DispatchView,
  PartnerReferralView,
  PremiumServiceItemView,
  QuoteColor,
  ReferralFeeView,
  ReputationScoreView,
} from '@tongqian/types';

const PARTNER_ENABLED = process.env.FEATURE_FLAG_PARTNER_ENABLED === 'true';
const PRIVATE_DEAL_KEYWORDS = ['红包', '礼物', '私下', '加微信', '转账', '现金', 'offline', 'wechat'];

@Injectable()
export class AgentWorkspaceService {
  private readonly cases = new Map<string, AgentCaseStudyView>();
  private readonly consents = new Map<string, Record<string, unknown>>();
  private readonly dispatches = new Map<string, DispatchView>();
  private readonly partnerReferrals = new Map<string, PartnerReferralView>();
  private readonly premiumItems = new Map<string, PremiumServiceItemView>();
  private readonly profiles = new Map<string, AgentProfileView>();
  private readonly quotes = new Map<string, DispatchQuoteView[]>();
  private readonly referralFees = new Map<string, ReferralFeeView[]>();
  private readonly relations = new Map<string, { childId: string; parentId: string; level: 1 | 2 }>();
  private readonly reputations = new Map<string, ReputationScoreView>();
  private readonly signals = new Map<string, AgentClientSignalView[]>();

  constructor() {
    this.seedPremiumShelf();
  }

  dashboard(agentId: string): AgentDashboardView {
    const reputation = this.reputation(agentId, 'agent');
    return {
      clientSignals: this.signals.get(agentId) ?? this.generateSignals(agentId, 'mock-client-tenant'),
      customersCount: 3,
      dailyCard: { copy: 'agent.dailyCard.copy.placeholderUnder100Chars', h5Url: `mock://h5/agent-daily/${agentId}` },
      earnings: { frozenCny: 1200, referralCny: this.fees(agentId).reduce((sum, item) => sum + item.feeAmountCny, 0), withdrawableCny: 880 },
      pendingDispatches: [...this.dispatches.values()].filter((item) => item.assignedAgentId === agentId && item.status === 'bidding').length,
      reputation,
    };
  }

  upsertProfile(input: { region: string; subtype: `${AgentSubtype}`; tenantId: string; userId: string }): AgentProfileView {
    if (input.subtype === AgentSubtype.AGENT_PARTNER && !PARTNER_ENABLED) throw new Error('AGENT.PARTNER_DISABLED_M1_M3');
    const current = [...this.profiles.values()].find((item) => item.userId === input.userId);
    const profile: AgentProfileView = {
      activityStatus: current?.activityStatus ?? 'active',
      id: current?.id ?? crypto.randomUUID(),
      isBlacklisted: current?.isBlacklisted ?? false,
      promoCode: current?.promoCode ?? this.promoCode(input.userId),
      region: input.region,
      subtype: input.subtype,
      tenantId: input.tenantId,
      userId: input.userId,
    };
    this.profiles.set(profile.id, profile);
    this.reputation(profile.id, input.subtype === AgentSubtype.AGENT_PARTNER ? 'partner' : 'agent');
    return profile;
  }

  bindRelation(input: { childId: string; parentId: string }): Record<string, unknown> {
    const parent = this.relations.get(input.parentId);
    const level = parent ? 2 : 1;
    if (level > 2 || input.childId === input.parentId) throw new Error('AGENT.LEVEL_EXCEEDED');
    this.relations.set(input.childId, { childId: input.childId, level, parentId: input.parentId });
    return { rewardCny: level === 1 ? 200 : 0, syncedCommissionPct: level === 1 ? 0.1 : 0, ...this.relations.get(input.childId) };
  }

  createCommission(input: { agentId: string; amountCny: number; type: 'subscription_first_year' | 'subscription_next_year' | 'topup' }): ReferralFeeView {
    const rate = input.type === 'subscription_first_year' ? 0.3 : input.type === 'subscription_next_year' ? 0.2 : 0.15;
    const fee: ReferralFeeView = {
      agentId: input.agentId,
      feeAmountCny: Math.round(input.amountCny * rate),
      feePct: rate,
      freezeDays: 30,
      id: crypto.randomUUID(),
      status: 'frozen',
      triggerReason: input.type,
    };
    this.referralFees.set(input.agentId, [...this.fees(input.agentId), fee]);
    return fee;
  }

  classifyDispatch(input: { amountCny: number; clientTenantId: string; sourceModule: string; type: string }): DispatchView {
    const dispatchClass: DispatchClass = input.type.includes('ABS') || input.amountCny >= 50_000_000 ? 'B' : input.amountCny < 200_000 ? 'A' : 'C';
    const dispatch: DispatchView = {
      amountCny: input.amountCny,
      class: dispatchClass,
      clientTenantId: input.clientTenantId,
      id: crypto.randomUUID(),
      pool: dispatchClass === 'B' ? 'public' : 'owned',
      sourceModule: input.sourceModule,
      status: dispatchClass === 'B' ? 'escalated_to_tongqian' : 'classified',
      type: input.type,
    };
    this.dispatches.set(dispatch.id, dispatch);
    return dispatch;
  }

  routeDispatch(id: string, agentId?: string): DispatchView {
    const dispatch = this.mustDispatch(id);
    const routed = { ...dispatch, assignedAgentId: agentId ?? 'mock-agent-owned', pool: agentId ? 'owned' as const : 'public' as const, status: 'bidding' as const };
    this.dispatches.set(id, routed);
    return routed;
  }

  quote(input: { agentId: string; description: string; dispatchId: string; priceCny: number; refHighCny?: number }): DispatchQuoteView {
    const color = this.classifyQuote(input.priceCny, input.refHighCny ?? input.priceCny);
    const quote: DispatchQuoteView = { agentId: input.agentId, color, description: input.description, dispatchId: input.dispatchId, id: crypto.randomUUID(), isSelected: false, priceCny: input.priceCny };
    this.quotes.set(input.dispatchId, [...(this.quotes.get(input.dispatchId) ?? []), quote]);
    return quote;
  }

  selectQuote(input: { agentId: string; dispatchId: string }): DispatchView {
    const dispatch = this.mustDispatch(input.dispatchId);
    const quotes = (this.quotes.get(input.dispatchId) ?? []).map((item) => ({ ...item, isSelected: item.agentId === input.agentId }));
    this.quotes.set(input.dispatchId, quotes);
    const selected = { ...dispatch, selectedAgentId: input.agentId, status: 'selected' as const };
    this.dispatches.set(input.dispatchId, selected);
    return selected;
  }

  rateAgent(input: { agentId: string; comment: string; dispatchId: string; stars: number }): Record<string, unknown> {
    this.privateDealScan(input.comment, input.agentId);
    const delta = Math.max(-50, Math.min(30, (input.stars - 4) * 15));
    this.applyReputation(input.agentId, 'agent', delta, 'rating.agent');
    return { autoFraudChecked: true, dispatchId: input.dispatchId, stars: input.stars };
  }

  premiumShelf(): PremiumServiceItemView[] {
    return [...this.premiumItems.values()].filter((item) => item.isActive);
  }

  inquirePremium(input: { agentId?: string; clientTenantId: string; itemId: string }): Record<string, unknown> {
    const item = this.premiumItems.get(input.itemId);
    if (!item) throw new Error('AGENT.PREMIUM_ITEM_NOT_FOUND');
    if (input.agentId) this.addReferralFee(input.agentId, item.category, 0.1, item.priceLowCny ?? 0, 45);
    return { consultingOrderId: `mock-consulting-${crypto.randomUUID()}`, itemId: item.id, status: 'pending_consult' };
  }

  generateSignals(agentId: string, clientId: string): AgentClientSignalView[] {
    const now = Date.now();
    const items: AgentClientSignalView[] = ['TENDER_UPLOADED', 'QUAL_EXPIRING', 'AR_OVERDUE', 'INACTIVE_RISK'].map((signalType, index) => ({
      agentId,
      clientId,
      expiresAt: new Date(now + (index + 1) * 86_400_000).toISOString(),
      id: crypto.randomUUID(),
      message: `agent.signal.${signalType}`,
      signalType: signalType as AgentClientSignalView['signalType'],
      urgency: index === 2 ? 'red' : 'yellow',
    }));
    this.signals.set(agentId, items);
    return items;
  }

  actOnSignal(input: { action: 'contact_initiated' | 'dismissed' | 'scheduled'; agentId: string; signalId: string }): AgentClientSignalView {
    const list = this.signals.get(input.agentId) ?? [];
    const signal = list.find((item) => item.id === input.signalId);
    if (!signal) throw new Error('AGENT.SIGNAL_NOT_FOUND');
    const cooldownDays = input.action === 'dismissed' ? 90 : 7;
    const updated = { ...signal, actedAction: input.action, cooldownUntil: new Date(Date.now() + cooldownDays * 86_400_000).toISOString() };
    this.signals.set(input.agentId, list.map((item) => item.id === input.signalId ? updated : item));
    if (input.action === 'contact_initiated') this.applyReputation(input.agentId, 'agent', 5, 'client_signal.contact');
    return updated;
  }

  uploadCase(input: { agentId: string; category: string; commitments: string[]; content: Record<string, unknown>; title: string }): AgentCaseStudyView {
    if (input.commitments.length < 3) throw new Error('AGENT.CASE_COMMITMENT_REQUIRED');
    const duplicated = [...this.cases.values()].some((item) => item.agentId === input.agentId && item.title === input.title);
    const status = duplicated ? 'rejected' : 'pending_expert';
    const view: AgentCaseStudyView = { agentId: input.agentId, category: input.category, downloadCount: 0, id: crypto.randomUUID(), isFeatured: false, status, title: input.title };
    this.cases.set(view.id, view);
    return view;
  }

  downloadCase(input: { buyerAgentId: string; caseId: string }): Record<string, unknown> {
    const item = this.cases.get(input.caseId);
    if (!item || item.status !== 'published') throw new Error('AGENT.CASE_NOT_PUBLISHED');
    const selfBuy = item.agentId === input.buyerAgentId;
    this.cases.set(item.id, { ...item, downloadCount: item.downloadCount + 1 });
    return { paidCredits: selfBuy ? 0 : 5, revenueAgentId: selfBuy ? undefined : item.agentId, watermark: `buyer:${input.buyerAgentId};trace:${crypto.randomUUID()}` };
  }

  signConsent(input: { agentId: string; commitments: string[]; ip: string; protocolVersion: string; userAgent: string }): Record<string, unknown> {
    if (input.commitments.length < 5) throw new Error('AGENT.CONSENT_INCOMPLETE');
    const consent = { ...input, signedAt: new Date().toISOString() };
    this.consents.set(input.agentId, consent);
    return consent;
  }

  partnerReferral(input: { partnerId: string; referredType: PartnerReferralView['referredType']; referredUserId: string }): PartnerReferralView {
    if (!PARTNER_ENABLED) throw new Error('AGENT.PARTNER_DISABLED_M1_M3');
    const referral: PartnerReferralView = { expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(), id: crypto.randomUUID(), partnerId: input.partnerId, referredType: input.referredType, referredUserId: input.referredUserId, status: 'pending', totalCommissionCny: 0 };
    this.partnerReferrals.set(referral.id, referral);
    return referral;
  }

  private reputation(entityId: string, entityType: ReputationScoreView['entityType']): ReputationScoreView {
    const key = `${entityType}:${entityId}`;
    const current = this.reputations.get(key);
    if (current) return current;
    const score = entityType === 'partner' ? 0 : 500;
    const created = { entityId, entityType, level: this.level(score), nextLevelNeed: this.nextLevelNeed(score), score };
    this.reputations.set(key, created);
    return created;
  }

  private applyReputation(entityId: string, entityType: ReputationScoreView['entityType'], delta: number, _reason: string): ReputationScoreView {
    const current = this.reputation(entityId, entityType);
    const score = Math.max(0, Math.min(1000, current.score + delta));
    const next = { ...current, level: this.level(score), nextLevelNeed: this.nextLevelNeed(score), score };
    this.reputations.set(`${entityType}:${entityId}`, next);
    return next;
  }

  private level(score: number): AgentLevel {
    if (score >= 900) return 'LV5';
    if (score >= 750) return 'LV4';
    if (score >= 600) return 'LV3';
    if (score >= 300) return 'LV2';
    return 'LV1';
  }

  private nextLevelNeed(score: number): number {
    return Math.max(0, ([300, 600, 750, 900].find((threshold) => score < threshold) ?? 1000) - score);
  }

  private classifyQuote(quoteCny: number, refHighCny: number): QuoteColor {
    const ratio = refHighCny === 0 ? Number.POSITIVE_INFINITY : quoteCny / refHighCny;
    if (ratio <= 1) return 'green';
    if (ratio <= 1.5) return 'yellow';
    if (ratio <= 2) return 'red';
    return 'over';
  }

  private privateDealScan(text: string, agentId: string): void {
    if (PRIVATE_DEAL_KEYWORDS.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))) {
      this.applyReputation(agentId, 'agent', -50, 'private_deal.keyword');
    }
  }

  private fees(agentId: string): ReferralFeeView[] {
    return this.referralFees.get(agentId) ?? [];
  }

  private addReferralFee(agentId: string, reason: string, pct: number, amountCny: number, freezeDays: number): ReferralFeeView {
    const fee: ReferralFeeView = { agentId, feeAmountCny: Math.round(amountCny * pct), feePct: pct, freezeDays, id: crypto.randomUUID(), status: 'frozen', triggerReason: reason };
    this.referralFees.set(agentId, [...this.fees(agentId), fee]);
    return fee;
  }

  private mustDispatch(id: string): DispatchView {
    const dispatch = this.dispatches.get(id);
    if (!dispatch) throw new Error('DISPATCH.NOT_FOUND');
    return dispatch;
  }

  private promoCode(userId: string): string {
    return `TQ${Buffer.from(userId).toString('hex').slice(0, 8).toUpperCase()}`;
  }

  private seedPremiumShelf(): void {
    for (const category of ['factoring', 'ABS', 'REITs', 'SPV', 'soe_finance', 'major_tender', 'qualification_top', 'gov_special_bond', 'PPP', 'cross_border']) {
      const item = { category, description: `premium.${category}.description`, id: crypto.randomUUID(), isActive: true, name: `premium.${category}.name`, priceHighCny: 500_000, priceLowCny: 50_000 };
      this.premiumItems.set(item.id, item);
    }
  }
}
