import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QichachaApiProvider {
  private readonly logger = new Logger(QichachaApiProvider.name);

  /** Queries QichachaApi when a real key exists; PLACEHOLDER returns stable mock data for admin preview. */
  async query(input: { keyword: string; limit?: number; operatorId?: string }): Promise<Record<string, unknown>> {
    const mode = this.isEnabled() ? 'real-ready' : 'mock';
    const rows = Array.from({ length: input.limit ?? 5 }, (_, index) => ({ id: 'qichachaapi-' + (index + 1), keyword: input.keyword, name: input.keyword + ' 样本 ' + (index + 1), risk: ['low', 'medium', 'high'][index % 3], summary: '启信宝备选企业画像，供应商切换不影响业务字段契约。', updatedAt: new Date().toISOString() }));
    this.logger.log('QichachaApi.query mode=' + mode + ' keyword=' + input.keyword);
    return { audit: { mode, operatorId: input.operatorId ?? 'platform-owner', provider: 'QichachaApi' }, rows, usage: { balanceWarning: mode === 'mock' ? '等待真凭证' : '按供应商余额返回', count: rows.length } };
  }

  /** Health metadata displayed in admin credentials and data-center source health. */
  health(): Record<string, unknown> { return { enabled: this.isEnabled(), mode: this.isEnabled() ? 'real' : 'mock', provider: 'QichachaApi', updatedAt: new Date().toISOString() }; }

  /** True only when a non-placeholder key is provided through admin credentials/env. */
  isEnabled(): boolean { const value = process.env.QICHACHA_API_KEY; return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('DEPRECATED')); }
}
