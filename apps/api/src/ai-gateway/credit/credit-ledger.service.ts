import { Injectable } from '@nestjs/common';

interface CreditRecord {
  credits: number;
  status: 'committed' | 'precharged' | 'refunded';
}

@Injectable()
export class CreditLedgerService {
  private readonly ledger = new Map<string, CreditRecord>();

  preCharge(key: string, credits: number): CreditRecord {
    return this.ensure(key, { credits, status: 'precharged' });
  }

  commit(key: string): CreditRecord {
    const record = this.ledger.get(key);
    if (!record) throw new Error('AI.CREDIT.MISSING_PRECHARGE');
    record.status = 'committed';
    return record;
  }

  refund(key: string): CreditRecord {
    const record = this.ledger.get(key);
    if (!record) return this.ensure(key, { credits: 0, status: 'refunded' });
    record.status = 'refunded';
    return record;
  }

  private ensure(key: string, record: CreditRecord): CreditRecord {
    const existing = this.ledger.get(key);
    if (existing) return existing;
    this.ledger.set(key, record);
    return record;
  }
}
