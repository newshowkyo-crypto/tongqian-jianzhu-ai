import { Injectable } from '@nestjs/common';

export interface TimelinessInput {
  ageInDays: number;
  base?: number;
  similarRulesCount: number;
  sourceAuthority: number;
}

@Injectable()
export class TimelinessService {
  score(input: TimelinessInput): number {
    const base = input.base ?? 50;
    return Math.max(0, Math.min(100, Math.round(base + 30 / (input.ageInDays + 1) + input.sourceAuthority * 20 - input.similarRulesCount * 5)));
  }

  sourceAuthority(sourceName: string): number {
    if (sourceName.includes('mohurd') || sourceName.includes('wenshu')) return 1.0;
    if (sourceName.includes('province')) return 0.8;
    if (sourceName.includes('cebpubservice')) return 0.6;
    return 0.85;
  }

  rescoreCandidates<T extends { createdAt: string; sourceName: string }>(items: T[]): Array<T & { timeliness_score: number }> {
    const now = Date.now();
    return items.map((item) => {
      const ageInDays = Math.max(0, Math.floor((now - new Date(item.createdAt).getTime()) / 86_400_000));
      return { ...item, timeliness_score: this.score({ ageInDays, similarRulesCount: 0, sourceAuthority: this.sourceAuthority(item.sourceName) }) };
    });
  }
}
