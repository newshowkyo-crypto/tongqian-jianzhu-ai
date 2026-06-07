import { Inject, Injectable } from '@nestjs/common';
import { AiAudienceRole, AiConfidenceLevel, AiOutputTier, ReportNextStepHint } from '@tongqian/types';
import type { ClaimStrategyView, ContractReviewView, ContractRiskFindingView, ModificationLetterView, RiskLevel, RiskReviewType, RiskType } from '@tongqian/types';

import { ReportCenterService } from '../report-center/report-center.service.js';
import { RulesService } from '../rule-curation/rules.service.js';
import { StorageService } from '../storage/storage.service.js';

import { RedFlagScanService } from './red-flag-scan.service.js';

interface ReviewInput {
  amountCny?: number;
  contractType: string;
  contractUrl: string;
  tenantId: string;
  tenantType?: 'BUILDING_COMPANY' | 'GOV';
  type: RiskReviewType;
  userId: string;
}

@Injectable()
export class RiskReviewService {
  private readonly claims = new Map<string, ClaimStrategyView>();
  private readonly letters = new Map<string, ModificationLetterView>();
  private readonly reviews = new Map<string, ContractReviewView>();

  constructor(
    @Inject(ReportCenterService) private readonly reportCenter: ReportCenterService,
    @Inject(RulesService) private readonly rules: RulesService,
    @Inject(RedFlagScanService) private readonly redFlagScan: RedFlagScanService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  createReview(input: ReviewInput): ContractReviewView {
    if (input.tenantType === 'GOV' && ((input.amountCny ?? 0) >= 10_000_000 || input.contractType.includes('litigation'))) {
      return this.humanTakeoverReview(input, AiOutputTier.TIER_4);
    }
    const tier = this.resolveTier(input.amountCny ?? 0);
    const contractFile = this.storage.registerExternalFile({
      fileName: input.contractUrl.split('/').at(-1) || `contract-${crypto.randomUUID()}.pdf`,
      mimeType: 'application/pdf',
      purpose: 'contract-review',
      sizeBytes: 512 * 1024,
      tenantId: input.tenantId,
      url: input.contractUrl,
    });
    const matchedRules = this.rules.matchContract(input.contractType);
    const findings = this.detectRisks(input.contractType, tier, matchedRules.map((rule) => rule.id)).slice(0, input.type === 'basic' ? 5 : 12);
    const redCount = findings.filter((item) => item.level === 'red').length;
    const yellowCount = findings.filter((item) => item.level === 'yellow').length;
    const greenCount = findings.filter((item) => item.level === 'green').length;
    const overallRisk: RiskLevel = redCount > 0 ? 'red' : yellowCount > 1 ? 'yellow' : 'green';
    const aiTaskId = `risk-review-${crypto.randomUUID()}`;
    const report = this.reportCenter.createReport({
      aiTaskType: input.type === 'tender' ? 'tender.risk' : `contract.review.${input.type}`,
      dataSnapshot: {
        confidence: AiConfidenceLevel.MEDIUM,
        dataSourceStatement: 'risk-review.datasource.rules-placeholder',
        disclaimer: 'risk-review.disclaimer.not-legal-opinion',
        findings,
        matchedRules,
        nextStepHint: tier === AiOutputTier.TIER_3 ? ReportNextStepHint.APPLY_TONGQIAN_CONSULT : ReportNextStepHint.USE_DIRECTLY,
        sections: [{ content: findings, id: 'findings', title: 'risk.sections.findings' }],
        summary: `risk.summary.${overallRisk}`,
        tier,
        title: 'risk.review.title',
        traceId: crypto.randomUUID(),
      },
      role: input.tenantType === 'GOV' ? AiAudienceRole.GOV_SOE : AiAudienceRole.OWNER,
      sourceModule: '13-risk-review',
      sourceTaskId: aiTaskId,
      tenantId: input.tenantId,
      userId: input.userId,
    });
    const review: ContractReviewView = {
      aiTaskId,
      contractType: input.contractType,
      contractUrl: contractFile.signedUrl,
      createdAt: new Date().toISOString(),
      findingCount: findings.length,
      findings,
      greenCount,
      id: crypto.randomUUID(),
      overallRisk,
      projectAmountCny: input.amountCny,
      redCount,
      reportId: report.id,
      status: 'ready',
      tenantId: input.tenantId,
      tier,
      type: input.type,
      userId: input.userId,
      yellowCount,
    };
    this.reviews.set(review.id, review);
    return review;
  }

  getReview(id: string, tenantId: string): ContractReviewView {
    const review = this.reviews.get(id);
    if (!review || review.tenantId !== tenantId) throw new Error('CONTRACT.REVIEW.NOT_FOUND');
    return review;
  }

  createModificationLetter(reviewId: string, tenantId: string): ModificationLetterView {
    const review = this.getReview(reviewId, tenantId);
    if (review.tier === AiOutputTier.TIER_3 || review.tier === AiOutputTier.TIER_4) throw new Error('CONTRACT.LETTER.HUMAN_REVIEW_REQUIRED');
    const content = [
      'risk.letter.opening',
      ...review.findings.filter((item) => item.level !== 'green').map((item) => `risk.letter.revise.${item.type}.${item.clauseNo ?? 'clause'}`),
      'risk.letter.closing',
    ].join('\n');
    const letter: ModificationLetterView = {
      aiTaskId: `modification-letter-${crypto.randomUUID()}`,
      content,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      pdfUrl: `mock://oss/modification-letters/${review.id}.pdf?ttl=3600`,
      reviewId,
    };
    this.letters.set(reviewId, letter);
    return letter;
  }

  createClaimStrategy(input: { facts: Record<string, unknown>; isLitigation?: boolean; projectAmountCny?: number; reviewId?: string }): ClaimStrategyView {
    const tier = input.isLitigation ? AiOutputTier.TIER_4 : this.resolveTier(input.projectAmountCny ?? 0);
    if (tier === AiOutputTier.TIER_4) {
      return {
        aiTaskId: `claim-strategy-${crypto.randomUUID()}`,
        contractReviewId: input.reviewId,
        createdAt: new Date().toISOString(),
        evidenceList: ['risk.claim.humanTakeover.evidenceCatalogOnly'],
        facts: input.facts,
        id: crypto.randomUUID(),
        steps: ['risk.claim.humanTakeover'],
        tier,
      };
    }
    const strategy: ClaimStrategyView = {
      aiTaskId: `claim-strategy-${crypto.randomUUID()}`,
      contractReviewId: input.reviewId,
      createdAt: new Date().toISOString(),
      evidenceList: ['contract', 'variation_order', 'site_record', 'payment_record', 'communication_log'],
      facts: input.facts,
      id: crypto.randomUUID(),
      steps: tier === AiOutputTier.TIER_1 ? ['risk.claim.notice', 'risk.claim.evidence', 'risk.claim.negotiate'] : ['risk.claim.collectOnly', 'risk.claim.requestHumanReview'],
      tier,
    };
    this.claims.set(strategy.id, strategy);
    return strategy;
  }

  batchReview(inputs: ReviewInput[]): ContractReviewView[] {
    return inputs.map((input) => this.createReview(input)).sort((left, right) => this.riskWeight(right.overallRisk) - this.riskWeight(left.overallRisk));
  }

  monthlyReview(tenantId: string): { green: number; red: number; tenantId: string; yellow: number } {
    const reviews = [...this.reviews.values()].filter((review) => review.tenantId === tenantId);
    return {
      green: reviews.filter((review) => review.overallRisk === 'green').length,
      red: reviews.filter((review) => review.overallRisk === 'red').length,
      tenantId,
      yellow: reviews.filter((review) => review.overallRisk === 'yellow').length,
    };
  }

  consultChat(question: string): { answer: string; costCredits: number; risk: 'minor' } {
    return { answer: `risk.consult.placeholder:${question.slice(0, 24)}`, costCredits: 100, risk: 'minor' };
  }

  scanWithRedFlags(contractText: string): { flags: ReturnType<RedFlagScanService['scan']>['flags']; summary: Record<string, number> } {
    const result = this.redFlagScan.scan(contractText);
    return { flags: result.flags, summary: this.redFlagScan.categories() };
  }

  featureWall(plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): Record<string, number | string> {
    return {
      ent: { basic: 999, claim: 999, historyDays: 'forever', pro: 999 },
      flag: { basic: 999, claim: 999, historyDays: 'forever', pro: 999 },
      lite: { basic: 5, claim: 0, historyDays: 30, pro: 3 },
      std: { basic: 999, claim: 0, historyDays: 90, pro: 999 },
      trial: { basic: 1, claim: 0, historyDays: 7, pro: 0 },
    }[plan];
  }

  private detectRisks(contractType: string, tier: AiOutputTier, matchedRuleIds: string[]): ContractRiskFindingView[] {
    const riskTypes: RiskType[] = [
      'unlimited_liability',
      'excessive_delay_penalty',
      'payment_milestone_unreasonable',
      'owner_unilateral_termination',
      'unreasonable_variation_claim_limit',
      'excessive_ip_confidentiality',
    ];
    return riskTypes.map((type, index) => ({
      clauseNo: `${index + 1}.${index + 2}`,
      clauseText: `risk.fixture.${contractType}.${type}`,
      id: crypto.randomUUID(),
      impact: `risk.impact.${type}`,
      level: this.levelFor(index, tier),
      ruleId: matchedRuleIds[index % Math.max(1, matchedRuleIds.length)] ?? `RULE-${type}`,
      standardWording: `risk.standard.${type}`,
      suggestion: `risk.suggestion.${type}`,
      type,
    }));
  }

  private humanTakeoverReview(input: ReviewInput, tier: AiOutputTier): ContractReviewView {
    const review: ContractReviewView = {
      aiTaskId: `risk-review-${crypto.randomUUID()}`,
      contractType: input.contractType,
      contractUrl: input.contractUrl,
      createdAt: new Date().toISOString(),
      findingCount: 0,
      findings: [],
      greenCount: 0,
      id: crypto.randomUUID(),
      overallRisk: 'red',
      projectAmountCny: input.amountCny,
      redCount: 1,
      status: 'human_takeover',
      tenantId: input.tenantId,
      tier,
      type: input.type,
      userId: input.userId,
      yellowCount: 0,
    };
    this.reviews.set(review.id, review);
    return review;
  }

  private levelFor(index: number, tier: AiOutputTier): RiskLevel {
    if (tier >= AiOutputTier.TIER_3 && index < 2) return 'red';
    if (index < 3) return 'yellow';
    return 'green';
  }

  private resolveTier(amountCny: number): AiOutputTier {
    if (amountCny < 10_000_000) return AiOutputTier.TIER_1;
    if (amountCny < 50_000_000) return AiOutputTier.TIER_2;
    return AiOutputTier.TIER_3;
  }

  private riskWeight(level: RiskLevel): number {
    return { green: 1, red: 3, yellow: 2 }[level];
  }
}
