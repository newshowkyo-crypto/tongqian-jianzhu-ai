import { Injectable } from '@nestjs/common';

type LedgerEvent = 'contract_signed' | 'dispute' | 'invoice_issued' | 'payment_received' | 'work_completed' | 'written_off';

interface PaymentLedgerItem {
  amountCny: number;
  contractId?: string;
  createdBy: string;
  eventDate: string;
  eventType: LedgerEvent;
  id: string;
  invoiceDate?: string;
  invoiceNo?: string;
  paymentDate?: string;
  period: string;
  projectId: string;
  status: 'confirmed' | 'disputed' | 'pending' | 'written_off';
  tenantId: string;
}

@Injectable()
export class PaymentLedgerService {
  private readonly items: PaymentLedgerItem[] = [];

  recordEvent(input: Omit<PaymentLedgerItem, 'id'>): PaymentLedgerItem {
    const item = { ...input, id: crypto.randomUUID() };
    this.items.push(item);
    return item;
  }

  getLedger(filters: { projectId?: string; tenantId: string }): { byCustomer: Record<string, number>; byMonth: Record<string, number>; byProject: Record<string, number>; items: PaymentLedgerItem[]; summary: Record<string, number> } {
    const items = this.items.filter((item) => item.tenantId === filters.tenantId && (!filters.projectId || item.projectId === filters.projectId));
    const summary = {
      contract_signed: this.sum(items, 'contract_signed'),
      invoice_issued: this.sum(items, 'invoice_issued'),
      overdue: this.getOverdueAlerts(filters.tenantId).reduce((sum, item) => sum + item.amountCny, 0),
      payment_received: this.sum(items, 'payment_received'),
      work_completed: this.sum(items, 'work_completed'),
    };
    return { byCustomer: this.group(items, 'contractId'), byMonth: this.group(items, 'period'), byProject: this.group(items, 'projectId'), items, summary };
  }

  getOverdueAlerts(tenantId = 'mock-tenant'): PaymentLedgerItem[] {
    const now = Date.now();
    return this.items.filter((item) => item.tenantId === tenantId && item.eventType === 'invoice_issued' && item.status !== 'written_off' && !item.paymentDate && (now - new Date(item.invoiceDate ?? item.eventDate).getTime()) / 86400000 >= 30);
  }

  private group(items: PaymentLedgerItem[], key: 'contractId' | 'period' | 'projectId'): Record<string, number> {
    return items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item[key] ?? 'unknown']: (acc[item[key] ?? 'unknown'] ?? 0) + item.amountCny }), {});
  }

  private sum(items: PaymentLedgerItem[], eventType: LedgerEvent): number {
    return items.filter((item) => item.eventType === eventType).reduce((sum, item) => sum + item.amountCny, 0);
  }
}
