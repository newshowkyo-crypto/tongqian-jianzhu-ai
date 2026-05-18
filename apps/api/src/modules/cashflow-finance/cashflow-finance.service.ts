import { Injectable } from '@nestjs/common';
import type {
  AgingAnalysisView,
  CashflowForecastView,
  FinanceDispatchRecommendationView,
  FinanceTier,
  FinancingDiagnosisView,
  ReceivableAgeBucket,
  ReceivableView,
} from '@tongqian/types';

const EMPTY_BUCKETS: Record<ReceivableAgeBucket, number> = { '180+': 0, '30-60': 0, '60-90': 0, '90-180': 0, '<30': 0 };

@Injectable()
export class CashflowFinanceService {
  private readonly receivables = new Map<string, ReceivableView>();

  importReceivables(input: { items: Array<{ amountCny: number; debtorName: string; dueDate: string; invoiceDate: string }>; tenantId: string }): ReceivableView[] {
    const created = input.items.map((item) => {
      const receivable: ReceivableView = {
        ageBucket: this.ageBucket(item.dueDate),
        amountCny: item.amountCny,
        debtorName: item.debtorName,
        dueDate: item.dueDate,
        id: crypto.randomUUID(),
        invoiceDate: item.invoiceDate,
        status: this.ageBucket(item.dueDate) === '<30' ? 'pending' : 'overdue',
        tenantId: input.tenantId,
      };
      this.receivables.set(receivable.id, receivable);
      return receivable;
    });
    return created;
  }

  listReceivables(tenantId: string): ReceivableView[] {
    return [...this.receivables.values()].filter((item) => item.tenantId === tenantId);
  }

  agingAnalysis(tenantId: string): AgingAnalysisView {
    const items = this.listReceivables(tenantId);
    const byBucket = { ...EMPTY_BUCKETS };
    for (const item of items) byBucket[item.ageBucket] += item.amountCny;
    const totalAmountCny = items.reduce((sum, item) => sum + item.amountCny, 0);
    const highRiskTotalCny = byBucket['90-180'] + byBucket['180+'];
    return {
      aiTaskId: `cash-aging-${crypto.randomUUID()}`,
      byBucket,
      disclaimer: 'cash.disclaimer.lightweight.notSealedFinancialReport',
      highRiskTotalCny,
      id: crypto.randomUUID(),
      reportId: `mock-report-${crypto.randomUUID()}`,
      tierBadge: this.agingTier(totalAmountCny),
      totalAmountCny,
    };
  }

  cashflowForecast(input: { monthlyInflowsCny?: number[]; monthlyOutflowsCny?: number[]; tenantId: string }): CashflowForecastView {
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const inflow = input.monthlyInflowsCny?.[index] ?? 800_000 + index * 20_000;
      const outflow = input.monthlyOutflowsCny?.[index] ?? 760_000 + (index % 4) * 70_000;
      const month = new Date(Date.UTC(2026, index, 1)).toISOString().slice(0, 7);
      return { month, netCashflowCny: inflow - outflow };
    });
    return {
      aiTaskId: `cash-forecast-${crypto.randomUUID()}`,
      alertTriggered: this.hasThreeConsecutiveNegativeMonths(monthlyData.map((item) => item.netCashflowCny)),
      forecastPeriod: 'next_12_months',
      id: crypto.randomUUID(),
      monthlyData,
    };
  }

  financingDiagnosis(input: { creditAmountCny?: number; hasAbsOrReits?: boolean; receivableAmountCny: number; tenantId: string }): FinancingDiagnosisView {
    const tierBadge = this.financingTier(input.creditAmountCny ?? input.receivableAmountCny, input.hasAbsOrReits);
    const recommendedPath = tierBadge === 3 ? 'tongqian_consult' : input.receivableAmountCny >= 5_000_000 ? 'agent_help' : 'self_apply';
    return {
      aiTaskId: `cash-financing-${crypto.randomUUID()}`,
      availableTypes: tierBadge === 3 ? ['asset_securitization_precheck', 'factoring_structure_review'] : ['factoring', 'guarantee', 'equipment_finance'],
      disclaimer: 'cash.financing.disclaimer.lightweightDiagnosis.notFinancingPlan',
      estimatedAmounts: [{ highCny: Math.round(input.receivableAmountCny * 0.7), lowCny: Math.round(input.receivableAmountCny * 0.35), type: 'factoring' }],
      id: crypto.randomUUID(),
      preparationSteps: ['cash.financing.prepare.receivableLedger', 'cash.financing.prepare.contractInvoices', 'cash.financing.prepare.financialStatements'],
      recommendedPath,
      tierBadge,
    };
  }

  dispatchRecommendation(input: { financingAmountCny: number; hasAbsOrReits?: boolean; receivableAmountCny: number }): FinanceDispatchRecommendationView {
    const tierBadge = this.financingTier(input.financingAmountCny, input.hasAbsOrReits);
    if (tierBadge === 3 || input.financingAmountCny >= 50_000_000) return { reason: 'cash.dispatch.reason.t3OrStructuredFinance', target: 'tongqian_strategy', tierBadge: 3 };
    if (input.receivableAmountCny >= 5_000_000) return { reason: 'cash.dispatch.reason.receivableOverFiveMillion', target: 'agent_finance', tierBadge };
    return { reason: 'cash.dispatch.reason.selfService', target: 'self_service', tierBadge };
  }

  private ageBucket(dueDate: string): ReceivableAgeBucket {
    const days = Math.max(0, Math.floor((Date.UTC(2026, 4, 18) - new Date(dueDate).getTime()) / 86_400_000));
    if (days < 30) return '<30';
    if (days < 60) return '30-60';
    if (days < 90) return '60-90';
    if (days < 180) return '90-180';
    return '180+';
  }

  private agingTier(totalAmountCny: number): FinanceTier {
    if (totalAmountCny >= 20_000_000) return 3;
    if (totalAmountCny >= 5_000_000) return 2;
    return 1;
  }

  private financingTier(amountCny: number, hasAbsOrReits?: boolean): FinanceTier {
    if (hasAbsOrReits || amountCny >= 50_000_000) return 3;
    return 2;
  }

  private hasThreeConsecutiveNegativeMonths(values: number[]): boolean {
    for (let index = 2; index < values.length; index += 1) {
      const current = values[index] ?? 0;
      const previous = values[index - 1] ?? 0;
      const beforePrevious = values[index - 2] ?? 0;
      if (current < 0 && previous < 0 && beforePrevious < 0) return true;
    }
    return false;
  }
}
