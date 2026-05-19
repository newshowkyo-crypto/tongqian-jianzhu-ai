import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface CachedEmbedding {
  embedding: number[];
  expiresAt: string;
  model: 'mock-local-hash' | 'text-embedding-3-small' | 'text-embedding-v2';
  textHash: string;
}

@Injectable()
export class EmbeddingCacheService {
  private readonly cache = new Map<string, CachedEmbedding>();
  private readonly ttlMs = 86_400_000;

  /**
   * Returns a cached embedding or creates a deterministic local mock embedding.
   *
   * @param text Text to embed.
   * @param model Embedding model id.
   * @returns Cached embedding.
   */
  embed(text: string, model: CachedEmbedding['model'] = 'mock-local-hash'): CachedEmbedding {
    if (!text) throw new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, message: 'Embedding text is required.' });
    const textHash = this.hash(text);
    const current = this.cache.get(textHash);
    if (current && new Date(current.expiresAt).getTime() > Date.now()) return current;
    const embedding = this.localEmbedding(text);
    const next = { embedding, expiresAt: new Date(Date.now() + this.ttlMs).toISOString(), model, textHash };
    this.cache.set(textHash, next);
    return next;
  }

  /**
   * Reads an embedding from cache without refreshing TTL.
   *
   * @param text Text to look up.
   * @returns Cached embedding when present and fresh.
   */
  get(text: string): CachedEmbedding | undefined {
    const current = this.cache.get(this.hash(text));
    if (!current || new Date(current.expiresAt).getTime() <= Date.now()) return undefined;
    return current;
  }

  /**
   * Removes expired cache entries.
   *
   * @param now Current time.
   * @returns Number of evicted records.
   */
  prune(now = new Date()): number {
    let removed = 0;
    for (const [key, value] of this.cache.entries()) {
      if (new Date(value.expiresAt) <= now) {
        this.cache.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  /**
   * Returns cache statistics for CI logs.
   *
   * @returns Cache stats.
   */
  stats(): { dimension: number; entries: number; ttlHours: number } {
    return { dimension: 32, entries: this.cache.size, ttlHours: this.ttlMs / 3_600_000 };
  }

  /**
   * Builds audit metadata for prompt-testing cache use.
   *
   * @returns Audit row.
   */
  toAudit(): Record<string, number | string> {
    const stats = this.stats();
    return { action: 'PROMPT_EMBEDDING_CACHE', dimension: stats.dimension, entries: stats.entries, ttlHours: stats.ttlHours };
  }

  private localEmbedding(text: string): number[] {
    const buckets = Array.from({ length: 32 }, () => 0);
    [...text.toLowerCase()].forEach((char, index) => {
      const bucketIndex = (char.charCodeAt(0) + index) % buckets.length;
      buckets[bucketIndex] = (buckets[bucketIndex] ?? 0) + 1;
    });
    const norm = Math.hypot(...buckets) || 1;
    return buckets.map((value) => value / norm);
  }

  private hash(text: string): string {
    return [...text].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 5381).toString(16);
  }
}
