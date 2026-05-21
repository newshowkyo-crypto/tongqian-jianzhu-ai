import { Inject, Injectable } from '@nestjs/common';
import { AiAudienceRole, AiConfidenceLevel, AiOutputTier, ReportNextStepHint } from '@tongqian/types';
import type {
  InvestabilityReportView,
  OpportunityMatchView,
  OpportunityPreferenceView,
  OpportunityView,
  OwnerVerifyResultView,
  PeerRadarView,
} from '@tongqian/types';

import { ReportCenterService } from '../report-center/report-center.service.js';

const INVESTABILITY_PROMPT_TEMPLATE = {
  fallbackText: 'opportunity.investability.fallback',
  primaryModel: 'qwen3-max',
  safetyChecks: ['no_political', 'value_density_v4'],
  taskType: 'OPP_INVESTABILITY',
  userTemplate: '<opportunity>{{opportunity}}</opportunity><company>{{company}}</company>',
  version: 'v1-placeholder',
};

@Injectable()
export class OpportunityService {
  private readonly investments = new Map<string, InvestabilityReportView>();
  private readonly matches = new Map<string, OpportunityMatchView>();
  private readonly opportunities = new Map<string, OpportunityView>();
  private readonly preferences = new Map<string, OpportunityPreferenceView>();
  private readonly verifyCache = new Map<string, OwnerVerifyResultView>();

  constructor(@Inject(ReportCenterService) private readonly reportCenter: ReportCenterService) {
    this.seedOpportunities();
  }

  createOpportunity(input: Omit<OpportunityView, 'createdAt' | 'id' | 'publishDate'> & { publishDate?: string }): OpportunityView {
    const opportunity: OpportunityView = {
      ...input,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      publishDate: input.publishDate ?? new Date().toISOString(),
    };
    this.opportunities.set(opportunity.id, opportunity);
    return opportunity;
  }

  getOpportunity(id: string): OpportunityView {
    const opportunity = this.opportunities.get(id);
    if (!opportunity) throw new Error('OPP.NOT_FOUND');
    return opportunity;
  }

  listOpportunities(tenantId: string): OpportunityMatchView[] {
    return this.dailyPush(tenantId);
  }

  getPreference(tenantId: string): OpportunityPreferenceView {
    return (
      this.preferences.get(tenantId) ?? {
        amountMaxCny: 50_000_000,
        amountMinCny: 0,
        industries: ['building', 'municipal'],
        pushEnabled: true,
        regions: ['Shanghai', 'Jiangsu', 'Zhejiang'],
        tenantId,
      }
    );
  }

  updatePreference(tenantId: string, input: Partial<OpportunityPreferenceView>): OpportunityPreferenceView {
    if (input.regions?.length === 0 || input.industries?.length === 0) throw new Error('OPP.PREFERENCE.INVALID');
    const preference = { ...this.getPreference(tenantId), ...input, tenantId };
    this.preferences.set(tenantId, preference);
    return preference;
  }

  dailyPush(tenantId: string): OpportunityMatchView[] {
    const preference = this.getPreference(tenantId);
    if (!preference.pushEnabled) return [];
    return [...this.opportunities.values()]
      .map((opportunity) => ({ matchScore: this.matchScore(opportunity, preference), opportunity }))
      .filter((item) => item.matchScore > 0)
      .sort((left, right) => right.matchScore - left.matchScore)
      .slice(0, 5)
      .map(({ matchScore, opportunity }) => {
        const key = `${tenantId}:${opportunity.id}`;
        const match = this.matches.get(key) ?? {
          bookmarked: false,
          matchScore,
          opportunity,
          pushedAt: new Date().toISOString(),
          tenantId,
        };
        this.matches.set(key, match);
        return match;
      });
  }

  bookmark(tenantId: string, opportunityId: string): OpportunityMatchView {
    const opportunity = this.getOpportunity(opportunityId);
    const key = `${tenantId}:${opportunityId}`;
    const match = this.matches.get(key) ?? { bookmarked: false, matchScore: 80, opportunity, pushedAt: new Date().toISOString(), tenantId };
    match.bookmarked = true;
    this.matches.set(key, match);
    return match;
  }

  assessInvestability(tenantId: string, userId: string, opportunityId: string): InvestabilityReportView {
    const opportunity = this.getOpportunity(opportunityId);
    const fundingScore = this.scoreByAmount(opportunity.amountEstimateCny);
    const qualificationScore = opportunity.industry === 'municipal' ? 76 : 84;
    const relationshipScore = opportunity.region === 'Shanghai' ? 68 : 62;
    const performanceScore = opportunity.amountEstimateCny > 50_000_000 ? 70 : 82;
    const score = Math.round((fundingScore + qualificationScore + relationshipScore + performanceScore) / 4);
    const tier = this.resolveTier(opportunity.amountEstimateCny);
    const aiTaskId = `mock-ai-task-${crypto.randomUUID()}`;
    const report = this.reportCenter.createReport({
      aiTaskType: INVESTABILITY_PROMPT_TEMPLATE.taskType,
      dataSnapshot: {
        confidence: AiConfidenceLevel.MEDIUM,
        dataSourceStatement: 'opportunity.datasource.placeholder-rag',
        disclaimer: 'report.disclaimer.ai-reference',
        nextStepHint: tier === AiOutputTier.TIER_1 ? ReportNextStepHint.USE_DIRECTLY : ReportNextStepHint.APPLY_HUMAN_REVIEW,
        score,
        sections: [{ content: { fundingScore, performanceScore, qualificationScore, relationshipScore }, id: 'scores', title: 'opportunity.sections.scores' }],
        summary: 'opportunity.summary.placeholder',
        tier,
        title: opportunity.title,
        traceId: crypto.randomUUID(),
      },
      role: AiAudienceRole.OWNER,
      sourceModule: '11-opportunity-radar',
      sourceTaskId: aiTaskId,
      tenantId,
      userId,
    });
    const result: InvestabilityReportView = {
      aiTaskId,
      createdAt: new Date().toISOString(),
      fundingScore,
      id: crypto.randomUUID(),
      opportunityId,
      performanceScore,
      qualificationScore,
      relationshipScore,
      reportId: report.id,
      riskPoints: this.riskPoints(opportunity, score),
      score,
      tenantId,
      tier,
    };
    this.investments.set(result.id, result);
    return result;
  }

  ownerVerify(opportunityId: string): OwnerVerifyResultView {
    const opportunity = this.getOpportunity(opportunityId);
    const code = opportunity.ownerCreditCode ?? `mock-credit-${opportunity.ownerName}`;
    const cached = this.verifyCache.get(code);
    if (cached && new Date(cached.cachedUntil).getTime() > Date.now()) return cached;
    const score = code.includes('RISK') ? 42 : 86;
    const result: OwnerVerifyResultView = {
      cachedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      evidence: [
        { source: 'credit', summary: 'opportunity.ownerVerify.credit.placeholder' },
        { source: 'court', summary: 'opportunity.ownerVerify.court.placeholder' },
        { source: 'government', summary: 'opportunity.ownerVerify.gov.placeholder' },
      ],
      ownerCreditCode: code,
      score,
      status: score >= 75 ? 'pass' : score >= 55 ? 'warning' : 'high_risk',
    };
    this.verifyCache.set(code, result);
    return result;
  }

  ownerProfile(opportunityId: string): Record<string, unknown> {
    const opportunity = this.getOpportunity(opportunityId);
    return {
      associatedCompanies: [`${opportunity.ownerName}-affiliate-placeholder`],
      historyProjects: this.peerRadar(opportunityId).peers.slice(0, 2),
      ownerName: opportunity.ownerName,
      paymentHabit: 'opportunity.ownerProfile.paymentHabit.placeholder',
      visibilityTier: 'paid_499_plus',
    };
  }

  peerRadar(opportunityId: string): PeerRadarView {
    const opportunity = this.getOpportunity(opportunityId);
    const base = opportunity.amountEstimateCny;
    const peers = [0.82, 0.91, 1.03, 1.12, 1.18].map((ratio, index) => ({
      company: `peer-${index + 1}`,
      projectAmountCny: Math.round(base * ratio),
      projectName: `${opportunity.industry}-reference-${index + 1}`,
      year: 2026 - (index % 3),
    }));
    return { bidRangeCny: this.recommendedPrice(opportunityId), peers, radiusKm: 50 };
  }

  recommendedPrice(opportunityId: string): { high: number; low: number } {
    const opportunity = this.getOpportunity(opportunityId);
    const low = Math.round(opportunity.amountEstimateCny * 0.88);
    const high = Math.round(opportunity.amountEstimateCny * 0.96);
    return { high, low };
  }

  blindBox(tenantId: string): OpportunityMatchView[] {
    return this.dailyPush(tenantId).slice(0, 5);
  }

  followReminders(tenantId: string): Array<{ daysBeforeDeadline: number; opportunityId: string; tenantId: string }> {
    return [...this.matches.values()]
      .filter((match) => match.tenantId === tenantId && match.bookmarked && match.opportunity.deadline)
      .flatMap((match) => [3, 1].map((daysBeforeDeadline) => ({ daysBeforeDeadline, opportunityId: match.opportunity.id, tenantId })));
  }

  featureWall(plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): Record<string, number | string> {
    const limits = {
      ent: { dailyPush: 10, historyDays: 'forever', ownerVerifyMonthly: 999 },
      flag: { dailyPush: 999, historyDays: 'forever', ownerVerifyMonthly: 999 },
      lite: { dailyPush: 3, historyDays: 30, ownerVerifyMonthly: 5 },
      std: { dailyPush: 5, historyDays: 90, ownerVerifyMonthly: 30 },
      trial: { dailyPush: 1, historyDays: 7, ownerVerifyMonthly: 0 },
    };
    return limits[plan];
  }

  private matchScore(opportunity: OpportunityView, preference: OpportunityPreferenceView): number {
    const region = preference.regions.includes(opportunity.region) ? 30 : 0;
    const industry = preference.industries.includes(opportunity.industry) ? 30 : 0;
    const minOk = preference.amountMinCny === undefined || opportunity.amountEstimateCny >= preference.amountMinCny;
    const maxOk = preference.amountMaxCny === undefined || opportunity.amountEstimateCny <= preference.amountMaxCny;
    const amount = minOk && maxOk ? 30 : 0;
    const freshness = Date.now() - new Date(opportunity.publishDate).getTime() < 7 * 24 * 60 * 60 * 1000 ? 10 : 0;
    return region + industry + amount + freshness;
  }

  private resolveTier(amountCny: number): AiOutputTier {
    if (amountCny < 10_000_000) return AiOutputTier.TIER_1;
    if (amountCny < 50_000_000) return AiOutputTier.TIER_2;
    return AiOutputTier.TIER_3;
  }

  private riskPoints(opportunity: OpportunityView, score: number): string[] {
    const risks = [];
    if (score < 70) risks.push('opportunity.risk.lowScore');
    if (!opportunity.ownerCreditCode) risks.push('opportunity.risk.missingOwnerCreditCode');
    if (opportunity.amountEstimateCny > 50_000_000) risks.push('opportunity.risk.largeProjectNeedsConsulting');
    return risks;
  }

  private scoreByAmount(amountCny: number): number {
    if (amountCny < 10_000_000) return 90;
    if (amountCny < 50_000_000) return 78;
    return 62;
  }

  private seedOpportunities(): void {
    if (this.opportunities.size > 0) return;
    for (const item of [
      { amountEstimateCny: 8_800_000, industry: 'building', ownerName: 'owner-a', region: 'Shanghai', title: 'urban-renewal-placeholder' },
      { amountEstimateCny: 28_000_000, industry: 'municipal', ownerName: 'owner-b', region: 'Jiangsu', title: 'municipal-road-placeholder' },
      { amountEstimateCny: 72_000_000, industry: 'building', ownerName: 'owner-c', ownerCreditCode: 'RISK-001', region: 'Zhejiang', title: 'campus-build-placeholder' },
    ]) {
      this.createOpportunity({ ...item, publishDate: new Date().toISOString(), source: 'mock-public-notice' });
    }
  }
}
