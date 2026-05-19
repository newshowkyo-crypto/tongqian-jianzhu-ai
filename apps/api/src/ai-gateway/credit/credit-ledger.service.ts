import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface CreditRecord {
  credits: number;
  idempotencyKey: string;
  traceId?: string;
  status: 'committed' | 'precharged' | 'refunded';
}

export interface CreditAudit {
  readonly action: 'AI_CREDIT_COMMIT' | 'AI_CREDIT_PRECHARGE' | 'AI_CREDIT_REFUND';
  readonly credits: number;
  readonly idempotencyKey: string;
  readonly status: CreditRecord['status'];
  readonly traceId?: string;
}

@Injectable()
export class CreditLedgerService {
  private readonly ledger = new Map<string, CreditRecord>();

  /**
   * Creates an idempotent pre-charge record before provider invocation.
   *
   * @param key Idempotency key.
   * @param credits Credits to reserve.
   * @param traceId Optional trace id.
   * @returns Existing or new credit record.
   */
  preCharge(key: string, credits: number, traceId?: string): CreditRecord {
    this.assertKey(key);
    if (credits <= 0) {
      throw new BusinessError({
        code: ErrorCodes.CREDIT_INSUFFICIENT.code,
        details: { credits },
        message: 'AI pre-charge credits must be positive.',
      });
    }
    return this.ensure(key, { credits, idempotencyKey: key, status: 'precharged', traceId });
  }

  /**
   * Commits a previously pre-charged credit reservation.
   *
   * @param key Idempotency key.
   * @returns Committed record.
   */
  commit(key: string): CreditRecord {
    this.assertKey(key);
    const record = this.ledger.get(key);
    if (!record) {
      throw new BusinessError({
        code: ErrorCodes.CREDIT_INSUFFICIENT.code,
        details: { key },
        message: 'AI credit commit requires a pre-charge record.',
      });
    }
    if (record.status === 'refunded') return record;
    record.status = 'committed';
    return record;
  }

  /**
   * Refunds a pre-charged record when cache hits or provider errors occur.
   *
   * @param key Idempotency key.
   * @returns Refunded record.
   */
  refund(key: string): CreditRecord {
    this.assertKey(key);
    const record = this.ledger.get(key);
    if (!record) return this.ensure(key, { credits: 0, idempotencyKey: key, status: 'refunded' });
    record.status = 'refunded';
    return record;
  }

  /**
   * Converts credit state into an audit event.
   *
   * @param record Credit ledger record.
   * @returns Audit-safe event.
   */
  toAudit(record: CreditRecord): CreditAudit {
    const action =
      record.status === 'committed' ? 'AI_CREDIT_COMMIT' : record.status === 'refunded' ? 'AI_CREDIT_REFUND' : 'AI_CREDIT_PRECHARGE';
    return {
      action,
      credits: record.credits,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      traceId: record.traceId,
    };
  }

  private ensure(key: string, record: CreditRecord): CreditRecord {
    const existing = this.ledger.get(key);
    if (existing) return existing;
    this.ledger.set(key, record);
    return record;
  }

  private assertKey(key: string): void {
    if (!key || key.length < 8) {
      throw new BusinessError({
        code: ErrorCodes.CREDIT_INSUFFICIENT.code,
        details: { keyLength: key.length },
        message: 'AI credit idempotency key is invalid.',
      });
    }
  }
}
