import assert from 'node:assert/strict';
import test from 'node:test';

import { ClaimRecordService } from './claim-record.service.js';

test('ClaimRecordService triggers 7 day deadline alert', () => {
  const service = new ClaimRecordService();
  const deadline = new Date(Date.now() + 7 * 86_400_000).toISOString();
  service.create({ claimType: 'owner_default', contractId: 'c1', description: '业主供料延误', evidenceFiles: ['photo.jpg'], projectId: 'p1', submitDeadline: deadline, tenantId: 't1', title: '供料延误索赔' });
  const alerts = service.deadlineAlerts('p1');
  assert.equal(alerts[0]?.alertLevel, '7');
  assert.ok(alerts[0]?.aiSuccessScore > 0.4);
});
