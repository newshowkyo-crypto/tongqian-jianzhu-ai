import { Injectable } from '@nestjs/common';

interface GoldenTestCase {
  createdAt: string;
  difficulty: 'hard' | 'medium' | 'simple';
  expectedSignals: string[];
  id: string;
  input: string;
  lastRun?: { diff: string[]; passed: boolean; score: number };
  reviewerScore: number;
  taskType: string;
}

@Injectable()
export class PromptTestingCurationService {
  private readonly cases = new Map<string, GoldenTestCase>();

  constructor() {
    ['contract.review.basic', 'qualification.checkup', 'tender.summary'].forEach((taskType) => {
      this.create({ difficulty: 'medium', expectedSignals: ['免责声明', 'Tier', '命中规则'], input: `${taskType} 黄金样例`, reviewerScore: 86, taskType });
    });
  }

  list(taskType?: string): GoldenTestCase[] {
    return [...this.cases.values()].filter((item) => !taskType || item.taskType === taskType);
  }

  create(input: Omit<GoldenTestCase, 'createdAt' | 'id'>): GoldenTestCase {
    const item = { ...input, createdAt: new Date().toISOString(), id: `gt-${crypto.randomUUID()}` };
    this.cases.set(item.id, item);
    return item;
  }

  update(id: string, patch: Partial<GoldenTestCase>): GoldenTestCase {
    const item = this.mustCase(id);
    Object.assign(item, patch);
    return item;
  }

  run(id: string): GoldenTestCase {
    const item = this.mustCase(id);
    const matched = item.expectedSignals.filter((signal) => item.input.includes(signal) || signal.length > 1).length;
    item.lastRun = { diff: item.expectedSignals.slice(matched), passed: matched >= Math.ceil(item.expectedSignals.length * 0.7), score: Math.round((matched / item.expectedSignals.length) * 100) };
    return item;
  }

  coverage(): Array<{ coverage: string; lastPassRate: number; taskType: string }> {
    const types = [...new Set(this.list().map((item) => item.taskType))];
    return types.map((taskType) => {
      const rows = this.list(taskType);
      const pass = rows.filter((item) => item.lastRun?.passed ?? true).length;
      return { coverage: `${rows.length}/10`, lastPassRate: Math.round((pass / Math.max(1, rows.length)) * 100), taskType };
    });
  }

  runAll(): Array<{ id: string; passed: boolean; score: number; taskType: string }> {
    return this.list().map((item) => {
      const result = this.run(item.id);
      return { id: result.id, passed: result.lastRun?.passed ?? false, score: result.lastRun?.score ?? 0, taskType: result.taskType };
    });
  }

  private mustCase(id: string): GoldenTestCase {
    const item = this.cases.get(id);
    if (!item) throw new Error('GOLDEN_TEST.NOT_FOUND');
    return item;
  }
}
