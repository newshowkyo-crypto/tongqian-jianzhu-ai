import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { CostCatalogService } from './cost-catalog.service.js';

test('CostCatalogService imports csv and searches keyword hits', async () => {
  const dir = join(tmpdir(), `cost-catalog-${crypto.randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  const csv = join(dir, 'items.csv');
  writeFileSync(csv, 'work_code,class_code,description,unit,total_unit_price,keywords\nW1,C1,钢筋制作安装,t,6200,钢筋;主体\n', 'utf8');
  const service = new CostCatalogService();
  const imported = await service.importFromCsv('hb-2026', csv, { region: 'hubei', sourceLicense: 'test' });
  const hits = service.searchByKeyword('钢筋', 'hubei');
  assert.equal(imported.imported, 1);
  assert.equal(hits[0]?.description, '钢筋制作安装');
});
