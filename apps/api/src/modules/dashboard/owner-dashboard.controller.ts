import { Controller, Get, Inject } from '@nestjs/common';

import { CrossProjectAlertsService } from './cross-project-alerts.service.js';

@Controller('api/v1/dashboard')
export class OwnerDashboardController {
  constructor(@Inject(CrossProjectAlertsService) private readonly alerts: CrossProjectAlertsService) {}

  @Get('owner-kpi')
  ownerKpi(): Record<string, unknown> {
    return {
      code: 'OK',
      data: {
        generatedAt: new Date().toISOString(),
        greeting: '早安，今天建议先看风险红灯，再处理机会窗口。',
        kpis: {
          approvals: { trend: '+3', value: 6 },
          credits: { trend: '-180', value: 8420 },
          opportunities: { trend: '+12%', value: 18 },
          riskRed: { trend: '+2', value: 4 },
        },
        opportunities: [
          { deadline: '今日 17:00', meta: '市政道路 / 3200 万 / 资质匹配 86%', title: '武汉东湖高新区道路改造施工总包' },
          { deadline: '明日 10:30', meta: '学校维修 / 860 万 / 现金流压力低', title: '黄陂区中小学暑期维修项目' },
          { deadline: '3 天后', meta: '园区厂房 / 5100 万 / 建议联合体', title: '鄂州临空经济区标准厂房二期' },
        ],
        reports: [
          '昨日合同审查发现 2 条付款节点后置风险，建议补充进度款证据链。',
          '本周政策资金窗口新增 3 条，其中 1 条适合申报数字化转型补贴。',
          '标书资格项有 1 名安全员证书 27 天后到期，建议今天处理。',
        ],
        risks: [
          { detail: '甲方审计后付款条款未限定审计期限，建议关注回款滞后。', level: 'red', title: '付款节点风险' },
          { detail: '同类项目履约证明缺少竣工验收页，投标前建议补齐。', level: 'yellow', title: '标书资格风险' },
        ],
      },
      message: 'owner dashboard mock data',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('cross-project-alerts')
  crossProjectAlerts(): Record<string, unknown> {
    return { code: 'OK', data: this.alerts.list(), message: 'Cross project alerts', traceId: crypto.randomUUID() };
  }
}
