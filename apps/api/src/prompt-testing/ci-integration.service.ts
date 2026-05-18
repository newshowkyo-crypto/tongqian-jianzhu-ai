import type { GoldenRunReport } from './test-report-renderer.service.js';
import { TestReportRendererService } from './test-report-renderer.service.js';

export class CiIntegrationService {
  constructor(private readonly renderer = new TestReportRendererService()) {}

  summarize(report: GoldenRunReport): { mergeAllowed: boolean; prComment: string } {
    return {
      mergeAllowed: report.passed,
      prComment: this.renderer.render(report),
    };
  }
}
