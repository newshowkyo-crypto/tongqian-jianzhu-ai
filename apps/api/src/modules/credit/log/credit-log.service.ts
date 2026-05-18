import { Injectable } from '@nestjs/common';

import type { CreditLog, CreditLogType } from '../credit-types.js';

@Injectable()
export class CreditLogService {
  private readonly logs: CreditLog[] = [];

  write(input: Omit<CreditLog, 'createdAt' | 'id'>): CreditLog {
    const log = { ...input, createdAt: new Date().toISOString(), id: crypto.randomUUID() };
    this.logs.push(log);
    return log;
  }

  findByIdempotencyKey(key?: string): CreditLog | undefined {
    return key ? this.logs.find((log) => log.idempotencyKey === key) : undefined;
  }

  list(accountId: string): CreditLog[] {
    return this.logs.filter((log) => log.accountId === accountId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  byType(accountId: string, type: CreditLogType): CreditLog[] {
    return this.list(accountId).filter((log) => log.type === type);
  }
}
