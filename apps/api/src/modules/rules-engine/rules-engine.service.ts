import { Injectable } from '@nestjs/common';
import type { ContractRuleView, QualificationRuleView, ReferencePriceView, RuleStatusColor, RuleVersionView, TenderRuleView } from '@tongqian/types';

@Injectable()
export class RulesEngineService {
  private readonly contractRules = new Map<string, ContractRuleView>();
  private readonly qualificationRules = new Map<string, QualificationRuleView>();
  private readonly referencePrices = new Map<string, ReferencePriceView>();
  private readonly tenderRules = new Map<string, TenderRuleView>();
  private readonly versions = new Map<string, RuleVersionView[]>();

  constructor() {
    this.seed();
  }

  qualifications(filters: { category?: string; toLevel?: string }): QualificationRuleView[] {
    return [...this.qualificationRules.values()].filter((rule) => rule.isActive)
      .filter((rule) => !filters.category || rule.category === filters.category)
      .filter((rule) => !filters.toLevel || rule.toLevel === filters.toLevel);
  }

  contracts(filters: { riskLevel?: 'green' | 'red' | 'yellow'; type?: string }): ContractRuleView[] {
    return [...this.contractRules.values()].filter((rule) => rule.isActive)
      .filter((rule) => !filters.type || rule.type === filters.type)
      .filter((rule) => !filters.riskLevel || rule.riskLevel === filters.riskLevel);
  }

  tenders(filters: { industry?: string }): TenderRuleView[] {
    return [...this.tenderRules.values()].filter((rule) => rule.isActive).filter((rule) => !filters.industry || rule.industry === filters.industry);
  }

  prices(filters: { region?: string; serviceType?: string }): ReferencePriceView[] {
    return [...this.referencePrices.values()].filter((price) => price.isActive)
      .filter((price) => !filters.serviceType || price.serviceType === filters.serviceType)
      .filter((price) => !filters.region || price.region === filters.region || price.region === undefined);
  }

  classifyQuote(input: { quoteCny: number; refHighCny: number }): RuleStatusColor {
    const ratio = input.refHighCny === 0 ? Number.POSITIVE_INFINITY : input.quoteCny / input.refHighCny;
    if (ratio <= 1) return 'green';
    if (ratio <= 1.5) return 'yellow';
    if (ratio <= 2) return 'red';
    return 'over';
  }

  extractCandidate(input: { knowledgeId: string; type: 'contract' | 'qualification' | 'tender' }): Record<string, unknown> {
    return {
      confidence: 0.86,
      knowledgeId: input.knowledgeId,
      rule: { if: `rules.extract.${input.type}.condition`, then: `rules.extract.${input.type}.action` },
      status: 'pending_review',
    };
  }

  reviewRule(input: { approved: boolean; changedBy: string; changeReason: string; ruleId: string; ruleTable: 'contract' | 'qualification' | 'tender' }): RuleVersionView {
    const snapshot = this.snapshot(input.ruleTable, input.ruleId);
    if (!snapshot) throw new Error('RULE.NOT_FOUND');
    const key = `${input.ruleTable}:${input.ruleId}`;
    const version: RuleVersionView = {
      changedBy: input.changedBy,
      changeReason: input.changeReason,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      ruleId: input.ruleId,
      ruleTable: input.ruleTable,
      snapshot,
      version: (this.versions.get(key)?.length ?? 0) + 1,
    };
    this.versions.set(key, [...(this.versions.get(key) ?? []), version]);
    return version;
  }

  versionsFor(ruleTable: string, ruleId: string): RuleVersionView[] {
    return this.versions.get(`${ruleTable}:${ruleId}`) ?? [];
  }

  private snapshot(ruleTable: string, ruleId: string): Record<string, unknown> | undefined {
    const maps = { contract: this.contractRules, qualification: this.qualificationRules, tender: this.tenderRules };
    return maps[ruleTable as keyof typeof maps]?.get(ruleId) as Record<string, unknown> | undefined;
  }

  private seed(): void {
    const qual = { category: 'construction_general', fromLevel: 'level_2', id: crypto.randomUUID(), isActive: true, requirements: { netAssets: 40_000_000, personnel: ['registered_builder'] }, toLevel: 'level_1', version: 1 };
    this.qualificationRules.set(qual.id, qual);
    const contract = { id: crypto.randomUUID(), isActive: true, riskLevel: 'red' as const, standardWording: 'rules.contract.standard.jointLiability', suggestion: 'rules.contract.suggestion.limitLiability', trigger: { keywords: ['unlimited_joint_liability'] }, type: 'guarantee', version: 1 };
    this.contractRules.set(contract.id, contract);
    const tender = { bidStrategy: { focus: 'technical_score' }, id: crypto.randomUUID(), industry: 'construction', isActive: true, scoringItem: 'technical_plan', trapWarnings: ['rules.tender.trap.subjectiveScore'], version: 1, weightPct: 30 };
    this.tenderRules.set(tender.id, tender);
    const price = { amountHighCny: 80_000, amountLowCny: 30_000, dataSource: 'expert' as const, id: crypto.randomUUID(), isActive: true, region: '上海', sampleCount: 12, serviceType: 'qualification.upgrade.2to1', updatedAt: new Date().toISOString() };
    this.referencePrices.set(price.id, price);
  }
}
