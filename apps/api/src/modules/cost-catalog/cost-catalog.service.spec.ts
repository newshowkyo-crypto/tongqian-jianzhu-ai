import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { CostCatalogService } from './cost-catalog.service.js';

const HEADER = 'work_code,class_code,description,unit,total_unit_price,keywords';

// Writes a throwaway CSV file and returns its path. Each test gets its own temp
// directory so runs stay isolated and the real file-import path is exercised.
function writeCsv(rows: string[]): string {
  const dir = join(tmpdir(), `cost-catalog-${crypto.randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  const csv = join(dir, 'items.csv');
  writeFileSync(csv, `${[HEADER, ...rows].join('\n')}\n`, 'utf8');
  return csv;
}

// Happy path: a CSV row is imported, parsed (price/unit), and found by keyword.
test('CostCatalogService imports csv and searches keyword hits', async () => {
  const csv = writeCsv(['W1,C1,钢筋制作安装,t,6200,钢筋;主体']);
  const service = new CostCatalogService();

  const imported = await service.importFromCsv('hb-2026', csv, { region: 'hubei', sourceLicense: 'test' });
  assert.equal(imported.imported, 1);
  assert.equal(imported.errors.length, 0);

  const hits = service.searchByKeyword('钢筋', 'hubei');
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.description, '钢筋制作安装');
  assert.equal(hits[0]?.unit, 't');
  assert.equal(hits[0]?.totalUnitPrice, 6200);

  const catalogs = service.list();
  assert.equal(catalogs.length, 1);
  assert.equal(catalogs[0]?.itemCount, 1);
  assert.equal(catalogs[0]?.region, 'hubei');
});

// Boundary path: region scoping excludes catalogs from a different region, and a
// keyword with no match returns an empty result rather than throwing.
test('CostCatalogService scopes search by region and returns empty on no match', async () => {
  const csv = writeCsv(['W1,C1,钢筋制作安装,t,6200,钢筋;主体']);
  const service = new CostCatalogService();
  await service.importFromCsv('hb-2026', csv, { region: 'hubei', sourceLicense: 'test' });

  // Same keyword, different region → out of scope → no hits.
  assert.deepEqual(service.searchByKeyword('钢筋', 'guangdong'), []);
  // Keyword absent from the catalog → empty result.
  assert.deepEqual(service.searchByKeyword('防水卷材', 'hubei'), []);
});

// Empty-input path: a header-only CSV imports zero items without error.
test('CostCatalogService imports header-only csv as zero items', async () => {
  const csv = writeCsv([]);
  const service = new CostCatalogService();

  const imported = await service.importFromCsv('hb-empty', csv, { region: 'hubei', sourceLicense: 'test' });
  assert.equal(imported.imported, 0);
  assert.equal(imported.errors.length, 0);
  assert.equal(service.list()[0]?.itemCount, 0);
  assert.deepEqual(service.searchByKeyword('钢筋', 'hubei'), []);
});
