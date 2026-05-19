import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { GoldenRunReport } from './test-report-renderer.service.js';
import { TestReportRendererService } from './test-report-renderer.service.js';

@Injectable()
export class CiIntegrationService {
  constructor(private readonly renderer = new TestReportRendererService()) {}

  /**
   * Summarizes prompt golden-test results for CI merge checks.
   *
   * @param report Golden run report.
   * @returns Merge decision and pull request comment.
   */
  summarize(report: GoldenRunReport): { mergeAllowed: boolean; prComment: string } {
    this.validate(report);
    return {
      mergeAllowed: report.passed,
      prComment: this.renderer.render(report),
    };
  }

  /**
   * Builds a GitHub-style check run conclusion from a prompt report.
   *
   * @param report Golden run report.
   * @returns Check run payload.
   */
  checkRun(report: GoldenRunReport): { conclusion: 'failure' | 'success'; name: string; summary: string; title: string } {
    const summary = this.summarize(report);
    return {
      conclusion: summary.mergeAllowed ? 'success' : 'failure',
      name: `prompt-golden/${report.promptName}`,
      summary: summary.prComment,
      title: summary.mergeAllowed ? 'Prompt golden tests passed' : 'Prompt golden tests require review',
    };
  }

  /**
   * Decides whether the pull request should be blocked.
   *
   * @param report Golden run report.
   * @param minPassRate Minimum pass rate.
   * @returns Block decision.
   */
  shouldBlockMerge(report: GoldenRunReport, minPassRate = 0.75): { block: boolean; reason: string } {
    this.validate(report);
    if (report.passRate < minPassRate) return { block: true, reason: 'pass-rate-below-threshold' };
    if (!report.passed) return { block: true, reason: 'report-marked-failed' };
    return { block: false, reason: 'golden-set-pass' };
  }

  /**
   * Builds audit metadata for CI decisions.
   *
   * @param report Golden run report.
   * @param pullRequestId Pull request id.
   * @returns Audit row.
   */
  toAudit(report: GoldenRunReport, pullRequestId: string): Record<string, number | string> {
    const decision = this.shouldBlockMerge(report);
    return {
      action: 'PROMPT_CI_GATE',
      failedCases: report.failedCases,
      passRate: report.passRate,
      promptName: report.promptName,
      pullRequestId,
      reason: decision.reason,
      totalCases: report.totalCases,
    };
  }

  /**
   * Builds a PR comment payload with a short summary and failed-case appendix.
   *
   * @param report Golden run report.
   * @param pullRequestId Pull request id.
   * @returns PR comment payload.
   */
  prCommentPayload(report: GoldenRunReport, pullRequestId: string): { body: string; pullRequestId: string; updateExisting: boolean } {
    const decision = this.shouldBlockMerge(report);
    return {
      body: [`<!-- tongqian-prompt-golden:${report.promptName} -->`, this.renderer.render(report), '', `Merge gate: ${decision.block ? 'blocked' : 'allowed'} (${decision.reason})`].join('\n'),
      pullRequestId,
      updateExisting: true,
    };
  }

  /**
   * Builds a merge gate result with required status context.
   *
   * @param report Golden run report.
   * @returns Merge gate context.
   */
  mergeGate(report: GoldenRunReport): { context: string; required: boolean; state: 'failure' | 'success'; targetUrl?: string } {
    const block = this.shouldBlockMerge(report);
    return {
      context: `tongqian/prompt-golden/${report.promptName}`,
      required: true,
      state: block.block ? 'failure' : 'success',
      targetUrl: `https://ci.local/prompts/${encodeURIComponent(report.promptName)}`,
    };
  }

  private validate(report: GoldenRunReport): void {
    if (!report.promptName || report.totalCases < 0 || report.passRate < 0 || report.passRate > 1) {
      throw new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, message: 'Prompt CI report is invalid.' });
    }
  }
}
