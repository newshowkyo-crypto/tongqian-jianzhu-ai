import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type RegulationMeta = {
  code: string;
  docType: string;
  expectedClauseCount: number;
  title: string;
  version: string;
};

@Injectable()
export class RegulationRagService {
  private readonly seedPath = join(process.cwd(), 'apps/api/data/legal-corpus/seed/metadata.json');

  quickQuery(query: string): { hits: RegulationMeta[]; query: string; reviewAction: string } {
    const normalized = query.toLowerCase();
    const corpus = this.loadCorpus();
    const hits = corpus
      .filter((item) => `${item.code} ${item.title} ${item.docType}`.toLowerCase().includes(normalized) || this.related(normalized, item.code))
      .slice(0, 5);
    return {
      hits: hits.length > 0 ? hits : corpus.filter((item) => item.code.startsWith('GB')).slice(0, 5),
      query,
      reviewAction: '引用法规前核对现行版本、地方补充规则和正式原文页码。',
    };
  }

  private loadCorpus(): RegulationMeta[] {
    return JSON.parse(readFileSync(this.seedPath, 'utf8')) as RegulationMeta[];
  }

  private related(query: string, code: string): boolean {
    return (query.includes('fire') && ['GB50016-2014', 'GB50720-2011'].includes(code))
      || (query.includes('quality') && ['GB50300-2013', 'GB50204-2015'].includes(code))
      || (query.includes('price') && code === 'GB50500-2024')
      || (query.includes('seismic') && code === 'GB50011-2010');
  }
}
