import { readFile } from 'node:fs/promises';

import { Injectable } from '@nestjs/common';

export interface LegalCorpusRecord {
  clauseCount: number;
  code: string;
  docType: string;
  fetchedAt: string;
  fullText: string;
  id: string;
  issuer: string;
  parsedAt?: string;
  sourceUrl: string;
  status: 'parsed' | 'pending' | 'published';
  title: string;
  version: string;
}

export interface LegalClauseRecord {
  clauseNumber: string;
  clauseText: string;
  clauseTitle?: string;
  corpusId: string;
  depth: number;
  id: string;
  orderIndex: number;
  parentClauseId?: string;
}

@Injectable()
export class LegalCorpusService {
  private readonly clauses = new Map<string, LegalClauseRecord[]>();
  private readonly corpus = new Map<string, LegalCorpusRecord>();

  create(input: Omit<LegalCorpusRecord, 'clauseCount' | 'fetchedAt' | 'id' | 'status'>): LegalCorpusRecord {
    const row: LegalCorpusRecord = { ...input, clauseCount: 0, fetchedAt: new Date().toISOString(), id: crypto.randomUUID(), status: 'pending' };
    this.corpus.set(row.id, row);
    return row;
  }

  list(status?: string, docType?: string): LegalCorpusRecord[] {
    return [...this.corpus.values()].filter((item) => (!status || item.status === status) && (!docType || item.docType === docType));
  }

  get(id: string): LegalCorpusRecord {
    const row = this.corpus.get(id);
    if (!row) throw new Error('LEGAL_CORPUS.NOT_FOUND');
    return row;
  }

  async loadFromFile(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    return buffer.toString('utf8').split(String.fromCharCode(0)).join('').trim();
  }

  parseToClauses(text: string, corpusId = 'preview'): LegalClauseRecord[] {
    const normalized = text.replace(/\r\n/g, '\n');
    const pattern = /(?=(第[一二三四五六七八九十百零〇\d]+条|(?:\d+\.)+\d+)\s*)/g;
    return normalized.split(pattern)
      .reduce<string[]>((parts, part, index, array) => {
        if (/^(第.+条|(?:\d+\.)+\d+)$/.test(part) && array[index + 1]) parts.push(`${part}${array[index + 1]}`);
        return parts;
      }, [])
      .filter((part) => part.trim().length > 12)
      .map((part, orderIndex) => {
        const match = /^(第[一二三四五六七八九十百零〇\d]+条|(?:\d+\.)+\d+)\s*(.*)$/s.exec(part.trim());
        const clauseNumber = match?.[1] ?? `${orderIndex + 1}`;
        const clauseText = (match?.[2] ?? part).trim();
        return { clauseNumber, clauseText, corpusId, depth: clauseNumber.includes('.') ? clauseNumber.split('.').length - 1 : 0, id: crypto.randomUUID(), orderIndex };
      });
  }

  async parseUploadedFile(corpusId: string, filePath: string): Promise<LegalClauseRecord[]> {
    const text = await this.loadFromFile(filePath);
    const row = this.get(corpusId);
    const parsed = this.parseToClauses(text, corpusId);
    this.clauses.set(corpusId, parsed);
    this.corpus.set(corpusId, { ...row, clauseCount: parsed.length, fullText: text, parsedAt: new Date().toISOString(), status: 'parsed' });
    return parsed;
  }

  listClauses(corpusId: string): LegalClauseRecord[] {
    return this.clauses.get(corpusId) ?? [];
  }

  getClause(clauseId: string): { clause: LegalClauseRecord; corpus: LegalCorpusRecord } {
    for (const [corpusId, clauses] of this.clauses.entries()) {
      const clause = clauses.find((item) => item.id === clauseId);
      if (clause) return { clause, corpus: this.get(corpusId) };
    }
    throw new Error('LEGAL_CLAUSE.NOT_FOUND');
  }
}
