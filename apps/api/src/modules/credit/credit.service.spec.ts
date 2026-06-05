import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';

import { BusinessError } from '@tongqian/errors';

import type { CreditLog } from './credit-types.js';
import type { AddLotArgs, CreditStore, MovementResult, PreChargeArgs, SettleArgs } from './credit.repository.js';
import { CommitService } from './preCharge/commit.service.js';
import { PreChargeService } from './preCharge/pre-charge.service.js';
import { RefundService } from './preCharge/refund.service.js';

/**
 * Faithful in-memory implementation of the {@link CreditStore} contract used by
 * the Prisma {@link CreditRepository}. It reproduces the agreed ledger
 * semantics (preCharge reserves, commit finalizes with no balance change,
 * refund releases) plus idempotency (unique log key) and tenant isolation
 * (account scoped by userId+tenantId). Real DB integration is verified manually.
 */
class InMemoryCreditStore implements CreditStore {
  private readonly accounts = new Map<string, { balance: number }>();
  private readonly logs = new Map<string, { balanceAfter: number; traceId: string }>();
  private readonly lots: Array<{ accountKey: string; remaining: number }> = [];

  private key(userId: string, tenantId: string): string {
    return `${tenantId}::${userId}`;
  }

  private ensure(userId: string, tenantId: string): { balance: number } {
    const k = this.key(userId, tenantId);
    let acc = this.accounts.get(k);
    if (!acc) {
      acc = { balance: 0 };
      this.accounts.set(k, acc);
    }
    return acc;
  }

  /** Test helper: seed credits as a lot (mirrors a gift/topup). */
  seed(userId: string, tenantId: string, amount: number): void {
    this.ensure(userId, tenantId).balance += amount;
    this.lots.push({ accountKey: this.key(userId, tenantId), remaining: amount });
  }

  async preCharge(args: PreChargeArgs): Promise<MovementResult> {
    const existing = this.logs.get(args.logKey);
    if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
    const acc = this.ensure(args.userId, args.tenantId);
    if (acc.balance < args.amount) {
      throw new BusinessError({ code: 'CREDIT.DEDUCT.INSUFFICIENT', details: { available: acc.balance, requested: args.amount }, message: 'Insufficient credit balance.' });
    }
    // FEFO consume across this account's lots.
    let remaining = args.amount;
    for (const lot of this.lots.filter((l) => l.accountKey === this.key(args.userId, args.tenantId) && l.remaining > 0)) {
      if (remaining <= 0) break;
      const take = Math.min(lot.remaining, remaining);
      lot.remaining -= take;
      remaining -= take;
    }
    acc.balance -= args.amount;
    this.logs.set(args.logKey, { balanceAfter: acc.balance, traceId: args.traceId });
    return { balanceAfter: acc.balance, replayed: false };
  }

  async commit(args: SettleArgs): Promise<MovementResult> {
    const existing = this.logs.get(args.logKey);
    if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
    const acc = this.ensure(args.userId, args.tenantId);
    // No balance change on commit.
    this.logs.set(args.logKey, { balanceAfter: acc.balance, traceId: args.traceId });
    return { balanceAfter: acc.balance, replayed: false };
  }

  async refund(args: SettleArgs): Promise<MovementResult> {
    const existing = this.logs.get(args.logKey);
    if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
    const acc = this.ensure(args.userId, args.tenantId);
    acc.balance += args.amount;
    this.lots.push({ accountKey: this.key(args.userId, args.tenantId), remaining: args.amount });
    this.logs.set(args.logKey, { balanceAfter: acc.balance, traceId: args.traceId });
    return { balanceAfter: acc.balance, replayed: false };
  }

  async addLot(args: AddLotArgs): Promise<MovementResult> {
    if (args.logKey) {
      const existing = this.logs.get(args.logKey);
      if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
    }
    const acc = this.ensure(args.userId, args.tenantId);
    acc.balance += args.amount;
    this.lots.push({ accountKey: this.key(args.userId, args.tenantId), remaining: args.amount });
    if (args.logKey) this.logs.set(args.logKey, { balanceAfter: acc.balance, traceId: args.traceId });
    return { balanceAfter: acc.balance, replayed: false };
  }

  async expire(): Promise<number> {
    return 0;
  }

  async setFrozen(): Promise<void> {
    return undefined;
  }

  async getBalance(userId: string, tenantId: string): Promise<number> {
    return this.accounts.get(this.key(userId, tenantId))?.balance ?? 0;
  }

  async listLots(): Promise<Array<Record<string, unknown>>> {
    return [];
  }

  async listLogs(): Promise<CreditLog[]> {
    return [];
  }

  async findLogByKey(logKey: string): Promise<CreditLog | null> {
    return this.logs.has(logKey) ? ({ idempotencyKey: logKey } as CreditLog) : null;
  }
}

function build(): { store: InMemoryCreditStore; preCharge: PreChargeService; commit: CommitService; refund: RefundService } {
  const store = new InMemoryCreditStore();
  return {
    store,
    preCharge: new PreChargeService(store as never),
    commit: new CommitService(store as never),
    refund: new RefundService(store as never),
  };
}

const T = 'tenant-a';
const U = 'user-1';

test('insufficient balance: preCharge throws and balance is unchanged', async () => {
  const { store, preCharge } = build();
  store.seed(U, T, 30);
  await assert.rejects(
    () => preCharge.preCharge({ amount: 100, idempotencyKey: 'k1', tenantId: T, userId: U }),
    (err: unknown) => err instanceof BusinessError,
  );
  assert.equal(await store.getBalance(U, T), 30);
});

test('happy path preCharge -> commit deducts exactly once (no double-deduct)', async () => {
  const { store, preCharge, commit } = build();
  store.seed(U, T, 500);
  const pre = await preCharge.preCharge({ amount: 100, idempotencyKey: 'unlock:1', tenantId: T, userId: U });
  assert.equal(pre.balanceAfter, 400);
  const com = await commit.commit({ amount: 100, idempotencyKey: 'unlock:1', tenantId: T, userId: U });
  assert.equal(com.committed, true);
  assert.equal(com.balanceAfter, 400); // commit does NOT deduct again
  assert.equal(await store.getBalance(U, T), 400);
});

test('preCharge -> refund restores the balance', async () => {
  const { store, preCharge, refund } = build();
  store.seed(U, T, 500);
  await preCharge.preCharge({ amount: 200, idempotencyKey: 'gen:1', tenantId: T, userId: U });
  assert.equal(await store.getBalance(U, T), 300);
  const ref = await refund.refund({ amount: 200, idempotencyKey: 'gen:1', tenantId: T, userId: U });
  assert.equal(ref.refunded, true);
  assert.equal(ref.balanceAfter, 500);
  assert.equal(await store.getBalance(U, T), 500);
});

test('duplicate idempotencyKey does not deduct twice (idempotent replay)', async () => {
  const { store, preCharge } = build();
  store.seed(U, T, 500);
  const first = await preCharge.preCharge({ amount: 100, idempotencyKey: 'dup', tenantId: T, userId: U });
  const second = await preCharge.preCharge({ amount: 100, idempotencyKey: 'dup', tenantId: T, userId: U });
  assert.equal(first.balanceAfter, 400);
  assert.equal(second.balanceAfter, 400); // replay, no second deduction
  assert.equal(await store.getBalance(U, T), 400);
});

test('tenant isolation: a charge under one tenant cannot draw from another tenant balance', async () => {
  const { store, preCharge } = build();
  store.seed(U, 'tenant-a', 500); // only tenant-a funded
  // same userId under tenant-b has no balance -> insufficient
  await assert.rejects(
    () => preCharge.preCharge({ amount: 100, idempotencyKey: 'x', tenantId: 'tenant-b', userId: U }),
    (err: unknown) => err instanceof BusinessError,
  );
  assert.equal(await store.getBalance(U, 'tenant-a'), 500); // tenant-a untouched
  assert.equal(await store.getBalance(U, 'tenant-b'), 0);
});

test('amount validation: non-positive preCharge / commit / refund are rejected', async () => {
  const { preCharge, commit, refund } = build();
  await assert.rejects(() => preCharge.preCharge({ amount: 0, idempotencyKey: 'z', tenantId: T, userId: U }), BusinessError);
  await assert.rejects(() => commit.commit({ amount: -5, idempotencyKey: 'z', tenantId: T, userId: U }), BusinessError);
  await assert.rejects(() => refund.refund({ amount: 0, idempotencyKey: 'z', tenantId: T, userId: U }), BusinessError);
});
