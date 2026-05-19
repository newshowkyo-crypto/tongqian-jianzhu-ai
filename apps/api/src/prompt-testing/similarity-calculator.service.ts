import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { EmbeddingCacheService } from './embedding-cache.service.js';

@Injectable()
export class SimilarityCalculatorService {
  constructor(private readonly cache = new EmbeddingCacheService()) {}

  /**
   * Calculates cosine similarity between expected and actual prompt outputs.
   *
   * @param actual Actual output.
   * @param expected Expected output.
   * @returns Similarity score from 0 to 1.
   */
  calculate(actual: unknown, expected: unknown): number {
    const actualEmbedding = this.cache.embed(this.stringifyForComparison(actual)).embedding;
    const expectedEmbedding = this.cache.embed(this.stringifyForComparison(expected)).embedding;
    if (actualEmbedding.length !== expectedEmbedding.length) {
      throw new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, message: 'Embedding dimensions do not match.' });
    }
    const dot = actualEmbedding.reduce((sum, value, index) => sum + value * (expectedEmbedding[index] ?? 0), 0);
    const actualNorm = Math.hypot(...actualEmbedding) || 1;
    const expectedNorm = Math.hypot(...expectedEmbedding) || 1;
    return Number((dot / (actualNorm * expectedNorm)).toFixed(4));
  }

  /**
   * Normalizes arbitrary JSON for stable comparison.
   *
   * @param value Value to stringify.
   * @returns Stable string.
   */
  stringifyForComparison(value: unknown): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return String(value ?? '');
    return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());
  }

  /**
   * Calculates per-field similarity for object-like outputs.
   *
   * @param actual Actual object.
   * @param expected Expected object.
   * @returns Field score map.
   */
  fieldScores(actual: Record<string, unknown>, expected: Record<string, unknown>): Record<string, number> {
    const keys = [...new Set([...Object.keys(actual), ...Object.keys(expected)])].sort();
    return Object.fromEntries(keys.map((key) => [key, this.calculate(actual[key], expected[key])]));
  }

  /**
   * Checks whether a score satisfies a prompt threshold.
   *
   * @param actual Actual output.
   * @param expected Expected output.
   * @param threshold Passing threshold.
   * @returns Decision.
   */
  passes(actual: unknown, expected: unknown, threshold = 0.7): { passed: boolean; similarity: number; threshold: number } {
    const similarity = this.calculate(actual, expected);
    return { passed: similarity >= threshold, similarity, threshold };
  }

  /**
   * Builds short diagnostics for PR comments.
   *
   * @param actual Actual output.
   * @param expected Expected output.
   * @returns Diagnostics.
   */
  diagnostics(actual: unknown, expected: unknown): { actualLength: number; expectedLength: number; similarity: number } {
    const actualText = this.stringifyForComparison(actual);
    const expectedText = this.stringifyForComparison(expected);
    return { actualLength: actualText.length, expectedLength: expectedText.length, similarity: this.calculate(actualText, expectedText) };
  }
}
