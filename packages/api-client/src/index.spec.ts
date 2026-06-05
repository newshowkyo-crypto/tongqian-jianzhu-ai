import assert from 'node:assert';
import test from 'node:test';

import { createApiClient } from './index.js';

test('api-client marketSituation listSignals returns { list, total } under mock mode', async () => {
  const client = createApiClient({ mock: true });
  const result = await client.marketSituation.listSignals();

  assert.ok(result);
  assert.ok(Array.isArray(result.list));
  assert.strictEqual(typeof result.total, 'number');
  assert.strictEqual(result.list.length, result.total);
});

test('api-client marketSituation listSimulations, listReports, listFeedbacks filter properly', async () => {
  const client = createApiClient({ mock: true });
  const signalId = '1';

  const sims = await client.marketSituation.listSimulations(signalId);
  assert.ok(Array.isArray(sims));
  assert.ok(sims.every((s) => s.signalId === signalId));

  const reps = await client.marketSituation.listReports(signalId);
  assert.ok(Array.isArray(reps));
  assert.ok(reps.every((r) => r.signalId === signalId));

  const fbs = await client.marketSituation.listFeedbacks(signalId);
  assert.ok(Array.isArray(fbs));
  assert.ok(fbs.every((f) => f.signalId === signalId));
});

test('api-client marketSituation uses valid enum payload samples', async () => {
  const client = createApiClient({ mock: true });
  const sim = await client.marketSituation.createSimulation({
    signalId: '1',
    simulationType: 'project_participation', // Real enum value!
    inputParams: { targetMargin: 0.1 },
  });
  assert.strictEqual(sim.simulationType, 'project_participation');
});

test('api-client ownerRisk getReport and createReviewRequest mock returns real structures', async () => {
  const client = createApiClient({ mock: true });
  
  // 1. getReport assertions
  const report = await client.ownerRisk.getReport('rep-abc');
  assert.ok(report);
  assert.strictEqual(report.id, 'rep-abc');
  assert.ok(Array.isArray(report.sections));
  assert.ok(report.sections.length > 0);
  assert.strictEqual(typeof report.creditsCost, 'number');
  assert.strictEqual(typeof report.disclaimer, 'string');
  assert.strictEqual(typeof report.executiveSummary, 'string');

  // 2. createReviewRequest assertions
  const review = await client.ownerRisk.createReviewRequest({
    profileId: '1',
    reviewType: 'manual_review',
  });
  assert.ok(review);
  assert.strictEqual(review.profileId, '1');
  assert.strictEqual(review.status, 'pending');
});

test('api-client ownerRisk listProfiles + record lists return real-shaped structures', async () => {
  const client = createApiClient({ mock: true });

  const profiles = await client.ownerRisk.listProfiles();
  assert.ok(Array.isArray(profiles));
  for (const p of profiles) {
    assert.strictEqual(typeof p.id, 'string');
    assert.strictEqual(typeof p.ownerName, 'string');
    assert.strictEqual(typeof p.overallRiskLevel, 'string');
    assert.strictEqual(typeof p.riskScore, 'number');
  }

  const guarantees = await client.ownerRisk.listGuaranteeRecords('1');
  assert.ok(Array.isArray(guarantees));
  for (const g of guarantees) {
    assert.strictEqual(typeof g.guaranteedCompany, 'string');
    assert.strictEqual(typeof g.guaranteeAmount, 'number');
    assert.strictEqual(typeof g.riskLevel, 'string');
  }

  const receivables = await client.ownerRisk.listReceivableRecords('1');
  assert.ok(Array.isArray(receivables));
  for (const r of receivables) {
    assert.strictEqual(typeof r.debtorName, 'string');
    assert.strictEqual(typeof r.riskLevel, 'string');
  }
});

test('api-client marketSituation getSignal + unlockSignal return consistent real/mock shape', async () => {
  const client = createApiClient({ mock: true });

  const signal = await client.marketSituation.getSignal('1');
  assert.strictEqual(signal.id, '1');
  assert.strictEqual(typeof signal.title, 'string');
  assert.strictEqual(typeof signal.unlockCredits, 'number');
  assert.strictEqual(typeof signal.isPublished, 'boolean');

  const unlocked = await client.marketSituation.unlockSignal('1', { unlockType: 'full' });
  assert.strictEqual(unlocked.id, '1');
});

