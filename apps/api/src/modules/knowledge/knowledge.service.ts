import { Injectable } from '@nestjs/common';
import type {
  ContractClauseView,
  CrawlJobView,
  KnowledgeRetrievalItem,
  KnowledgeStatus,
  KnowledgeType,
  PerformanceView,
  PolicyView,
  TenderStructureView,
} from '@tongqian/types';

@Injectable()
export class KnowledgeService {
  private readonly clauses = new Map<string, ContractClauseView>();
  private readonly jobs = new Map<string, CrawlJobView>();
  private readonly performances = new Map<string, PerformanceView>();
  private readonly policies = new Map<string, PolicyView & { rawText: string }>();
  private readonly structures = new Map<string, TenderStructureView>();

  constructor() {
    this.seed();
  }

  listPolicies(filters: { level?: string; topics?: string[] }): PolicyView[] {
    return [...this.policies.values()]
      .filter((item) => item.status === 'published')
      .filter((item) => !filters.level || item.level === filters.level)
      .filter((item) => !filters.topics?.length || filters.topics.some((topic) => item.topics.includes(topic)))
      .map(({ rawText: _rawText, ...item }) => item);
  }

  searchPerformances(filters: { amountMax?: number; amountMin?: number; industry?: string; region?: string }): PerformanceView[] {
    return [...this.performances.values()].filter((item) => item.status === 'published')
      .filter((item) => !filters.region || item.region === filters.region)
      .filter((item) => !filters.industry || item.industry === filters.industry)
      .filter((item) => filters.amountMin === undefined || item.amountCny >= filters.amountMin)
      .filter((item) => filters.amountMax === undefined || item.amountCny <= filters.amountMax);
  }

  searchClauses(filters: { riskLevel?: 'green' | 'red' | 'yellow'; type?: string }): ContractClauseView[] {
    return [...this.clauses.values()].filter((item) => item.status === 'published')
      .filter((item) => !filters.type || item.type === filters.type)
      .filter((item) => !filters.riskLevel || item.riskLevel === filters.riskLevel);
  }

  tenderTemplates(filters: { industry?: string; projectType?: string }): TenderStructureView[] {
    return [...this.structures.values()].filter((item) => item.status === 'published')
      .filter((item) => !filters.industry || item.industry === filters.industry)
      .filter((item) => !filters.projectType || item.projectType === filters.projectType);
  }

  retrieve(input: { query: string; topK?: number; type?: KnowledgeType }): KnowledgeRetrievalItem[] {
    const topK = Math.min(input.topK ?? 5, 5);
    const haystack = [
      ...this.listPolicies({}).map((item) => ({ id: item.id, snippet: item.aiSummary, title: item.title, type: 'policy' as const })),
      ...this.searchPerformances({}).map((item) => ({ id: item.id, snippet: `${item.region} ${item.winnerCompany} ${item.amountCny}`, title: item.winnerCompany, type: 'performance' as const })),
      ...this.searchClauses({}).map((item) => ({ id: item.id, snippet: item.suggestion, title: item.category, type: 'contract_clause' as const })),
      ...this.tenderTemplates({}).map((item) => ({ id: item.id, snippet: item.templateOutline.join(' / '), title: item.projectType, type: 'tender_structure' as const })),
    ].filter((item) => !input.type || item.type === input.type);
    return haystack
      .map((item) => ({ ...item, score: this.score(input.query, `${item.title} ${item.snippet}`) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, topK);
  }

  triggerCrawler(input: { source: string; type: CrawlJobView['type'] }): CrawlJobView {
    if (input.source.includes('login')) throw new Error('KB.CRAWL.LOGIN_REQUIRED_SOURCE_FORBIDDEN');
    const job: CrawlJobView = {
      endedAt: new Date().toISOString(),
      fetchedCount: 3,
      id: crypto.randomUUID(),
      source: input.source,
      startedAt: new Date().toISOString(),
      status: 'succeeded',
      type: input.type,
    };
    this.jobs.set(job.id, job);
    this.createPendingReview(input.type, input.source);
    return job;
  }

  review(input: { decision: 'approve' | 'reject'; id: string; reason?: string; reviewerId: string; type: KnowledgeType }): Record<string, unknown> {
    const status: KnowledgeStatus = input.decision === 'approve' ? 'published' : 'rejected';
    if (!this.applyReview(input.type, input.id, status)) throw new Error('KB.REVIEW.ITEM_NOT_FOUND');
    return { id: input.id, reason: input.reason, reviewedAt: new Date().toISOString(), reviewerId: input.reviewerId, status };
  }

  private applyReview(type: KnowledgeType, id: string, status: KnowledgeStatus): boolean {
    const vectorId = status === 'published' ? `mock-dashvector-${id}` : undefined;
    if (type === 'contract_clause') {
      const item = this.clauses.get(id);
      if (!item) return false;
      this.clauses.set(id, { ...item, status, vectorId: vectorId ?? item.vectorId });
      return true;
    }
    if (type === 'performance') {
      const item = this.performances.get(id);
      if (!item) return false;
      this.performances.set(id, { ...item, status, vectorId: vectorId ?? item.vectorId });
      return true;
    }
    if (type === 'policy') {
      const item = this.policies.get(id);
      if (!item) return false;
      this.policies.set(id, { ...item, status, vectorId: vectorId ?? item.vectorId });
      return true;
    }
    const item = this.structures.get(id);
    if (!item) return false;
    this.structures.set(id, { ...item, status, vectorId: vectorId ?? item.vectorId });
    return true;
  }

  private createPendingReview(type: CrawlJobView['type'], source: string): void {
    if (type === 'policy') this.policies.set(crypto.randomUUID(), this.policy('crawler.policy.pending', 'city', ['infrastructure'], 'crawler', source, 'pending_review'));
    if (type === 'performance') this.performances.set(crypto.randomUUID(), this.performance('crawler', 'construction', '上海', 8_000_000, source, 'pending_review'));
    if (type === 'tender') this.structures.set(crypto.randomUUID(), this.structure('construction', 'public_building', 'pending_review'));
  }

  private seed(): void {
    for (const item of [
      this.policy('kb.seed.policy.infrastructure', 'national', ['infrastructure', 'qualification'], 'mock.org', 'kb.seed.raw.policy1', 'published'),
      this.policy('kb.seed.policy.financing', 'province', ['factoring', 'finance'], 'mock.org', 'kb.seed.raw.policy2', 'published'),
    ]) this.policies.set(item.id, item);
    this.performances.set('perf-seed-1', this.performance('seed-company', 'construction', '上海', 12_000_000, 'mock://public/performance/1', 'published'));
    this.clauses.set('clause-seed-1', this.clause('payment', 'red', 'progress_payment', 'kb.seed.clause.payment', 'published'));
    this.structures.set('tender-seed-1', this.structure('construction', 'public_building', 'published'));
  }

  private policy(title: string, level: string, topics: string[], org: string, rawText: string, status: KnowledgeStatus): PolicyView & { rawText: string } {
    return { aiSummary: `kb.summary.${title}`, id: crypto.randomUUID(), level, publishDate: '2026-05-18', publishOrg: org, rawText, status, title, topics, vectorId: status === 'published' ? `mock-vector-${title}` : undefined };
  }

  private performance(winnerCompany: string, industry: string, region: string, amountCny: number, sourceUrl: string, status: KnowledgeStatus): PerformanceView {
    return { amountCny, id: crypto.randomUUID(), industry, region, sourceUrl, status, vectorId: status === 'published' ? `mock-vector-${winnerCompany}` : undefined, winnerCompany };
  }

  private clause(type: string, riskLevel: 'green' | 'red' | 'yellow', category: string, clauseText: string, status: KnowledgeStatus): ContractClauseView {
    return { category, clauseText, id: crypto.randomUUID(), riskLevel, standardWording: `kb.standard.${category}`, status, suggestion: `kb.suggestion.${category}`, type, vectorId: status === 'published' ? `mock-vector-${category}` : undefined };
  }

  private structure(industry: string, projectType: string, status: KnowledgeStatus): TenderStructureView {
    return { id: crypto.randomUUID(), industry, projectType, scoringTemplate: { business: 30, price: 50, technical: 20 }, status, templateOutline: ['qualification', 'technical', 'commercial', 'appendix'], vectorId: status === 'published' ? `mock-vector-${projectType}` : undefined };
  }

  private score(query: string, text: string): number {
    const words = new Set(query.toLowerCase().split(/\s+/).filter(Boolean));
    return [...words].reduce((sum, word) => sum + (text.toLowerCase().includes(word) ? 0.2 : 0), 0.5);
  }
}
