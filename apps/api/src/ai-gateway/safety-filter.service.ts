import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

const blocked = ['必须', '一定', '绝对'];
const sensitivePatterns = [/1[3-9]\d{9}/u, /\d{17}[\dXx]/u, /sk-[A-Za-z0-9_-]{12,}/u];

export interface SafetyCheckResult {
  readonly blocked: boolean;
  readonly findings: string[];
  readonly redactedText: string;
}

@Injectable()
export class SafetyFilterService {
  /**
   * Checks AI output against M3.7 language and leakage redlines.
   *
   * @param output Parsed model output.
   * @throws BusinessError when output contains absolute wording or sensitive leakage.
   */
  check(output: unknown): void {
    const result = this.inspect(output);
    if (result.blocked) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { findings: result.findings },
        message: 'AI output safety check failed.',
      });
    }
  }

  /**
   * Inspects content without throwing so tests and admin previews can render diagnostics.
   *
   * @param output Parsed or raw AI output.
   * @returns Findings and redacted output text.
   */
  inspect(output: unknown): SafetyCheckResult {
    const text = JSON.stringify(output);
    const findings = [
      ...blocked.filter((word) => text.includes(word)).map((word) => `absolute-word:${word}`),
      ...sensitivePatterns.filter((pattern) => pattern.test(text)).map((pattern) => `sensitive-pattern:${pattern.source}`),
    ];
    return {
      blocked: findings.length > 0,
      findings,
      redactedText: this.redact(text),
    };
  }

  /**
   * Rewrites forbidden absolute wording into softer product-approved language.
   *
   * @param text AI output text.
   * @returns A softer text useful for prompt repair attempts.
   */
  softenAbsoluteWording(text: string): string {
    return text
      .replaceAll('必须', '建议关注')
      .replaceAll('一定', '通常做法')
      .replaceAll('绝对', '参考行业惯例');
  }

  private redact(text: string): string {
    let redacted = text;
    for (const pattern of sensitivePatterns) {
      redacted = redacted.replace(pattern, '[REDACTED]');
    }
    return redacted;
  }
}
