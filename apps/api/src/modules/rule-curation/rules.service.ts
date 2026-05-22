import { Injectable } from '@nestjs/common';

type RuleKind = 'contract' | 'price' | 'qual' | 'regulation' | 'tender';
type CandidateStatus = 'approved' | 'pending' | 'rejected';

export interface RuleCandidate {
  confidence: number;
  createdAt: string;
  id: string;
  reasoning: string;
  reviewerNote?: string;
  ruleStruct: Record<string, unknown>;
  sourceName: string;
  sourceText: string;
  status: CandidateStatus;
  type: RuleKind;
}

export interface ProductionRule {
  grayPercent: number;
  id: string;
  ruleStruct: Record<string, unknown>;
  sourceCandidateId?: string;
  type: RuleKind;
  version: number;
}

@Injectable()
export class RulesService {
  private readonly candidates = new Map<string, RuleCandidate>();
  private readonly rules = new Map<string, ProductionRule>();
  private readonly versions = new Map<string, ProductionRule[]>();

  constructor() {
    const seed = this.createCandidate({
      confidence: 0.91,
      reasoning: '合同付款节点与违约责任条款命中高频风险。',
      ruleStruct: { clause: 'payment', level: 'yellow', signal: 'milestone_missing' },
      sourceName: 'GF-2017 合同范本',
      sourceText: '付款节点、验收条件、逾期责任应明确约定。',
      type: 'contract',
    });
    this.approveCandidate(seed.id, 'seed:platform-owner');
    this.approveCandidate(this.createCandidate({
      confidence: 0.88,
      reasoning: '资质升级需要业绩、人员、安许三项共同校验。',
      ruleStruct: { category: '施工总承包', level: '二级升一级', requiredSignals: ['performance', 'personnel', 'safetyPermit'] },
      sourceName: '建筑业企业资质标准',
      sourceText: '企业主要人员、工程业绩、技术装备应满足资质标准。',
      type: 'qual',
    }).id, 'seed:platform-owner');
    this.approveCandidate(this.createCandidate({
      confidence: 0.86,
      reasoning: '招标文件评分办法应拆分商务、技术、报价权重。',
      ruleStruct: { scoringItem: 'technical', traps: ['subjective_score', 'unclear_deadline'] },
      sourceName: '招投标法实施条例',
      sourceText: '评标标准和方法应在招标文件中载明。',
      type: 'tender',
    }).id, 'seed:platform-owner');
  }

  createCandidate(input: Omit<RuleCandidate, 'createdAt' | 'id' | 'status'>): RuleCandidate {
    const candidate: RuleCandidate = {
      ...input,
      createdAt: new Date().toISOString(),
      id: `rc-${crypto.randomUUID()}`,
      status: 'pending',
    };
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }

  extract(files: Array<{ name: string; text: string }>): RuleCandidate[] {
    return files.map((file) => this.createCandidate({
      confidence: file.text.includes('投标') ? 0.84 : 0.79,
      reasoning: `${file.name} 已抽取可复核规则候选。`,
      ruleStruct: { keywords: file.text.slice(0, 48), sourceLength: file.text.length },
      sourceName: file.name,
      sourceText: file.text,
      type: file.text.includes('投标') ? 'tender' : 'contract',
    }));
  }

  listCandidates(status?: CandidateStatus): RuleCandidate[] {
    return [...this.candidates.values()].filter((item) => !status || item.status === status);
  }

  updateCandidate(id: string, patch: Partial<Pick<RuleCandidate, 'confidence' | 'reasoning' | 'reviewerNote' | 'ruleStruct' | 'sourceText' | 'type'>>): RuleCandidate {
    const candidate = this.mustCandidate(id);
    const next = { ...candidate, ...patch };
    this.candidates.set(id, next);
    return next;
  }

  approveCandidate(id: string, changedBy = 'platform-owner'): ProductionRule {
    const candidate = this.mustCandidate(id);
    const rule: ProductionRule = {
      grayPercent: 100,
      id: `rule-${candidate.type}-${crypto.randomUUID()}`,
      ruleStruct: candidate.ruleStruct,
      sourceCandidateId: candidate.id,
      type: candidate.type,
      version: 1,
    };
    candidate.status = 'approved';
    this.rules.set(rule.id, rule);
    this.versions.set(rule.id, [{ ...rule, ruleStruct: { ...rule.ruleStruct, changedBy } }]);
    return rule;
  }

  rejectCandidate(id: string, reason: string): RuleCandidate {
    const candidate = this.mustCandidate(id);
    candidate.status = 'rejected';
    candidate.reviewerNote = reason;
    return candidate;
  }

  listRules(type?: RuleKind): ProductionRule[] {
    return [...this.rules.values()].filter((rule) => !type || rule.type === type);
  }

  versionsFor(id: string): ProductionRule[] {
    return this.versions.get(id) ?? [];
  }

  rollback(id: string, version: number): ProductionRule {
    const history = this.versionsFor(id);
    const selected = history.find((item) => item.version === version);
    if (!selected) throw new Error('RULE.VERSION.NOT_FOUND');
    const current = { ...selected, grayPercent: 0, version: history.length + 1 };
    this.rules.set(id, current);
    this.versions.set(id, [...history, current]);
    return current;
  }

  matchContract(text: string): ProductionRule[] {
    return this.matchByType('contract', text);
  }

  matchQualification(text: string): ProductionRule[] {
    return this.matchByType('qual', text);
  }

  matchTender(text: string): ProductionRule[] {
    return this.matchByType('tender', text);
  }

  stats(): Record<string, number> {
    return {
      approved: this.listCandidates('approved').length,
      candidates: this.candidates.size,
      pending: this.listCandidates('pending').length,
      production: this.rules.size,
    };
  }

  private matchByType(type: RuleKind, text: string): ProductionRule[] {
    const lowered = text.toLowerCase();
    return this.listRules(type)
      .filter((rule) => rule.grayPercent >= 50 || JSON.stringify(rule.ruleStruct).toLowerCase().includes(lowered.slice(0, 8)))
      .slice(0, 8);
  }

  private mustCandidate(id: string): RuleCandidate {
    const candidate = this.candidates.get(id);
    if (!candidate) throw new Error('RULE.CANDIDATE.NOT_FOUND');
    return candidate;
  }
}
