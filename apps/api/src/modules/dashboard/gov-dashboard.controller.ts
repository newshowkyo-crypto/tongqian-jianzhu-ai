import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/dashboard')
export class GovDashboardController {
  @Get('gov')
  govDashboard(): Record<string, unknown> {
    return {
      code: 'OK',
      data: {
        documents: [
          { due: '今日', title: '专项债项目入库请示' },
          { due: '本周五', title: '建筑业纾困政策解读稿' },
        ],
        fundMatches: [
          { amount: '1.2 亿', score: 91, title: '城市更新专项债储备项目' },
          { amount: '2800 万', score: 84, title: '绿色建造示范补贴' },
        ],
        subscriptions: [
          { level: '国家', title: '超长期特别国债项目申报窗口' },
          { level: '省级', title: '建筑业数字化转型试点' },
          { level: '市级', title: '中小企业稳岗补贴' },
        ],
      },
      message: 'gov dashboard mock data',
      traceId: crypto.randomUUID(),
    };
  }
}
