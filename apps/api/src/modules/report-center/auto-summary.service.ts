import { Injectable } from '@nestjs/common';

@Injectable()
export class AutoSummaryService {
  readonly cron = {
    daily: '06:30',
    monthly: '1日 08:00',
    weekly: '周一 07:00',
  };

  generateDaily(input: { date: string; projectId?: string; tenantId: string }): Record<string, unknown> {
    return { confidence: 0.82, dataSources: ['dashboard', 'tender', 'contract', 'cashflow'], disclaimer: '仅作经营辅助', guidanceButtons: ['继续', '部分完成', '调整目标', '升级求助', '暂停'], headline: `${input.date} 经营日报`, tier: 1 };
  }

  generateWeekly(input: { tenantId: string; week: string }): Record<string, unknown> {
    return { confidence: 0.8, dataSources: ['dashboard', 'tender', 'contract', 'cashflow'], disclaimer: '仅作经营辅助', guidanceButtons: ['继续', '部分完成', '调整目标', '升级求助', '暂停'], headline: `${input.week} 周报`, tier: 2 };
  }

  generateMonthly(input: { month: string; tenantId: string }): Record<string, unknown> {
    return { confidence: 0.78, dataSources: ['dashboard', 'tender', 'contract', 'cashflow'], disclaimer: '仅作经营辅助', guidanceButtons: ['继续', '部分完成', '调整目标', '升级求助', '暂停'], headline: `${input.month} 月报`, peerPk: true, tier: 2 };
  }
}
