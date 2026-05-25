import test from 'node:test';
import assert from 'node:assert/strict';

import { BudgetEstimatorService } from './budget-estimator.service.js';

test('BudgetEstimatorService applies 5 coefficients and 15 percent range', () => {
  const service = new BudgetEstimatorService();
  const estimate = service.estimate({ areaSqm: 3000, createdBy: 'u1', plannedStart: '2026-06-01', projectName: '杭州厂房', projectType: 'factory', qualityLevel: 'standard', region: 'provincial', structureType: 'steel', tenantId: 't1' });
  assert.equal(estimate.coefficients.region, 1.05);
  assert.equal(estimate.coefficients.structure, 1.4);
  assert.equal(estimate.coefficients.quality, 1.15);
  assert.equal(estimate.estimateLowCny, Math.round(estimate.estimateMidCny * 0.85));
  assert.equal(estimate.estimateHighCny, Math.round(estimate.estimateMidCny * 1.15));
});
