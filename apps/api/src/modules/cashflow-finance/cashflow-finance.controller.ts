import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';

import { CashflowFinanceService } from './cashflow-finance.service.js';
import { MultiChannelReminderService } from './multi-channel-reminder.service.js';

@Controller('api/v1')
export class CashflowFinanceController {
  constructor(
    @Inject(CashflowFinanceService) private readonly finance: CashflowFinanceService,
    @Inject(MultiChannelReminderService) private readonly reminders: MultiChannelReminderService,
  ) {}

  @Post('receivables/import')
  importReceivables(@Body() body: { items: Array<{ amountCny: number; debtorName: string; dueDate: string; invoiceDate: string }> }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.importReceivables({ ...body, tenantId }), message: 'Receivables imported', traceId: crypto.randomUUID() };
  }

  @Get('receivables')
  receivables(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.listReceivables(tenantId), message: 'Receivables', traceId: crypto.randomUUID() };
  }

  @Get('cashflow/overview')
  overview(): unknown {
    return { code: 'OK', data: { totalReceivable: '¥1,248 万', overdue90: '¥186 万', cashGap: '¥320 万', financingCapacity: '¥680 万' }, message: 'Cashflow overview', traceId: crypto.randomUUID() };
  }

  @Get('cashflow/receivables')
  cashflowReceivables(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.listReceivables(tenantId), message: 'Cashflow receivables', traceId: crypto.randomUUID() };
  }

  @Post('cashflow/receivables/:id/reminders')
  generateReminder(@Body() body: { amountCny?: number; debtorName?: string; receivableId?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const receivableId = body.receivableId ?? 'mock-receivable';
    return {
      code: 'OK',
      data: this.reminders.send({ amountCny: body.amountCny ?? 1280000, debtorName: body.debtorName ?? '重点业主', receivableId, tenantId }),
      message: 'Reminder generated',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('cashflow/reminders/:id')
  getReminder(): unknown {
    return { code: 'OK', data: { id: 'rem-formal', level: 'formal', body: '正式催款函正文', tier: 2, confidence: 'medium' }, message: 'Reminder detail', traceId: crypto.randomUUID() };
  }

  @Post('cashflow/investability-check')
  investabilityCheck(): unknown {
    return { code: 'OK', data: { confidence: 'medium' }, message: 'Investability checked', traceId: crypto.randomUUID() };
  }

  @Post('aging-analysis')
  aging(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.agingAnalysis(tenantId), message: 'Aging analysis created', traceId: crypto.randomUUID() };
  }

  @Post('cashflow-forecast')
  forecast(@Body() body: { monthlyInflowsCny?: number[]; monthlyOutflowsCny?: number[] }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.cashflowForecast({ ...body, tenantId }), message: 'Cashflow forecast created', traceId: crypto.randomUUID() };
  }

  @Post('financing-diagnosis')
  diagnosis(@Body() body: { creditAmountCny?: number; hasAbsOrReits?: boolean; receivableAmountCny: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.finance.financingDiagnosis({ ...body, tenantId }), message: 'Financing diagnosis created', traceId: crypto.randomUUID() };
  }

  @Post('financing-recommendations')
  recommendations(@Body() body: { financingAmountCny: number; hasAbsOrReits?: boolean; receivableAmountCny: number }): unknown {
    return { code: 'OK', data: this.finance.dispatchRecommendation(body), message: 'Financing recommendation', traceId: crypto.randomUUID() };
  }
}
