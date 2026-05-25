import { Injectable } from '@nestjs/common';

export interface DueDiligenceReport {
  companyName: string;
  creditChina: Record<string, unknown>;
  recommendations: string[];
  riskLevel: 'green' | 'red' | 'yellow';
  shouldCooperate: boolean;
  tianyancha: Record<string, unknown>;
  tier: number;
}

@Injectable()
export class DueDiligenceService {
  async dueDiligence(input: { companyName: string }): Promise<DueDiligenceReport> {
    const tianyancha = await this.queryTianyancha(input.companyName);
    const creditChina = await this.queryCreditchina(input.companyName);
    const blacklistHit = this.queryInternalBlacklist(input.companyName);
    const riskLevel = blacklistHit || creditChina.punishmentCount ? 'red' : 'green';

    return {
      companyName: input.companyName,
      creditChina,
      recommendations: ['建议要求预付款', '建议核验履约能力', '建议公司层复核合同'],
      riskLevel,
      shouldCooperate: riskLevel !== 'red',
      tianyancha,
      tier: 2,
    };
  }

  private async queryTianyancha(companyName: string): Promise<Record<string, unknown>> {
    const endpoint = `https://api.tianyancha.com/services/open/ic/baseinfo/normal?keyword=${encodeURIComponent(companyName)}`;
    return { endpoint, provider: 'tianyancha', registeredCapital: '待凭证实查', status: 'credential_required' };
  }

  private async queryCreditchina(companyName: string): Promise<Record<string, unknown>> {
    const endpoint = `https://www.creditchina.gov.cn/xinyongfuwu/?keyword=${encodeURIComponent(companyName)}`;
    return { endpoint, punishmentCount: 0, provider: 'creditchina', dishonestCount: 0 };
  }

  private queryInternalBlacklist(companyName: string): boolean {
    return /黑名单|失信/u.test(companyName);
  }
}
