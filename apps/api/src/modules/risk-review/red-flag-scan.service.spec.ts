import assert from 'node:assert/strict';
import test from 'node:test';

import { RedFlagScanService } from './red-flag-scan.service.js';

test('RedFlagScanService scans 38 rules and hits unlimited joint bond', () => {
  const service = new RedFlagScanService();
  const result = service.scan('承包人承担无限连带保证责任。');
  assert.ok(result.flags.length >= 38);
  assert.equal(result.flags.find((flag) => flag.id === 'bond-01')?.hit, true);
});
