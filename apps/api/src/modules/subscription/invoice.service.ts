import { Injectable } from '@nestjs/common';

export interface InvoiceView {
  amount: number;
  emailSentAt?: string;
  id: string;
  invoiceNo: string;
  invoiceUrl?: string;
  status: 'failed' | 'issued' | 'pending';
  subscriptionId: string;
  tenantId: string;
}

@Injectable()
export class InvoiceService {
  private readonly invoices = new Map<string, InvoiceView>();

  issue(input: { amount: number; subscriptionId: string; tenantId: string }): InvoiceView {
    const invoice: InvoiceView = {
      amount: input.amount,
      emailSentAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      invoiceNo: `INV-${Date.now()}`,
      invoiceUrl: `oss://mock-invoices/${input.subscriptionId}.pdf`,
      status: 'issued',
      subscriptionId: input.subscriptionId,
      tenantId: input.tenantId,
    };
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  list(tenantId: string): InvoiceView[] {
    return [...this.invoices.values()].filter((invoice) => invoice.tenantId === tenantId);
  }
}
