import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { PaperDocumentExtractorService } from './paper-document-extractor.service.js';

@Controller('api/v1/admin/ocr')
export class OcrBulkUploaderController {
  private readonly progress = new Map<string, Record<string, unknown>>();
  constructor(@Inject(PaperDocumentExtractorService) private readonly extractor: PaperDocumentExtractorService) {}

  @Post('upload')
  async upload(@Body() body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const jobId = crypto.randomUUID();
    const files = (body.files as Array<{ fileId: string; fileName: string; type: 'contract' | 'feasibility' | 'funding' | 'tender' }> | undefined) ?? [{ fileId: 'mock-paper-001', fileName: 'mock-contract.pdf', type: 'contract' }];
    this.progress.set(jobId, { done: 0, percent: 10, stage: 'ocr-started', total: files.length });
    const results = await this.extractor.extractBatch(files, String(body.tenantId ?? 'platform-tenant'));
    this.progress.set(jobId, { done: files.length, percent: 100, results, stage: 'completed', total: files.length });
    return { code: 'OK', data: { jobId, results }, message: 'ocr upload completed in mock-real mode', traceId: crypto.randomUUID() };
  }

  @Get('progress/:jobId')
  progressOf(@Param('jobId') jobId: string): Record<string, unknown> { return { code: 'OK', data: this.progress.get(jobId) ?? { percent: 0, stage: 'not-found' }, message: 'ocr progress', traceId: crypto.randomUUID() }; }
}
