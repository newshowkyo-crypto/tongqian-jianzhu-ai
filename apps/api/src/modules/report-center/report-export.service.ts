import { Injectable } from '@nestjs/common';

export type ExportFormat = 'docx' | 'pdf' | 'pptx' | 'xlsx';

@Injectable()
export class ReportExportService {
  exportPdf(reportId: string): { buffer: Buffer; format: ExportFormat; note: string } {
    return { buffer: Buffer.from(`PDF placeholder for ${reportId}`), format: 'pdf', note: 'puppeteer headless render placeholder; not run in M28 verify' };
  }

  exportDocx(reportId: string): { buffer: Buffer; format: ExportFormat } {
    return { buffer: Buffer.from(`DOCX report ${reportId}`), format: 'docx' };
  }

  exportXlsx(reportId: string): { buffer: Buffer; format: ExportFormat } {
    return { buffer: Buffer.from(`XLSX report ${reportId}`), format: 'xlsx' };
  }

  exportPptx(reportId: string): { buffer: Buffer; format: ExportFormat } {
    return { buffer: Buffer.from(`PPTX report ${reportId}`), format: 'pptx' };
  }

  export(reportId: string, format: ExportFormat): { buffer: Buffer; format: ExportFormat; note?: string } {
    if (format === 'pdf') return this.exportPdf(reportId);
    if (format === 'docx') return this.exportDocx(reportId);
    if (format === 'xlsx') return this.exportXlsx(reportId);
    return this.exportPptx(reportId);
  }
}
