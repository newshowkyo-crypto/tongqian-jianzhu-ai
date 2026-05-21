import { Controller, Get } from '@nestjs/common';

@Controller('api/v1')
export class AgentDashboardController {
  @Get('agent/reputation')
  reputation(): Record<string, unknown> {
    return {
      code: 'OK',
      data: {
        dispatch: { available: 12, urgent: 3 },
        level: 'LV4',
        monthCommission: 28600,
        nextLevelGap: 120,
        score: 880,
        scoreChanges: [
          { amount: 35, reason: '按时提交合同审查线下核验', type: 'plus' },
          { amount: -8, reason: '报价响应超时一次', type: 'minus' },
        ],
      },
      message: 'agent reputation mock data',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('commissions/calendar')
  commissionCalendar(): Record<string, unknown> {
    return {
      code: 'OK',
      data: {
        days: Array.from({ length: 30 }, (_, index) => ({
          amount: index % 5 === 0 ? 0 : 180 + index * 12,
          day: index + 1,
          settled: index < 18,
        })),
        total: 28600,
      },
      message: 'commission calendar mock data',
      traceId: crypto.randomUUID(),
    };
  }
}
