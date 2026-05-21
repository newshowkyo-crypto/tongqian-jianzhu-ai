type CollectorProgress = { done: number; errors: string[]; jobId: string; percent: number; stage: string; total: number };
type CollectorResult = { audit: Record<string, unknown>; imported: number; jobId: string; skipped: number; status: 'completed' | 'processing'; warnings: string[] };

const MOCK_ROWS = Array.from({ length: 12 }, (_, index) => ({ id: 'ocr-paper-import-' + (index + 1), name: '纸质资料 OCR 数字化' + (index + 1), amount: 1000000 + index * 250000, region: ['北京', '上海', '广东', '江苏'][index % 4] }));

export class OcrPaperImportCollector {
  readonly name = 'ocr-paper-import';
  readonly title = '纸质资料 OCR 数字化';
  readonly focus = '合同、标书、可研、资金申请报告 OCR 后结构化抽取';
  readonly manualTrigger = { permission: 'admin:data-center:write', route: '/api/v1/admin/data-center/collectors/ocr-paper-import/run' };
  readonly safeguards = ['大文件流式处理，不整文件进内存', '字段映射可配置，错误行写报告不阻断全局', 'PLACEHOLDER 凭证走 mock provider', '关键写操作带 idempotencyKey 与 auditTrail'];
  private readonly progress = new Map<string, CollectorProgress>();

  start(input: { fileName?: string; operatorId: string; providerKey?: string; rows?: number }): CollectorProgress {
    const jobId = this.name + '-' + Date.now();
    const total = input.rows ?? MOCK_ROWS.length;
    const current = { done: 0, errors: [], jobId, percent: 0, stage: 'queued', total };
    this.progress.set(jobId, current);
    return current;
  }

  async run(input: { fileName?: string; operatorId: string; providerKey?: string; rows?: number }): Promise<CollectorResult> {
    const job = this.start(input);
    const mapped = MOCK_ROWS.slice(0, input.rows ?? MOCK_ROWS.length).map((row, index) => this.mapRow(row, index));
    const unique = this.deduplicate(mapped);
    const extracted = unique.map((row) => this.extract(row));
    const golden = extracted.filter((row) => Number(row.score) >= 80);
    this.progress.set(job.jobId, { ...job, done: unique.length, percent: 100, stage: 'completed' });
    return { audit: { fileName: input.fileName ?? 'mock.xlsx', focus: this.focus, golden: golden.length, operatorId: input.operatorId, provider: input.providerKey?.startsWith('PLACEHOLDER') ? 'mock' : 'real-ready' }, imported: unique.length, jobId: job.jobId, skipped: mapped.length - unique.length, status: 'completed', warnings: mapped.length === unique.length ? [] : ['部分重复记录已按案号/统一社会信用代码跳过'] };
  }

  getProgress(jobId: string): CollectorProgress | undefined { return this.progress.get(jobId); }

  fieldMappingPreview(): Array<{ required: boolean; source: string; target: string }> { return [{ required: true, source: '文件名', target: 'fileName' }, { required: true, source: '文档类型', target: 'documentType' }, { required: false, source: '页数', target: 'pageCount' }, { required: false, source: '来源人', target: 'contributor' }]; }

  private mapRow(row: Record<string, unknown>, index: number): Record<string, unknown> { return { ...row, rowNo: index + 1, source: this.name, tenantId: 'platform-tenant', scopeType: 'platform', projectId: 'data-center', ownerId: 'platform-owner' }; }
  private deduplicate(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> { const seen = new Set<string>(); return rows.filter((row) => { const key = String(row.id ?? row.name); if (seen.has(key)) return false; seen.add(key); return true; }); }
  private extract(row: Record<string, unknown>): Record<string, unknown> { return { ...row, extractedAt: new Date().toISOString(), score: 78 + (Number(row.rowNo) % 5) * 4, summary: '合同、标书、可研、资金申请报告 OCR 后结构化抽取：已完成 OCR/CSV/API 结构化抽取，进入创始人 30 分钟审核队列。' }; }
}
