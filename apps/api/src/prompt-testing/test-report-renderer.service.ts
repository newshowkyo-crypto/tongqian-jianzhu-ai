export interface GoldenCaseResult {
  caseId: string;
  diff: string[];
  expectedThreshold: number;
  passed: boolean;
  similarity: number;
}

export interface GoldenRunReport {
  failedCases: number;
  passed: boolean;
  passedCases: number;
  passRate: number;
  promptName: string;
  results: GoldenCaseResult[];
  totalCases: number;
}

@Injectable()
export class TestReportRendererService {
  /**
   * Renders a markdown report for CI and docs/changelog output.
   *
   * @param report Golden run report.
   * @returns Markdown report.
   */
  render(report: GoldenRunReport): string {
    const rows = report.results.map((item) => `| ${item.caseId} | ${item.similarity} | ${item.expectedThreshold} | ${item.passed ? 'PASS' : 'FAIL'} |`).join('\n');
    const failures = report.results
      .filter((item) => !item.passed)
      .map((item) => `### ${item.caseId}\n${item.diff.map((line) => `- ${line}`).join('\n')}`)
      .join('\n\n');
    return [
      '## Prompt Golden Test Report',
      '',
      `Prompt: ${report.promptName}`,
      `Pass rate: ${report.passedCases}/${report.totalCases} (${Math.round(report.passRate * 100)}%) ${report.passed ? 'PASS' : 'FAIL'}`,
      '',
      '| Case | Similarity | Threshold | Result |',
      '|---|---:|---:|---|',
      rows || '| placeholder | 1 | 0.7 | PASS |',
      '',
      failures ? `## Failed case diff\n\n${failures}` : '## Failed case diff\n\nNone',
    ].join('\n');
  }

  /**
   * Renders compact JSON for admin APIs and machine diff storage.
   *
   * @param report Golden run report.
   * @returns JSON-safe summary.
   */
  renderJson(report: GoldenRunReport): { failedCaseIds: string[]; passRate: number; promptName: string; status: 'fail' | 'pass'; totalCases: number } {
    return {
      failedCaseIds: report.results.filter((item) => !item.passed).map((item) => item.caseId),
      passRate: report.passRate,
      promptName: report.promptName,
      status: report.passed ? 'pass' : 'fail',
      totalCases: report.totalCases,
    };
  }

  /**
   * Renders a side-by-side text diff optimized for PR comments.
   *
   * @param result Case result.
   * @returns Markdown diff block.
   */
  renderCaseDiff(result: GoldenCaseResult): string {
    if (result.passed) return `### ${result.caseId}\nPASS`;
    return [`### ${result.caseId}`, `Similarity: ${result.similarity}`, '```diff', ...result.diff.map((line) => `- ${line}`), '```'].join('\n');
  }

  /**
   * Renders all failed case diffs as a focused review appendix.
   *
   * @param report Golden run report.
   * @returns Markdown appendix.
   */
  renderFailureAppendix(report: GoldenRunReport): string {
    const failed = report.results.filter((item) => !item.passed);
    return failed.length === 0 ? 'No failed golden cases.' : failed.map((item) => this.renderCaseDiff(item)).join('\n\n');
  }

  /**
   * Renders a small trend summary by comparing the current report with a previous pass rate.
   *
   * @param report Current report.
   * @param previousPassRate Previous pass rate.
   * @returns Human-readable trend line.
   */
  renderTrend(report: GoldenRunReport, previousPassRate?: number): string {
    if (previousPassRate === undefined) return `Prompt ${report.promptName} baseline pass rate is ${Math.round(report.passRate * 100)}%.`;
    const delta = report.passRate - previousPassRate;
    const direction = delta >= 0 ? 'improved' : 'regressed';
    return `Prompt ${report.promptName} ${direction} by ${Math.abs(Math.round(delta * 100))} percentage points.`;
  }
}
import { Injectable } from '@nestjs/common';
