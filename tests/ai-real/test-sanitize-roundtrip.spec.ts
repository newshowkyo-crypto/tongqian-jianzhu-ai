import { expect, test } from '@playwright/test';

import { SanitizerService } from '../../apps/api/src/ai-gateway/sanitizer/sanitizer.service';

test('sanitize roundtrip masks and restores construction sensitive text', () => {
  const sanitizer = new SanitizerService();
  const input = {
    contract: '湖北宏建工程有限公司，联系人张三，手机号 13800138000，合同金额 5800000 元。',
  };
  const masked = sanitizer.mask(input);
  expect(JSON.stringify(masked.masked)).not.toContain('13800138000');
  const restored = sanitizer.unmask(masked.masked, masked.replacements);
  expect(restored).toContain('13800138000');
});
