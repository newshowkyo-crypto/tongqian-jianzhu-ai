import assert from 'node:assert/strict';
import test from 'node:test';

import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { DiscountRebateService } from './discount-rebate.service.js';

// Happy path: five-stage ladder resolves the documented discount rates and
// converts a discounted monthly price into rebate credits.
test('DiscountRebateService resolves ladder rates and rebate credits (happy path)', () => {
  const service = new DiscountRebateService();

  assert.equal(service.resolveRate(0), 1);
  assert.equal(service.resolveRate(3), 0.85);
  assert.equal(service.resolveRate(6), 0.8);
  assert.equal(service.resolveRate(12), 0.7);

  // 999 CNY at a 0.7 rate => 999 * 0.3 * 100 = 29970 rebate credits.
  assert.equal(service.calculateCredits(999, 0.7), 29970);

  const preview = service.preview(999, 12);
  assert.equal(preview.discountRate, 0.7);
  assert.equal(preview.rebateCredits, 29970);
  assert.ok(Math.abs(preview.payableCny - 699.3) < 1e-9);
  assert.ok(Math.abs(preview.savedCny - 299.7) < 1e-9);

  // Ladder must be monotonic: customer discount never gets worse over time.
  assert.equal(service.isMonotonic([0, 3, 6, 12]), true);
});

// Boundary path: the band edges are inclusive and tenant scope is enforced.
test('DiscountRebateService enforces band edges and tenant scope (boundary path)', () => {
  const service = new DiscountRebateService();

  // Just below the first paid band still pays full price.
  assert.equal(service.resolveRate(2), 1);

  const audit = service.toAudit('tenant-1', 12);
  assert.equal(audit.discountRate, 0.7);
  assert.equal(audit.tenantId, 'tenant-1');
  assert.equal(audit.action, 'SUB_DISCOUNT_REBATE');

  // Missing tenant scope must be rejected with the tenant error code.
  assert.throws(
    () => service.toAudit('', 1),
    (error: unknown) =>
      error instanceof BusinessError && error.code === ErrorCodes.TENANT_NOT_FOUND.code,
  );
});

// Error path: invalid pricing inputs raise a coded BusinessError rather than
// silently returning a bogus credit amount.
test('DiscountRebateService rejects invalid discount inputs (error path)', () => {
  const service = new DiscountRebateService();

  const expectPlanError = (error: unknown): boolean =>
    error instanceof BusinessError && error.code === ErrorCodes.SUB_PLAN_UNAVAILABLE.code;

  // Negative price is invalid.
  assert.throws(() => service.calculateCredits(-1, 0.7), expectPlanError);
  // Discount rate must be within (0, 1].
  assert.throws(() => service.calculateCredits(100, 0), expectPlanError);
  assert.throws(() => service.calculateCredits(100, 1.5), expectPlanError);
});
