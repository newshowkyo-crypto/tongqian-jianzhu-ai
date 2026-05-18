import { SimilarityCalculatorService } from './similarity-calculator.service.js';
import type { GoldenRunReport } from './test-report-renderer.service.js';

export interface GoldenCase {
  expected_output: unknown;
  id: string;
  input: unknown;
  min_passing_similarity?: number;
}

export class GoldenTestRunnerService {
  constructor(private readonly similarity = new SimilarityCalculatorService()) {}

  run(promptName: string, cases: GoldenCase[], promptExecutor: (input: unknown) => unknown): GoldenRunReport {
    const results = cases.map((testCase) => {
      const actual = promptExecutor(testCase.input);
      const similarity = this.similarity.calculate(actual, testCase.expected_output);
      const expectedThreshold = testCase.min_passing_similarity ?? 0.7;
      return {
        caseId: testCase.id,
        diff: similarity >= expectedThreshold ? [] : this.diff(actual, testCase.expected_output),
        expectedThreshold,
        passed: similarity >= expectedThreshold,
        similarity,
      };
    });
    const totalCases = results.length;
    const passedCases = results.filter((item) => item.passed).length;
    const passRate = totalCases === 0 ? 1 : passedCases / totalCases;
    return { failedCases: totalCases - passedCases, passed: passRate >= 0.7, passedCases, passRate, promptName, results, totalCases };
  }

  private diff(actual: unknown, expected: unknown): string[] {
    return [`expected=${JSON.stringify(expected).slice(0, 180)}`, `actual=${JSON.stringify(actual).slice(0, 180)}`];
  }
}
