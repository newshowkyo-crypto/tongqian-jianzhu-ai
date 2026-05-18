import { Injectable } from '@nestjs/common';
import { AiSanitizeMaskType, type SanitizedText } from '@tongqian/types';

const detectors: Array<{ pattern: RegExp; type: AiSanitizeMaskType }> = [
  { pattern: /[\w.-]+@[\w.-]+\.\w+/g, type: AiSanitizeMaskType.CONTACT },
  { pattern: /1[3-9]\d{9}/g, type: AiSanitizeMaskType.CONTACT },
  { pattern: /\d+(?:\.\d+)?\s*(?:元|万元|亿)/g, type: AiSanitizeMaskType.AMOUNT },
  { pattern: /[0-9A-HJ-NPQRTUWXY]{18}/g, type: AiSanitizeMaskType.SOCIAL_CREDIT_CODE },
  { pattern: /\d{17}[\dXx]/g, type: AiSanitizeMaskType.ID_CARD },
  { pattern: /\d{12,19}/g, type: AiSanitizeMaskType.BANK_CARD },
];

@Injectable()
export class SanitizerService {
  mask(input: unknown): SanitizedText {
    let text = typeof input === 'string' ? input : JSON.stringify(input);
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

  unmask(output: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce((text, [token, value]) => text.replaceAll(token, value), output);
  }
}
