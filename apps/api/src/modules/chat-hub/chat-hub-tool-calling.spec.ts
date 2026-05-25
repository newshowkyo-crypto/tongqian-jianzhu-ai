import assert from 'node:assert/strict';
import test from 'node:test';

import { ChatHubService } from './chat-hub.service.js';
import { ToolRegistryService } from './tool-registry.service.js';

test('ChatHubService tool flow calls list_my_tenders through registry', async () => {
  const registry = new ToolRegistryService();
  const chat = new ChatHubService(registry);
  const result = await chat.sendMessageWithTools({ content: '帮我看一下招标项目', ctx: { channel: 'web', scopeType: 'tenant', tenantId: 't1', userId: 'u1' } });
  assert.equal(result.toolResults.length, 1);
  assert.match(JSON.stringify(result.toolResults[0]), /tenders/);
});
