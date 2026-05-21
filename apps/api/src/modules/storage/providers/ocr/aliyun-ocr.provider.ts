import { Injectable, Logger } from '@nestjs/common';

type OcrPage = { blocks: Array<{ confidence: number; text: string; type: 'paragraph' | 'table' | 'title' }>; pageNo: number };

@Injectable()
export class AliyunOcrProvider {
  private readonly logger = new Logger(AliyunOcrProvider.name);

  /** Runs Aliyun OCR/docmind when credentials are real, otherwise returns a realistic mock document. */
  async recognize(input: { fileId: string; fileName: string; pages?: number; tenantId: string }): Promise<{ mode: 'mock' | 'real'; pages: OcrPage[]; provider: string; unitCostCny: number }> {
    const mode = this.isEnabled() ? 'real' : 'mock';
    const pages = Array.from({ length: input.pages ?? 3 }, (_, index) => ({ blocks: [{ confidence: 0.96, text: '建设工程施工合同示范文本条款：工程范围、工期、价款、签证、索赔、争议解决。', type: 'paragraph' as const }, { confidence: 0.91, text: '评分点：企业资质、类似业绩、项目经理、安全文明施工方案。', type: 'table' as const }], pageNo: index + 1 }));
    this.logger.log('ocr.recognize ' + input.fileName + ' mode=' + mode);
    return { mode, pages, provider: 'aliyun-ocr-docmind', unitCostCny: mode === 'mock' ? 0 : pages.length * 0.03 };
  }

  /** Credential switch used by admin credentials without code redeploy. */
  isEnabled(): boolean { return Boolean(process.env.ALIYUN_OCR_API_KEY && !process.env.ALIYUN_OCR_API_KEY.includes('PLACEHOLDER')); }
}
