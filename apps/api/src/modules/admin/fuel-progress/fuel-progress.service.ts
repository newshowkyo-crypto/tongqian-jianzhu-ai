import { Inject, Injectable } from '@nestjs/common';

import { KnowledgeCurationService } from '../../knowledge-curation/knowledge-curation.service.js';
import { PromptTestingCurationService } from '../../prompt-testing-curation/prompt-testing-curation.service.js';
import { RulesService } from '../../rule-curation/rules.service.js';

@Injectable()
export class FuelProgressService {
  constructor(
    @Inject(KnowledgeCurationService) private readonly knowledgeService: KnowledgeCurationService,
    @Inject(PromptTestingCurationService) private readonly promptTestingService: PromptTestingCurationService,
    @Inject(RulesService) private readonly rulesService: RulesService,
  ) {}

  get() {
    const ruleRows = this.rulesService.listRules();
    const ruleCandidates = this.rulesService.listCandidates();
    const knowledgeRows = this.knowledgeService.list();
    const publishedKnowledge = knowledgeRows.filter((item) => this.isPublishedKnowledge(item));
    const goldenTestRows = this.promptTestingService.list();
    const goldenRuns = this.promptTestingService.coverage();
    const rules = {
      byCategory: this.countBy(ruleRows, 'type'),
      current: ruleRows.length,
      lastBatchAt: this.latest(ruleCandidates, 'createdAt'),
      pendingReview: this.rulesService.listCandidates('pending').length,
      target: 200,
    };
    const knowledge = {
      byType: this.countBy(publishedKnowledge, 'category'),
      current: publishedKnowledge.length,
      lastUploadAt: this.latest(knowledgeRows, 'uploadedAt'),
      target: 10,
    };
    const goldenTests = {
      byTaskType: this.countBy(goldenTestRows, 'taskType'),
      current: goldenTestRows.length,
      lastRunAt: this.latest(goldenTestRows, 'createdAt'),
      passRate: goldenRuns.length ? Math.round(goldenRuns.reduce((sum, row) => sum + row.lastPassRate, 0) / goldenRuns.length) : 0,
      target: 350,
    };
    const overallReadiness = Math.min(100, Math.round((rules.current / rules.target) * 40 + (knowledge.current / knowledge.target) * 30 + (goldenTests.current / goldenTests.target) * 30));
    const timeline = [
      ...ruleCandidates.map((item) => ({ at: item.createdAt, event: `rule.${item.status}` })),
      ...knowledgeRows.map((item) => ({ at: item.uploadedAt, event: `knowledge.${item.category}` })),
      ...goldenTestRows.map((item) => ({ at: item.createdAt, event: `goldenTest.${item.taskType}` })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10)
      .map((item) => ({ at: item.at, event: item.event }));
    return { goldenTests, knowledge, overallReadiness, rules, timeline };
  }

  private countBy<TItem>(items: TItem[], key: keyof TItem): Record<string, number> {
    return items.reduce<Record<string, number>>((result, item) => {
      const value = String(item[key]);
      result[value] = (result[value] ?? 0) + 1;
      return result;
    }, {});
  }

  private isPublishedKnowledge(item: { parsedAt?: string; status?: string }): boolean {
    return item.status === 'published' || Boolean(item.parsedAt);
  }

  private latest<TItem>(items: TItem[], key: keyof TItem): string | undefined {
    return items.map((item) => String(item[key] ?? '')).filter(Boolean).sort().at(-1);
  }
}
