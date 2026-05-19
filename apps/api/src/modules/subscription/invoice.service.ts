import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface InvoiceView {
  amount: number;
  emailSentAt?: string;
  id: string;
  invoiceType?: 'receipt' | 'special_vat' | 'standard_vat';
  invoiceNo: string;
  invoiceUrl?: string;
  status: 'failed' | 'issued' | 'pending';
  subscriptionId: string;
  tenantId: string;
}

@Injectable()
export class InvoiceService {
  private readonly invoices = new Map<string, InvoiceView>();
  private readonly auditRows: Array<{ action: string; at: string; invoiceId: string; note?: string }> = [];

  /**
   * Issues an invoice or receipt and stores the generated OSS PDF location.
   *
   * @param input Invoice creation input.
   * @returns Created invoice view.
   */
  issue(input: { amount: number; invoiceType?: InvoiceView['invoiceType']; subscriptionId: string; tenantId: string }): InvoiceView {
    if (input.amount <= 0) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, details: input, message: 'Invoice amount must be positive.' });
    const invoice: InvoiceView = {
      amount: input.amount,
      emailSentAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      invoiceType: input.invoiceType ?? 'standard_vat',
      invoiceNo: `INV-${Date.now()}`,
      invoiceUrl: this.buildPdfUrl(input.subscriptionId, input.invoiceType ?? 'standard_vat'),
      status: 'issued',
      subscriptionId: input.subscriptionId,
      tenantId: input.tenantId,
    };
    this.invoices.set(invoice.id, invoice);
    this.auditRows.push({ action: 'invoice.issued', at: new Date().toISOString(), invoiceId: invoice.id, note: invoice.invoiceUrl });
    return invoice;
  }

  /**
   * Lists invoices by tenant boundary.
   *
   * @param tenantId Tenant id.
   * @returns Invoices.
   */
  list(tenantId: string): InvoiceView[] {
    return [...this.invoices.values()].filter((invoice) => invoice.tenantId === tenantId);
  }

  /**
   * Marks delivery status after email or SMS notification.
   *
   * @param invoiceId Invoice id.
   * @param status Delivery status.
   * @returns Updated invoice.
   */
  updateStatus(invoiceId: string, status: InvoiceView['status']): InvoiceView {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) throw this.notFound(invoiceId);
    invoice.status = status;
    invoice.emailSentAt = new Date().toISOString();
    this.auditRows.push({ action: `invoice.${status}`, at: invoice.emailSentAt, invoiceId });
    return invoice;
  }

  /**
   * Builds invoice audit rows for admin console and financial reconciliation.
   *
   * @param invoiceId Optional invoice id.
   * @returns Audit rows.
   */
  audit(invoiceId?: string): Array<{ action: string; at: string; invoiceId: string; note?: string }> {
    return invoiceId ? this.auditRows.filter((row) => row.invoiceId === invoiceId) : [...this.auditRows];
  }

  private buildPdfUrl(subscriptionId: string, type: NonNullable<InvoiceView['invoiceType']>): string {
    return `oss://mock-invoices/${type}/${subscriptionId}.pdf`;
  }

  private notFound(invoiceId: string): BusinessError {
    return new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, details: { invoiceId }, message: 'Invoice not found.' });
  }
}
