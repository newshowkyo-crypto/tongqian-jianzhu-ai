import { readFileSync } from 'node:fs';

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import type { LegalCorpusService } from '../../legal-corpus/legal-corpus.service.js';
import type { RuleFromClauseService } from '../../rule-extraction/rule-from-clause.service.js';
import type { SecurityComplianceService } from '../../security-compliance/security-compliance.service.js';

interface CorpusMetadata {
  code: string;
  docType: string;
  expectedClauseCount: number;
  filePath: string;
  issuer: string;
  sourceUrl: string;
  title: string;
  version: string;
}

@Controller('api/v1/admin/legal-corpus')
export class LegalCorpusAdminController {
  constructor(private readonly corpus: LegalCorpusService, private readonly generator: RuleFromClauseService, private readonly security: SecurityComplianceService) {}

  @Get()
  list(@Query('status') status?: string, @Query('docType') docType?: string) {
    const rows = this.corpus.list(status, docType);
    const items = this.metadata().map((meta) => {
      const uploaded = rows.find((row) => row.code === meta.code);
      return { ...meta, clauseCount: uploaded?.clauseCount ?? 0, corpusId: uploaded?.id, status: uploaded?.status ?? 'missing' };
    });
    return { code: 0, data: { items, total: items.length }, message: 'ok', traceId: crypto.randomUUID() };
  }

  @Post()
  async upload(@Body() body: CorpusMetadata & { filePath?: string; ossObjectKey?: string }) {
    const row = this.corpus.create({ code: body.code, docType: body.docType, fullText: '', issuer: body.issuer, sourceUrl: body.sourceUrl, title: body.title, version: body.version });
    const clauses = body.filePath ? await this.corpus.parseUploadedFile(row.id, body.filePath) : [];
    this.security.audit({ action: 'legal_corpus.upload', after: { clauseCount: clauses.length, code: body.code, ossObjectKey: body.ossObjectKey }, resource: 'legal_corpus' });
    return { code: 0, data: { ...this.corpus.get(row.id), parseJob: clauses.length ? 'completed' : 'waiting_upload' }, message: 'uploaded', traceId: crypto.randomUUID() };
  }

  @Post(':id/parse')
  async parse(@Param('id') id: string, @Body() body: { filePath: string }) {
    const clauses = await this.corpus.parseUploadedFile(id, body.filePath);
    this.security.audit({ action: 'legal_corpus.parse', after: { clauseCount: clauses.length, id }, resource: 'legal_corpus' });
    return { code: 0, data: { clauses, total: clauses.length }, message: 'parsed', traceId: crypto.randomUUID() };
  }

  @Get(':id/clauses')
  clauses(@Param('id') id: string) {
    return { code: 0, data: { clauses: this.corpus.listClauses(id), corpus: this.corpus.get(id) }, message: 'ok', traceId: crypto.randomUUID() };
  }

  @Post(':id/clauses/:clauseId/generate')
  async generateOne(@Param('clauseId') clauseId: string) {
    const candidates = await this.generator.generateForClause(clauseId);
    return { code: 0, data: { candidates, generated: candidates.length }, message: 'generated', traceId: crypto.randomUUID() };
  }

  @Post(':id/generate-all')
  generateAll(@Param('id') id: string, @Body() body: { confidenceThreshold?: number }) {
    const total = this.corpus.listClauses(id).length;
    const jobId = `rule-from-clause-${crypto.randomUUID()}`;
    this.security.audit({ action: 'legal_corpus.generate_all.enqueue', after: { confidenceThreshold: body.confidenceThreshold ?? 0.85, id, jobId, total }, resource: 'legal_corpus' });
    void this.generator.generateForCorpus(id, { onlyConfidenceAbove: body.confidenceThreshold ?? 0.85 });
    return { code: 0, data: { jobId, processed: 0, status: 'running', total }, message: 'queued', traceId: crypto.randomUUID() };
  }

  private metadata(): CorpusMetadata[] {
    return JSON.parse(readFileSync('apps/api/data/legal-corpus/seed/metadata.json', 'utf8')) as CorpusMetadata[];
  }
}
