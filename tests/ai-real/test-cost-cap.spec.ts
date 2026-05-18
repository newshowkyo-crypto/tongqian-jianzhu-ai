import { expect, test } from '@playwright/test';

import { CostCapEnforcerService } from '../../apps/api/src/ai-gateway/cost-cap-enforcer.service';

test('BR-904 cost cap triggers downgrade signal', () => {
  const enforcer = new CostCapEnforcerService();
  expect(enforcer.shouldDowngrade(1)).toBeFalsy();
  expect(enforcer.shouldDowngrade(10)).toBeTruthy();
});
