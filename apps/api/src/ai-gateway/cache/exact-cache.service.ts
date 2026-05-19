import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface ExactCacheEntry {
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly inputHash: string;
  readonly taskType: string;
  readonly value: unknown;
}

export interface ExactCacheAudit {
  readonly action: 'AI_EXACT_CACHE_HIT' | 'AI_EXACT_CACHE_MISS' | 'AI_EXACT_CACHE_SET';
  readonly cacheKey: string;
  readonly taskType: string;
  readonly ttlSeconds: number;
}

const DEFAULT_TTL_SECONDS = 86_400;

@Injectable()
export class ExactCacheService {
  private readonly cache = new Map<string, ExactCacheEntry>();
  private hits = 0;
  private misses = 0;
  private writes = 0;

  /**
   * Builds a deterministic tenant-safe cache key from task type and input hash.
   *
   * @param taskType AI task type.
   * @param input Sanitized or original input.
   * @returns Cache key.
   */
  getKey(taskType: string, input: unknown): string {
    const inputHash = this.hashInput(input);
    return `ai:cache:${taskType}:${inputHash}`;
  }

  /**
   * Looks up exact-cache output and automatically evicts expired entries.
   *
   * @param taskType AI task type.
   * @param input Request input.
   * @returns Cached value when available and fresh.
   */
  lookup<T>(taskType: string, input: unknown): T | undefined {
    const key = this.getKey(taskType, input);
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return entry.value as T;
  }

  /**
   * Stores exact-cache value with a bounded TTL.
   *
   * @param taskType AI task type.
   * @param input Request input.
   * @param value Validated AI response.
   * @param ttlSeconds TTL in seconds.
   */
  set(taskType: string, input: unknown, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): void {
    if (ttlSeconds <= 0) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { taskType, ttlSeconds },
        message: 'Exact cache TTL must be positive.',
      });
    }
    const key = this.getKey(taskType, input);
    const createdAt = Date.now();
    this.cache.set(key, {
      createdAt,
      expiresAt: createdAt + ttlSeconds * 1000,
      inputHash: this.hashInput(input),
      taskType,
      value,
    });
    this.writes += 1;
  }

  /**
   * Builds an audit-safe cache event without storing raw input.
   *
   * @param taskType AI task type.
   * @param input Request input.
   * @param hit Whether lookup hit.
   * @returns Audit event.
   */
  toAudit(taskType: string, input: unknown, hit: boolean): ExactCacheAudit {
    return {
      action: hit ? 'AI_EXACT_CACHE_HIT' : 'AI_EXACT_CACHE_MISS',
      cacheKey: this.getKey(taskType, input),
      taskType,
      ttlSeconds: DEFAULT_TTL_SECONDS,
    };
  }

  /**
   * Returns hit-rate telemetry for admin diagnostics without exposing cached payloads.
   *
   * @returns Exact cache size, hit rate, and write count.
   */
  metrics(): { entries: number; hitRate: number; hits: number; misses: number; writes: number } {
    const totalReads = this.hits + this.misses;
    return {
      entries: this.cache.size,
      hitRate: totalReads === 0 ? 0 : Number((this.hits / totalReads).toFixed(4)),
      hits: this.hits,
      misses: this.misses,
      writes: this.writes,
    };
  }

  private hashInput(input: unknown): string {
    return createHash('sha256').update(JSON.stringify(input)).digest('hex');
  }
}
