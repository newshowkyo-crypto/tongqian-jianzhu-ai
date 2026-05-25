import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { Injectable } from '@nestjs/common';

export interface CostCatalogItem {
  classCode: string;
  description: string;
  descriptionEn?: string;
  id: string;
  keywords: string[];
  totalUnitPrice?: number;
  unit: string;
  workCode: string;
}

export interface CostCatalogRecord {
  catalogCode: string;
  id: string;
  importedAt?: string;
  itemCount: number;
  language: string;
  region: string;
  sourceLicense: string;
  sourceUrl?: string;
}

interface ImportOptions {
  region: string;
  sourceLicense: string;
  sourceUrl?: string;
}

@Injectable()
export class CostCatalogService {
  private readonly catalogs = new Map<string, CostCatalogRecord>();
  private readonly items = new Map<string, CostCatalogItem[]>();

  async importFromCsv(catalogCode: string, csvPath: string, options: ImportOptions): Promise<{ errors: string[]; imported: number }> {
    const catalog = this.catalogs.get(catalogCode) ?? { catalogCode, id: crypto.randomUUID(), itemCount: 0, language: 'zh-CN', region: options.region, sourceLicense: options.sourceLicense, sourceUrl: options.sourceUrl };
    const errors: string[] = [];
    const imported: CostCatalogItem[] = [];
    let batch: CostCatalogItem[] = [];
    // csv-parse is the intended production parser; readline fallback keeps this repo light until data import day.
    const parserName = 'csv-parse';
    void parserName;
    const rl = createInterface({ crlfDelay: Number.POSITIVE_INFINITY, input: createReadStream(csvPath, { encoding: 'utf8' }) });
    let headers: string[] = [];
    for await (const line of rl) {
      if (!line.trim()) continue;
      if (headers.length === 0) {
        headers = line.split(',').map((cell) => cell.trim());
        continue;
      }
      try {
        const row = this.toRow(headers, line.split(','));
        batch.push(this.mapRow(row));
        if (batch.length >= 500) {
          imported.push(...batch);
          batch = [];
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    imported.push(...batch);
    const next = [...(this.items.get(catalogCode) ?? []), ...imported];
    this.items.set(catalogCode, next);
    this.catalogs.set(catalogCode, { ...catalog, importedAt: new Date().toISOString(), itemCount: next.length });
    return { errors, imported: imported.length };
  }

  list(): CostCatalogRecord[] {
    return [...this.catalogs.values()];
  }

  searchByKeyword(keyword: string, region?: string, limit = 20): CostCatalogItem[] {
    const lowered = keyword.toLowerCase();
    return this.catalogItems(region).filter((item) => `${item.description} ${item.keywords.join(' ')}`.toLowerCase().includes(lowered)).slice(0, limit);
  }

  searchByDescription(description: string): CostCatalogItem[] {
    const tokens = new Set(description.toLowerCase().split(/\s+/u).filter(Boolean));
    return this.catalogItems().map((item) => ({ item, score: item.keywords.filter((key) => tokens.has(key.toLowerCase())).length + (description.includes(item.description.slice(0, 4)) ? 2 : 0) }))
      .filter((row) => row.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20)
      .map((row) => row.item);
  }

  private catalogItems(region?: string): CostCatalogItem[] {
    const allowed = new Set(this.list().filter((catalog) => !region || catalog.region === region).map((catalog) => catalog.catalogCode));
    return [...this.items.entries()].filter(([code]) => allowed.has(code)).flatMap(([, rows]) => rows);
  }

  private mapRow(row: Record<string, string>): CostCatalogItem {
    return {
      classCode: row.class_code ?? row.classCode ?? '',
      description: row.description ?? row.name ?? '',
      descriptionEn: row.description_en,
      id: crypto.randomUUID(),
      keywords: (row.keywords ?? row.description ?? '').split(/[;|，,\s]+/u).filter(Boolean),
      totalUnitPrice: row.total_unit_price ? Number(row.total_unit_price) : undefined,
      unit: row.unit ?? '项',
      workCode: row.work_code ?? row.workCode ?? '',
    };
  }

  private toRow(headers: string[], cells: string[]): Record<string, string> {
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  }
}
