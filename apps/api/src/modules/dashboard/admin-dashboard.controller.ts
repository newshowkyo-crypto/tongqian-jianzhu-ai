import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/dashboard')
export class AdminDashboardController {
  @Get('admin')
  adminDashboard(): Record<string, unknown> {
    return {
      code: 'OK',
      data: {
        aarrr: [
          { label: '访问', value: 12840 },
          { label: '激活', value: 3840 },
          { label: '留存', value: 2260 },
          { label: '收入', value: 680 },
          { label: '推荐', value: 312 },
        ],
        ai: { deepseek: 'active', latencyMs: 1280, mockFallback: true, routeHealth: 'healthy' },
        metrics: { dau: 1260, mau: 18200, wau: 6420 },
        redLines: [
          { code: 'BR-901', status: 'green', value: 'AI 成本率 7.8%' },
          { code: 'BR-903', status: 'yellow', value: '退款率 2.1%' },
        ],
      },
      message: 'admin dashboard mock data',
      traceId: crypto.randomUUID(),
    };
  }
}
