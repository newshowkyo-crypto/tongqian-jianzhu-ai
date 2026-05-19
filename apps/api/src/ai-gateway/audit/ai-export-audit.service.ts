import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface ExportAuditRow {
  readonly createdAt: string;
  readonly fieldCount: number;
  readonly inputHash: string;
  readonly maskedFieldCount: number;
  readonly maskedHash: string;
  readonly providerName: string;
  readonly quarter: string;
  readonly traceId: string;
}

@Injectable()
export class AiExportAuditService {
  private readonly rows: ExportAuditRow[] = [];

  write(input: { fieldCount: number; input: unknown; masked: unknown; providerName: string; traceId: string }): void {
    if (!input.traceId || !input.providerName) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { providerName: input.providerName, traceId: input.traceId },
        message: 'AI export audit requires provider and trace id.',
      });
    }
    this.rows.push({
      createdAt: new Date().toISOString(),
      fieldCount: input.fieldCount,
      inputHash: hash(input.input),
      maskedFieldCount: countMaskedFields(input.masked),
      maskedHash: hash(input.masked),
      providerName: input.providerName,
      quarter: currentQuarter(),
      traceId: input.traceId,
    });
  }

  list(): ExportAuditRow[] {
    return [...this.rows];
  }

  summarizeQuarter(quarter = currentQuarter()): { domesticCount: number; overseasCount: number; quarter: string; total: number; totalMaskedFields: number } {
    const rows = this.rows.filter((row) => row.quarter === quarter);
    return {
      domesticCount: rows.filter((row) => ['deepseek', 'aliyun-dashscope'].includes(row.providerName)).length,
      overseasCount: rows.filter((row) => !['deepseek', 'aliyun-dashscope'].includes(row.providerName)).length,
      quarter,
      total: rows.length,
      totalMaskedFields: rows.reduce((sum, row) => sum + row.maskedFieldCount, 0),
    };
  }

  buildComplianceChecklist(quarter = currentQuarter()): Array<{ item: string; status: 'pass' | 'review'; value: number | string }> {
    const summary = this.summarizeQuarter(quarter);
    return [
      { item: 'export.audit.rows', status: summary.total > 0 ? 'pass' : 'review', value: summary.total },
      { item: 'export.masked.fields', status: summary.totalMaskedFields > 0 ? 'pass' : 'review', value: summary.totalMaskedFields },
      { item: 'export.overseas.provider.count', status: summary.overseasCount === 0 ? 'pass' : 'review', value: summary.overseasCount },
      { item: 'export.domestic.provider.count', status: 'pass', value: summary.domesticCount },
    ];
  }
}

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function countMaskedFields(value: unknown): number {
  const text = JSON.stringify(value);
  return (text.match(/\[REDACTED\]|\*\*\*|MASKED/giu) ?? []).length;
}

function currentQuarter(date = new Date()): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}Q${quarter}`;
}
