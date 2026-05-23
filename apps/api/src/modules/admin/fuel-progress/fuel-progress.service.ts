import { Injectable } from '@nestjs/common';

const rulesStore = [
  { category: 'contract', status: 'active', updatedAt: '2026-05-22T08:00:00.000Z' },
  { category: 'tender', status: 'candidate', updatedAt: '2026-05-22T09:00:00.000Z' },
];
const knowledgeStore = [{ status: 'published', type: 'contract_sample', updatedAt: '2026-05-22T10:00:00.000Z' }];
const goldenTestStore = [{ pass: true, taskType: 'contract.review', updatedAt: '2026-05-22T11:00:00.000Z' }];

@Injectable()
export class FuelProgressService {
  get() {
    const rules = {
      byCategory: this.countBy(rulesStore.filter((item) => item.status === 'active'), 'category'),
      current: rulesStore.filter((item) => item.status === 'active').length,
      lastBatchAt: this.latest(rulesStore),
      pendingReview: rulesStore.filter((item) => item.status === 'candidate').length,
      target: 200,
    };
    const knowledge = {
      byType: this.countBy(knowledgeStore.filter((item) => item.status === 'published'), 'type'),
      current: knowledgeStore.filter((item) => item.status === 'published').length,
      lastUploadAt: this.latest(knowledgeStore),
      target: 10,
    };
    const goldenTests = {
      byTaskType: this.countBy(goldenTestStore, 'taskType'),
      current: goldenTestStore.length,
      lastRunAt: this.latest(goldenTestStore),
      passRate: goldenTestStore.length ? Math.round((goldenTestStore.filter((item) => item.pass).length / goldenTestStore.length) * 100) : 0,
      target: 350,
    };
    const overallReadiness = Math.min(100, Math.round((rules.current / rules.target) * 40 + (knowledge.current / knowledge.target) * 30 + (goldenTests.current / goldenTests.target) * 30));
    const timeline = [...rulesStore, ...knowledgeStore, ...goldenTestStore]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 10)
      .map((item) => ({ at: item.updatedAt, event: 'fuel.progress.updated' }));
    return { goldenTests, knowledge, overallReadiness, rules, timeline };
  }

  private countBy<TItem extends Record<string, unknown>>(items: TItem[], key: keyof TItem): Record<string, number> {
    return items.reduce<Record<string, number>>((result, item) => {
      const value = String(item[key]);
      result[value] = (result[value] ?? 0) + 1;
      return result;
    }, {});
  }

  private latest(items: Array<{ updatedAt: string }>): string | undefined {
    return items.map((item) => item.updatedAt).sort().at(-1);
  }
}
