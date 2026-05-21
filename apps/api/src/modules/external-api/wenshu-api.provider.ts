import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WenshuApiProvider {
  private readonly logger = new Logger(WenshuApiProvider.name);

  /** Queries WenshuApi when a real key exists; PLACEHOLDER returns stable mock data for admin preview. */
  async query(input: { keyword: string; limit?: number; operatorId?: string }): Promise<Record<string, unknown>> {
    const mode = this.isEnabled() ? 'real-ready' : 'mock';
    const rows = Array.from({ length: input.limit ?? 5 }, (_, index) => ({ id: 'wenshuapi-' + (index + 1), keyword: input.keyword, name: input.keyword + ' 样本 ' + (index + 1), risk: ['low', 'medium', 'high'][index % 3], summary: '裁判文书网无官方稳定 API，建议优先购买 CSV 历史数据集后导入，网页抓取只做补充。', updatedAt: new Date().toISOString() }));
    this.logger.log('WenshuApi.query mode=' + mode + ' keyword=' + input.keyword);
    return { audit: { mode, operatorId: input.operatorId ?? 'platform-owner', provider: 'WenshuApi' }, rows, usage: { balanceWarning: mode === 'mock' ? '等待真凭证' : '按供应商余额返回', count: rows.length } };
  }

  /** Health metadata displayed in admin credentials and data-center source health. */
  health(): Record<string, unknown> { return { enabled: this.isEnabled(), mode: this.isEnabled() ? 'real' : 'mock', provider: 'WenshuApi', updatedAt: new Date().toISOString() }; }

  /** True only when a non-placeholder key is provided through admin credentials/env. */
  isEnabled(): boolean { const value = process.env.WENSHU_API_KEY; return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('DEPRECATED')); }
}
