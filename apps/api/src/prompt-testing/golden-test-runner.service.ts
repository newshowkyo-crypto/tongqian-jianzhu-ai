import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { SimilarityCalculatorService } from './similarity-calculator.service.js';
import type { GoldenRunReport } from './test-report-renderer.service.js';

export interface GoldenCase {
  expected_output: unknown;
  id: string;
  input: unknown;
  min_passing_similarity?: number;
  tier_expected?: number;
}

@Injectable()
export class GoldenTestRunnerService {
  constructor(private readonly similarity = new SimilarityCalculatorService()) {}

  /**
   * Executes a prompt golden set and returns a merge-gate report.
   *
   * @param promptName Prompt name.
   * @param cases Golden cases.
   * @param promptExecutor Prompt execution callback.
   * @returns Golden run report.
   */
  run(promptName: string, cases: GoldenCase[], promptExecutor: (input: unknown) => unknown): GoldenRunReport {
    if (!promptName) throw new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, message: 'Prompt name is required.' });
    const results = cases.map((testCase) => {
      const actual = promptExecutor(testCase.input);
      const similarity = this.similarity.calculate(actual, testCase.expected_output);
      const expectedThreshold = testCase.min_passing_similarity ?? 0.7;
      const tierPassed = this.checkTier(testCase, actual);
      return {
        caseId: testCase.id,
        diff: similarity >= expectedThreshold && tierPassed ? [] : this.diff(actual, testCase.expected_output),
        expectedThreshold,
        passed: similarity >= expectedThreshold && tierPassed,
        similarity,
      };
    });
    const totalCases = results.length;
    const passedCases = results.filter((item) => item.passed).length;
    const passRate = totalCases === 0 ? 1 : passedCases / totalCases;
    return { failedCases: totalCases - passedCases, passed: passRate >= 0.7, passedCases, passRate, promptName, results, totalCases };
  }

  /**
   * Executes one case for admin debug without running the full golden set.
   *
   * @param testCase Golden case.
   * @param promptExecutor Prompt execution callback.
   * @returns Similarity and diff.
   */
  runOne(testCase: GoldenCase, promptExecutor: (input: unknown) => unknown): { diff: string[]; passed: boolean; similarity: number } {
    const actual = promptExecutor(testCase.input);
    const similarity = this.similarity.calculate(actual, testCase.expected_output);
    const expectedThreshold = testCase.min_passing_similarity ?? 0.7;
    const passed = similarity >= expectedThreshold && this.checkTier(testCase, actual);
    return { diff: passed ? [] : this.diff(actual, testCase.expected_output), passed, similarity };
  }

  /**
   * Groups cases by tier to spot missing high-risk coverage before CI.
   *
   * @param cases Golden cases.
   * @returns Tier distribution.
   */
  coverageByTier(cases: GoldenCase[]): Record<string, number> {
    return cases.reduce<Record<string, number>>((acc, item) => {
      const key = `T${item.tier_expected ?? 'unknown'}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }

  private checkTier(testCase: GoldenCase, actual: unknown): boolean {
    if (!testCase.tier_expected) return true;
    const tier = typeof actual === 'object' && actual ? (actual as { tier?: unknown }).tier : undefined;
    return tier === testCase.tier_expected;
  }

  private diff(actual: unknown, expected: unknown): string[] {
    return [`expected=${JSON.stringify(expected).slice(0, 180)}`, `actual=${JSON.stringify(actual).slice(0, 180)}`];
  }
}
