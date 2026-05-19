import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { RequiredElementsSchema, type RequiredElements } from '@tongqian/types';
import type { z } from 'zod';

export interface OutputValidationReport<T extends RequiredElements> {
  readonly data: T;
  readonly missingFields: string[];
  readonly repaired: boolean;
  readonly schemaName: string;
}

const requiredKeys = ['disclaimer', 'tier', 'confidence', 'nextStepHint', 'nextStepButtons'] as const;

@Injectable()
export class OutputValidatorService {
  /**
   * Validates model output against the platform required-elements contract.
   *
   * @param output Parsed model output.
   * @returns Typed output.
   * @throws BusinessError when required report elements are missing.
   */
  validate<T extends RequiredElements>(output: unknown): T {
    return this.validateWithReport<T>(output).data;
  }

  /**
   * Validates and returns diagnostics for audit logs and prompt testing.
   *
   * @param output Parsed model output.
   * @returns Validation report.
   */
  validateWithReport<T extends RequiredElements>(output: unknown): OutputValidationReport<T> {
    const repaired = this.repairCommonShape(output);
    const parsed = RequiredElementsSchema.passthrough().safeParse(repaired.value);
    if (!parsed.success) {
      throw this.toBusinessError(parsed.error, repaired.value);
    }
    return {
      data: parsed.data as T,
      missingFields: this.findMissingFields(repaired.value),
      repaired: repaired.repaired,
      schemaName: 'RequiredElementsSchema',
    };
  }

  /**
   * Checks whether output already satisfies required elements without throwing.
   *
   * @param output Parsed model output.
   * @returns True when schema validation succeeds.
   */
  isValid(output: unknown): boolean {
    return RequiredElementsSchema.passthrough().safeParse(output).success;
  }

  private findMissingFields(output: unknown): string[] {
    if (!output || typeof output !== 'object') return [...requiredKeys];
    const record = output as Record<string, unknown>;
    return requiredKeys.filter((key) => record[key] === undefined);
  }

  private repairCommonShape(output: unknown): { repaired: boolean; value: unknown } {
    if (!output || typeof output !== 'object') return { repaired: false, value: output };
    const record = { ...(output as Record<string, unknown>) };
    let repaired = false;
    if (typeof record.disclaimer !== 'string') {
      record.disclaimer = '本报告由 AI 生成，仅作为经营决策参考，不构成正式法律、财务或投资意见。';
      repaired = true;
    }
    if (!Array.isArray(record.nextStepButtons)) {
      record.nextStepButtons = [];
      repaired = true;
    }
    return { repaired, value: record };
  }

  private toBusinessError(error: z.ZodError, output: unknown): BusinessError {
    return new BusinessError({
      code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
      details: {
        issues: error.issues.map((issue) => ({ message: issue.message, path: issue.path.join('.') })),
        missingFields: this.findMissingFields(output),
      },
      message: 'AI output does not match required platform schema.',
    });
  }
}
