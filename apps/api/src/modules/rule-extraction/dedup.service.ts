import { Injectable } from '@nestjs/common';

export interface RuleLike {
  id: string;
  text: string;
}

export interface DedupDecision {
  action: 'create_new' | 'merge_version';
  matchedRuleId?: string;
  similarity: number;
  threshold: number;
}

@Injectable()
export class DedupService {
  readonly threshold = 0.85;

  decide(candidate: RuleLike, existing: RuleLike[]): DedupDecision {
    const best = existing
      .map((rule) => ({ id: rule.id, similarity: this.jaccard(candidate.text, rule.text) }))
      .sort((left, right) => right.similarity - left.similarity)[0];
    if (best && best.similarity >= this.threshold) {
      return { action: 'merge_version', matchedRuleId: best.id, similarity: best.similarity, threshold: this.threshold };
    }
    return { action: 'create_new', similarity: best?.similarity ?? 0, threshold: this.threshold };
  }

  simhash(text: string): bigint {
    const tokens = this.tokens(text);
    const vector = Array.from({ length: 64 }, () => 0);
    for (const token of tokens) {
      const hash = this.hash(token);
      for (let bit = 0; bit < 64; bit++) vector[bit] = (vector[bit] ?? 0) + ((hash >> BigInt(bit)) & 1n ? 1 : -1);
    }
    return vector.reduce((result, value, index) => (value > 0 ? result | (1n << BigInt(index)) : result), 0n);
  }

  private jaccard(left: string, right: string): number {
    const a = new Set(this.tokens(left));
    const b = new Set(this.tokens(right));
    const intersection = [...a].filter((token) => b.has(token)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private tokens(text: string): string[] {
    return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1);
  }

  private hash(token: string): bigint {
    let value = 1469598103934665603n;
    for (const char of token) value = (value ^ BigInt(char.charCodeAt(0))) * 1099511628211n;
    return value;
  }
}
