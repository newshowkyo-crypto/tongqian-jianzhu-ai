import test from 'node:test';
import assert from 'node:assert/strict';

import { ToolRegistryService } from './tool-registry.service.js';

test('ToolRegistryService registers 17 tools and executes list_my_tenders', async () => {
  const service = new ToolRegistryService();
  const tools = service.listTools();
  const result = await service.execute('list_my_tenders', {}, { tenantId: 'tenant-1', userId: 'user-1' });
  assert.equal(tools.length, 17);
  assert.match(JSON.stringify(result), /list_my_tenders/);
});
