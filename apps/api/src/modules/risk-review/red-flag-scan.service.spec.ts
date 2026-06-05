import assert from 'node:assert/strict';
import test from 'node:test';

import { RedFlagScanService } from './red-flag-scan.service.js';

// Happy path: a contract clause containing a flagged keyword is detected and the
// full rule set (80 rules) is evaluated. The service resolves its data file from
// its own source location, so no working-directory setup is required here.
test('RedFlagScanService scans all rules and hits unlimited joint bond', () => {
  const service = new RedFlagScanService();
  const result = service.scan('The performance guarantee is unlimited and the bond is too high.');

  assert.equal(result.flags.length, 80);
  const bond = result.flags.find((flag) => flag.id === 'bond-01');
  assert.equal(bond?.hit, true);
  assert.ok(bond?.evidence, 'expected evidence text for a hit flag');
  assert.equal(typeof bond?.location, 'number');
});

// Boundary path: empty input evaluates every rule but produces no hits.
test('RedFlagScanService returns no hits for empty contract text', () => {
  const service = new RedFlagScanService();
  const result = service.scan('');

  assert.equal(result.flags.length, 80);
  assert.equal(result.flags.every((flag) => flag.hit === false), true);
});

// Aggregation path: categories() groups the rule set into its eight risk
// categories, each carrying ten rules (summing to the full 80).
test('RedFlagScanService categories() aggregates the eight risk categories', () => {
  const service = new RedFlagScanService();
  const categories = service.categories();

  const keys = Object.keys(categories);
  assert.equal(keys.length, 8);
  assert.ok(keys.includes('bond'));
  assert.ok(keys.includes('payment'));
  assert.equal(categories.bond, 10);

  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
  assert.equal(total, 80);
});
