export interface CachedEmbedding {
  embedding: number[];
  expiresAt: string;
  model: 'mock-local-hash' | 'text-embedding-3-small' | 'text-embedding-v2';
  textHash: string;
}

export class EmbeddingCacheService {
  private readonly cache = new Map<string, CachedEmbedding>();
  private readonly ttlMs = 86_400_000;

  embed(text: string, model: CachedEmbedding['model'] = 'mock-local-hash'): CachedEmbedding {
    const textHash = this.hash(text);
    const current = this.cache.get(textHash);
    if (current && new Date(current.expiresAt).getTime() > Date.now()) return current;
    const embedding = this.localEmbedding(text);
    const next = { embedding, expiresAt: new Date(Date.now() + this.ttlMs).toISOString(), model, textHash };
    this.cache.set(textHash, next);
    return next;
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
