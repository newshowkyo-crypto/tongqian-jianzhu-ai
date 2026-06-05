import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

interface RedFlagRule {
  category: string;
  defaultBenchmark: string;
  id: string;
  keywords?: string[];
  regex?: string;
  riskLevel: 'green' | 'red' | 'yellow';
  suggestion: string;
  title: string;
}

@Injectable()
export class RedFlagScanService {
  // Resolve the rule set relative to this source file so the path is independent
  // of process.cwd(). The layout (apps/api/{src,dist}/modules/risk-review) keeps
  // this offset valid for both tsx (src) and compiled (dist) execution.
  private readonly rules: RedFlagRule[] = JSON.parse(
    readFileSync(join(__dirname, '../../../data/contract-red-flags/zh-CN-construction.json'), 'utf8'),
  ) as RedFlagRule[];

  scan(contractText: string): { flags: Array<{ evidence?: string; hit: boolean; id: string; location?: number; suggestion: string; title: string }> } {
    const flags = this.rules.map((rule) => {
      const regexHit = rule.regex ? new RegExp(rule.regex, 'u').exec(contractText) : null;
      const keyword = rule.keywords?.find((item) => contractText.includes(item));
      const location = regexHit?.index ?? (keyword ? contractText.indexOf(keyword) : undefined);
      return { evidence: location === undefined ? undefined : contractText.slice(Math.max(0, location - 20), location + 60), hit: location !== undefined, id: rule.id, location, suggestion: rule.suggestion, title: rule.title };
    });
    return { flags };
  }

  categories(): Record<string, number> {
    return this.rules.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.category]: (acc[item.category] ?? 0) + 1 }), {});
  }
}
