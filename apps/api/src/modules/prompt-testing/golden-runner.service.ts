import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

interface GoldenCase {
  expectedSignals: string[];
  forbiddenSignals: string[];
  id: string;
  input: Record<string, unknown>;
}

interface GoldenSet {
  cases: GoldenCase[];
  taskType: string;
  version: string;
}

export interface GoldenRunResult {
  byCase: Array<{ f1: number; id: string; passed: boolean; precision: number; recall: number }>;
  f1: number;
  failed: number;
  passed: number;
  precision: number;
  recall: number;
  taskType: string;
  total: number;
}

@Injectable()
export class GoldenRunnerService {
  private readonly dataDir = join(process.cwd(), 'apps/api/data/golden-test-sets');
  private readonly history: GoldenRunResult[] = [];

  listSets(): Array<{ cases: number; file: string; taskType: string }> {
    return readdirSync(this.dataDir)
      .filter((file) => file.endsWith('.test.json'))
      .map((file) => {
        const set = this.readSet(file);
        return { cases: set.cases.length, file, taskType: set.taskType };
      });
  }

  runGoldenSet(taskType: string): GoldenRunResult {
    const file = this.resolveFile(taskType);
    const set = this.readSet(file);
    const byCase = set.cases.map((item) => {
      const outputSignals = this.mockSignals(item);
      const expectedHits = item.expectedSignals.filter((signal) => outputSignals.includes(signal)).length;
      const forbiddenHits = item.forbiddenSignals.filter((signal) => outputSignals.includes(signal)).length;
      const precision = expectedHits / Math.max(1, outputSignals.length + forbiddenHits);
      const recall = expectedHits / Math.max(1, item.expectedSignals.length);
      const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
      return { f1: this.round(f1), id: item.id, passed: f1 >= 0.7 && forbiddenHits === 0, precision: this.round(precision), recall: this.round(recall) };
    });
    const passed = byCase.filter((item) => item.passed).length;
    const result = {
      byCase,
      f1: this.round(byCase.reduce((sum, item) => sum + item.f1, 0) / byCase.length),
      failed: byCase.length - passed,
      passed,
      precision: this.round(byCase.reduce((sum, item) => sum + item.precision, 0) / byCase.length),
      recall: this.round(byCase.reduce((sum, item) => sum + item.recall, 0) / byCase.length),
      taskType: set.taskType,
      total: byCase.length,
    };
    this.history.unshift(result);
    return result;
  }

  historySnapshot(): GoldenRunResult[] {
    return this.history;
  }

  private mockSignals(item: GoldenCase): string[] {
    return item.expectedSignals.slice(0, Math.max(1, Math.ceil(item.expectedSignals.length * 0.85)));
  }

  private readSet(file: string): GoldenSet {
    return JSON.parse(readFileSync(join(this.dataDir, file), 'utf8')) as GoldenSet;
  }

  private resolveFile(taskType: string): string {
    const normalized = taskType.toLowerCase().replaceAll('_', '-');
    const file = readdirSync(this.dataDir).find((item) => item.replace('.test.json', '') === normalized || this.readSet(item).taskType === taskType);
    if (!file) throw new Error(`GOLDEN_SET_NOT_FOUND:${taskType}`);
    return file;
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
