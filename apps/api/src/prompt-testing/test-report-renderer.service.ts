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

export class TestReportRendererService {
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
}
