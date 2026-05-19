import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiSanitizeMaskType, type SanitizedText } from '@tongqian/types';

const detectors: Array<{ pattern: RegExp; type: AiSanitizeMaskType }> = [
  { pattern: /[\w.-]+@[\w.-]+\.\w+/g, type: AiSanitizeMaskType.CONTACT },
  { pattern: /1[3-9]\d{9}/g, type: AiSanitizeMaskType.CONTACT },
  { pattern: /\d+(?:\.\d+)?\s*(?:元|万元|亿)/g, type: AiSanitizeMaskType.AMOUNT },
  { pattern: /[0-9A-HJ-NPQRTUWXY]{18}/g, type: AiSanitizeMaskType.SOCIAL_CREDIT_CODE },
  { pattern: /\d{17}[\dXx]/g, type: AiSanitizeMaskType.ID_CARD },
  { pattern: /\d{12,19}/g, type: AiSanitizeMaskType.BANK_CARD },
];

export interface SanitizerAudit {
  readonly action: 'AI_INPUT_MASKED' | 'AI_OUTPUT_UNMASKED';
  readonly fieldCount: number;
  readonly maskTypes: readonly AiSanitizeMaskType[];
  readonly preview: string;
}

@Injectable()
export class SanitizerService {
  /**
   * Masks sensitive construction-business input before provider invocation.
   *
   * @param input Raw request input.
   * @returns Masked text, replacement map, and detected mask types.
   */
  mask(input: unknown): SanitizedText {
    let text = this.stringifyInput(input);
    const replacements: Record<string, string> = {};
    const maskTypes = new Set<AiSanitizeMaskType>();
    let count = 0;

    for (const detector of detectors) {
      text = text.replace(detector.pattern, (match) => {
        const token = `{${detector.type.toUpperCase()}_${count++}}`;
        replacements[token] = match;
        maskTypes.add(detector.type);
        return token;
      });
    }

    return { masked: text, maskTypes: [...maskTypes], replacements };
  }

  /**
   * Restores placeholders in a provider response after validation.
   *
   * @param output Provider output string.
   * @param replacements Replacement map returned by `mask`.
   * @returns Restored output.
   */
  unmask(output: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce((text, [token, value]) => text.replaceAll(token, value), output);
  }

  /**
   * Builds a sanitized audit event that never stores raw sensitive values.
   *
   * @param sanitized Sanitized text result.
   * @returns Audit-safe payload.
   */
  toAudit(sanitized: SanitizedText): SanitizerAudit {
    return {
      action: 'AI_INPUT_MASKED',
      fieldCount: Object.keys(sanitized.replacements).length,
      maskTypes: sanitized.maskTypes,
      preview: sanitized.masked.slice(0, 160),
    };
  }

  /**
   * Checks whether a string still appears to contain common sensitive data.
   *
   * @param text Text to inspect.
   * @returns True when no detector matches.
   */
  isClean(text: string): boolean {
    return detectors.every((detector) => !new RegExp(detector.pattern.source, detector.pattern.flags.replace('g', '')).test(text));
  }

  private stringifyInput(input: unknown): string {
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input);
    } catch (cause) {
      throw new BusinessError({
        cause,
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        message: 'AI sanitizer could not serialize input.',
      });
    }
  }
}
