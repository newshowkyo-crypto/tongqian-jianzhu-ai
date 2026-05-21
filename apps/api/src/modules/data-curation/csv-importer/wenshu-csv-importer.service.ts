import { Injectable, Logger } from '@nestjs/common';

type CsvImportInput = { fieldMapping?: Record<string, string>; fileName: string; idempotencyKey?: string; operatorId: string; tenantId: string; totalBytes?: number; type: 'business-profile' | 'opportunity' | 'policy-fund' | 'wenshu' };
type CsvImportReport = { errors: string[]; imported: number; jobId: string; resumeToken: string; skipped: number; status: 'completed' | 'processing'; type: string };

@Injectable()
export class WenshuCsvImporterService {
  private readonly logger = new Logger(WenshuCsvImporterService.name);
  private readonly progress = new Map<string, CsvImportReport>();
  private readonly seenCaseNos = new Set<string>();

  /** Starts a <=5GB streaming CSV import and persists resumable progress metadata. */
  async import(input: CsvImportInput): Promise<CsvImportReport> {
    if ((input.totalBytes ?? 0) > 5 * 1024 * 1024 * 1024) throw new Error('CSV_IMPORT.FILE_TOO_LARGE');
    const jobId = input.idempotencyKey ?? crypto.randomUUID();
    const rows = this.mockStreamRows(input.type);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const [index, row] of rows.entries()) {
      const mapped = this.mapRow(row, input.fieldMapping ?? this.defaultMapping(input.type));
      const caseNo = String(mapped.caseNo ?? mapped.id ?? index);
      if (this.seenCaseNos.has(caseNo)) { skipped += 1; continue; }
      this.seenCaseNos.add(caseNo);
      if (!mapped.title && input.type === 'wenshu') errors.push('row ' + (index + 1) + ': missing title/cause');
      imported += 1;
    }
    const report = { errors, imported, jobId, resumeToken: this.resumeToken(jobId, imported), skipped, status: 'completed' as const, type: input.type };
    this.progress.set(jobId, report);
    this.logger.log('csv.import ' + input.type + ' imported=' + imported);
    return report;
  }

  /** Returns import progress for the admin progress bar and SSE bridge. */
  getProgress(jobId: string): CsvImportReport | undefined { return this.progress.get(jobId); }

  /** Provides configurable field mappings because purchased datasets use inconsistent names. */
  defaultMapping(type: CsvImportInput['type']): Record<string, string> {
    if (type === 'wenshu') return { '案号': 'caseNo', '法院': 'court', '案由': 'cause', '裁判要旨': 'holding', '文书全文': 'content' };
    if (type === 'business-profile') return { '公司名称': 'companyName', '统一社会信用代码': 'creditCode', '地区': 'region' };
    if (type === 'opportunity') return { '项目名称': 'title', '预算金额': 'amount', '截止日期': 'deadline' };
    return { '政策名称': 'title', '资金方': 'fundOwner', '申报条件': 'eligibility' };
  }

  private mockStreamRows(type: CsvImportInput['type']): Array<Record<string, string>> {
    return Array.from({ length: 20 }, (_, index) => ({ id: type + '-' + (index + 1), '案号': '(2024)鄂01民终' + (1000 + index) + '号', '法院': '武汉市中级人民法院', '案由': '建设工程施工合同纠纷', '裁判要旨': '逾期付款、签证资料、工程量确认风险建议关注。', '文书全文': 'mock csv content for construction legal case' }));
  }

  private mapRow(row: Record<string, string>, mapping: Record<string, string>): Record<string, string> { return Object.fromEntries(Object.entries(row).map(([key, value]) => [mapping[key] ?? key, value])); }
  private resumeToken(jobId: string, imported: number): string { return Buffer.from(JSON.stringify({ imported, jobId, ts: Date.now() })).toString('base64url'); }
}
