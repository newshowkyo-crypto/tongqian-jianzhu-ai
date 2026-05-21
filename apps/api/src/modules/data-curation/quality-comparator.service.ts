import { Injectable } from '@nestjs/common';

type Candidate = { content: string; id: string; score: number; source: string; title: string; type: string };

@Injectable()
export class QualityComparatorService {
  /** Selects the best item from same-type candidates and explains why it becomes golden. */
  selectBest(candidates: Candidate[]): Candidate & { decision: string; defeated: string[] } {
    if (candidates.length === 0) throw new Error('DATA_CURATION.NO_CANDIDATE');
    const ranked = [...candidates].sort((left, right) => this.weight(right) - this.weight(left));
    const best = ranked[0];
    if (!best) throw new Error('DATA_CURATION.NO_CANDIDATE');
    return { ...best, decision: '同类对比后保留权威来源、结构完整、适用建筑企业场景的最优版本', defeated: ranked.slice(1).map((item) => item.id) };
  }

  /** Groups records by type/title similarity so founder review sees one winner and a short diff. */
  groupAndCompare(candidates: Candidate[]): Array<Candidate & { decision: string; defeated: string[] }> {
    const groups = new Map<string, Candidate[]>();
    for (const item of candidates) {
      const key = item.type + ':' + item.title.replace(/[0-9第批s]/g, '').slice(0, 16);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.values()].map((items) => this.selectBest(items));
  }

  /** Builds a human readable diff for the drawer in data-center pages. */
  diff(left: Candidate, right: Candidate): Record<string, unknown> {
    return { leftOnly: this.tokens(left.content).filter((token) => !this.tokens(right.content).includes(token)).slice(0, 12), rightOnly: this.tokens(right.content).filter((token) => !this.tokens(left.content).includes(token)).slice(0, 12), scoreDelta: left.score - right.score, sourcePreference: left.source.includes('gov') ? left.source : right.source };
  }

  private weight(item: Candidate): number { return item.score + (item.source.includes('gov') ? 8 : 0) + (item.source.includes('mohurd') ? 10 : 0) + Math.min(item.content.length / 1000, 8); }
  private tokens(value: string): string[] { return [...new Set(value.split(/[，。；、s/]+/).filter((token) => token.length >= 2))]; }
}
