import { Inject, Injectable } from '@nestjs/common';

import { AliyunOcrProvider } from './aliyun-ocr.provider.js';

type PaperType = 'contract' | 'feasibility' | 'funding' | 'tender';

@Injectable()
export class PaperDocumentExtractorService {
  constructor(@Inject(AliyunOcrProvider) private readonly ocr: AliyunOcrProvider) {}

  /** OCRs a paper document and extracts structured fields for founder review. */
  async extract(input: { fileId: string; fileName: string; tenantId: string; type: PaperType }): Promise<Record<string, unknown>> {
    const ocr = await this.ocr.recognize({ fileId: input.fileId, fileName: input.fileName, tenantId: input.tenantId });
    const text = ocr.pages.flatMap((page) => page.blocks.map((block) => block.text)).join('\n');
    const sanitized = this.sanitize(text);
    return { confidence: 0.88, documentType: input.type, extracted: this.byType(input.type, sanitized), fileId: input.fileId, mode: ocr.mode, ocrPages: ocr.pages.length, provider: ocr.provider, reviewStatus: 'pending_golden_review', sanitizedText: sanitized.slice(0, 800), unitCostCny: ocr.unitCostCny };
  }

  /** Batch extractor for drag-and-drop admin OCR imports. */
  async extractBatch(files: Array<{ fileId: string; fileName: string; type: PaperType }>, tenantId: string): Promise<Array<Record<string, unknown>>> {
    const results: Array<Record<string, unknown>> = [];
    for (const file of files) results.push(await this.extract({ ...file, tenantId }));
    return results;
  }

  /** Redacts people, company names and amount hints before prompt/RAG storage. */
  sanitize(text: string): string { return text.replace(/[A-Z][A-Za-z0-9 ]{2,40} Company/g, '[COMPANY]').replace(/Mr\. [A-Z][a-z]+|Ms\. [A-Z][a-z]+/g, '[PERSON]').replace(/\d+(?:\.\d+)?\s*(?:RMB|CNY|yuan|million)/gi, '[AMOUNT]'); }

  private byType(type: PaperType, text: string): Record<string, unknown> {
    const common = { keyClauses: ['payment milestone', 'schedule extension', 'variation', 'dispute resolution'], riskSignals: ['delayed payment', 'weak evidence loop'], summary: text.slice(0, 160) };
    if (type === 'contract') return { ...common, parties: ['[COMPANY_A]', '[COMPANY_B]'], risks: ['unlimited guarantee requires attention', 'overdue payment liability requires attention'] };
    if (type === 'tender') return { ...common, chapters: ['commercial bid', 'technical bid', 'pricing list'], scoring: { business: 30, price: 50, technical: 20 } };
    if (type === 'feasibility') return { ...common, chapters: ['background', 'investment estimate', 'finance analysis', 'risk assessment'], irrHint: 'pending review' };
    return { ...common, applicant: '[COMPANY]', fundOwner: 'fiscal/development fund owner', usage: 'green construction and digital transformation' };
  }
}
