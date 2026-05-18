import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AiExportAuditService {
  private readonly rows: Array<Record<string, unknown>> = [];

  write(input: { fieldCount: number; input: unknown; masked: unknown; providerName: string; traceId: string }): void {
    this.rows.push({
      fieldCount: input.fieldCount,
      inputHash: hash(input.input),
      maskedHash: hash(input.masked),
      providerName: input.providerName,
      traceId: input.traceId,
    });
  }

  list(): Array<Record<string, unknown>> {
    return [...this.rows];
  }
}

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
