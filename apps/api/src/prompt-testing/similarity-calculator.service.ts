import { EmbeddingCacheService } from './embedding-cache.service.js';

export class SimilarityCalculatorService {
  constructor(private readonly cache = new EmbeddingCacheService()) {}

  calculate(actual: unknown, expected: unknown): number {
    const actualEmbedding = this.cache.embed(this.stringifyForComparison(actual)).embedding;
    const expectedEmbedding = this.cache.embed(this.stringifyForComparison(expected)).embedding;
    const dot = actualEmbedding.reduce((sum, value, index) => sum + value * (expectedEmbedding[index] ?? 0), 0);
    const actualNorm = Math.hypot(...actualEmbedding) || 1;
    const expectedNorm = Math.hypot(...expectedEmbedding) || 1;
    return Number((dot / (actualNorm * expectedNorm)).toFixed(4));
  }

  stringifyForComparison(value: unknown): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return String(value ?? '');
    return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());
  }
}
