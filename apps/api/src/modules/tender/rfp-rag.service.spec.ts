import test from 'node:test';
import assert from 'node:assert/strict';

import { RfpRagService } from './rfp-rag.service.js';

test('RfpRagService ingests docs and searches across chunks', async () => {
  const service = new RfpRagService();
  const ingest = await service.ingestRfpDocs('tender-1', [{ name: '招标文件.pdf', ossUrl: 'mock://rfp.pdf' }]);
  const hits = service.searchAcrossRfp('tender-1', '投标 保证金', 3);
  assert.equal(ingest.docs, 1);
  assert.ok(ingest.chunks >= 1);
  assert.equal(hits[0]?.tenderId, 'tender-1');
});
