import assert from 'node:assert/strict';
import test from 'node:test';

import { DueDiligenceService } from './due-diligence.service.js';

test('DueDiligenceService returns credential_required placeholder gracefully', async () => {
  const service = new DueDiligenceService();
  const report = await service.dueDiligence({ companyName: '湖北样例建筑有限公司' });
  assert.equal(report.tianyancha.status, 'credential_required');
  assert.equal(report.creditChina.provider, 'creditchina');
});
