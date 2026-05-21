import { Injectable } from '@nestjs/common';

type DuplicateInput = { content: string; id: string; title: string; type: string };

@Injectable()
export class DuplicateDetectorService {
  /** Treats cosine-like token similarity >= 0.85 as duplicate in mock DashVector mode. */
  findDuplicates(items: DuplicateInput[]): Array<{ duplicateId: string; masterId: string; similarity: number }> {
    const pairs: Array<{ duplicateId: string; masterId: string; similarity: number }> = [];
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const left = items[i];
        const right = items[j];
        if (!left || !right || left.type !== right.type) continue;
        const similarity = this.similarity(left.content + left.title, right.content + right.title);
        if (similarity >= 0.85) pairs.push({ duplicateId: right.id, masterId: left.id, similarity });
      }
    }
    return pairs;
  }

  /** Returns true when a new item should be skipped during streaming CSV import. */
  shouldSkip(candidate: DuplicateInput, existing: DuplicateInput[]): { masterId?: string; similarity: number; skip: boolean } {
    const ranked = existing.map((item) => ({ item, similarity: this.similarity(candidate.content + candidate.title, item.content + item.title) })).sort((a, b) => b.similarity - a.similarity);
    const best = ranked[0];
    return { masterId: best?.item.id, similarity: best?.similarity ?? 0, skip: (best?.similarity ?? 0) >= 0.85 };
  }

  /** Provides a deterministic embedding substitute until DashVector real key is enabled. */
  mockEmbedding(text: string): number[] { const tokens = this.tokens(text); return Array.from({ length: 16 }, (_, index) => tokens.reduce((sum, token) => sum + (token.charCodeAt(index % token.length) || 0), 0) % 997 / 997); }

  private similarity(a: string, b: string): number {
    const left = new Set(this.tokens(a));
    const right = new Set(this.tokens(b));
    const union = new Set([...left, ...right]);
    const intersection = [...left].filter((token) => right.has(token));
    return union.size === 0 ? 0 : intersection.length / union.size;
  }

  private tokens(text: string): string[] { return text.toLowerCase().split(/[，。；、s/()（）:：-]+/).filter((token) => token.length >= 2); }
}
