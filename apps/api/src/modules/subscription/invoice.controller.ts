import { Controller, Get, Headers, Inject } from '@nestjs/common';

import { InvoiceService } from './invoice.service.js';

@Controller('api/v1/invoices')
export class InvoiceController {
  constructor(@Inject(InvoiceService) private readonly invoices: InvoiceService) {}

  @Get()
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.invoices.list(tenantId), message: 'Invoices', traceId: crypto.randomUUID() };
  }
}
