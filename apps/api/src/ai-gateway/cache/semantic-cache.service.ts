import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface SemanticCacheEntry {
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly key: string;
  readonly value: unknown;
  readonly vector: number[];
}

export interface SemanticCacheHit<T> {
  readonly score: number;
  readonly source: 'dashvector' | 'mock-sqlite';
  readonly value: T;
}

const DEFAULT_THRESHOLD = 0.95;
const DEFAULT_TTL_MS = 86_400_000;

@Injectable()
export class SemanticCacheService {
  private readonly entries: SemanticCacheEntry[] = [];

  /**
   * Looks up a semantically similar cached response using DashVector-compatible cosine rules.
   *
   * @param key Cache namespace.
   * @param vector Embedding vector.
   * @param threshold Similarity threshold, default 0.95.
   * @returns Cached value when similarity is high enough.
   */
  lookup<T>(key: string, vector: number[], threshold = DEFAULT_THRESHOLD): T | undefined {
    return this.lookupWithScore<T>(key, vector, threshold)?.value;
  }

  /**
   * Looks up semantic cache and returns similarity metadata for auditing.
   *
   * @param key Cache namespace.
   * @param vector Embedding vector.
   * @param threshold Similarity threshold.
   * @returns Cache hit with score.
   */
  lookupWithScore<T>(key: string, vector: number[], threshold = DEFAULT_THRESHOLD): SemanticCacheHit<T> | undefined {
    this.assertVector(vector);
    const now = Date.now();
    let best: { entry: SemanticCacheEntry; score: number } | undefined;
    for (const entry of this.entries) {
      if (entry.expiresAt <= now || entry.key !== key) continue;
      const score = cosine(entry.vector, vector);
      if (score >= threshold && (!best || score > best.score)) best = { entry, score };
    }
    return best ? { score: Number(best.score.toFixed(4)), source: 'mock-sqlite', value: best.entry.value as T } : undefined;
  }

  /**
   * Stores semantic cache in local mock mode. Production can replace this with DashVector.
   *
   * @param key Cache namespace.
   * @param vector Embedding vector.
   * @param value Validated AI output.
   * @param ttlMs TTL in milliseconds.
   */
  set(key: string, vector: number[], value: unknown, ttlMs = DEFAULT_TTL_MS): void {
    this.assertVector(vector);
    this.entries.push({ createdAt: Date.now(), expiresAt: Date.now() + ttlMs, key, value, vector });
  }

  /**
   * Embeds short text deterministically for mock mode tests and local development.
   *
   * @param text Text to embed.
   * @returns Stable low-dimensional vector.
   */
  embedMock(text: string): number[] {
    const buckets = Array.from({ length: 16 }, () => 0);
    for (let index = 0; index < text.length; index += 1) {
      const bucket = index % buckets.length;
      buckets[bucket] = (buckets[bucket] ?? 0) + text.charCodeAt(index) / 255;
    }
    return buckets;
  }

  private assertVector(vector: number[]): void {
    if (vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { length: vector.length },
        message: 'Semantic cache vector is invalid.',
      });
    }
  }
}

function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const aNorm = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const bNorm = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return aNorm === 0 || bNorm === 0 ? 0 : dot / (aNorm * bNorm);
}
