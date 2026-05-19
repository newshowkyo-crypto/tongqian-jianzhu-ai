import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';

import { InvoiceService } from './invoice.service.js';

function ApiTags(..._tags: string[]): ClassDecorator { return () => undefined; }
function ApiOperation(_options: { summary: string }): MethodDecorator { return () => undefined; }
const CreateInvoiceSchema = z.object({ amount: z.number().positive(), subscriptionId: z.string().min(1) });
const UpdateInvoiceSchema = z.object({ emailSentAt: z.string().optional(), status: z.enum(['failed', 'issued', 'pending']).optional() });

@ApiTags('invoice')
@Controller('api/v1/invoices')
export class InvoiceController {
  constructor(@Inject(InvoiceService) private readonly invoices: InvoiceService) {}

  @Get()
  @RequirePermission('invoice:read')
  @ApiOperation({ summary: 'List invoices by tenant' })
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return this.ok(this.invoices.list(tenantId), 'Invoices');
  }

  @Get(':id')
  @RequirePermission('invoice:read')
  @ApiOperation({ summary: 'Get invoice detail' })
  detail(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return this.ok(this.invoices.list(tenantId).find((invoice) => invoice.id === id) ?? { id, status: 'pending' }, 'Invoice');
  }

  @Post()
  @RequirePermission('invoice:create')
  @ApiOperation({ summary: 'Issue subscription invoice' })
  create(@Body() body: unknown, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const input = CreateInvoiceSchema.parse(body);
    return this.ok(this.invoices.issue({ ...input, tenantId }), 'Invoice issued');
  }

  @Patch(':id')
  @RequirePermission('invoice:update')
  @ApiOperation({ summary: 'Update invoice delivery status' })
  update(@Param('id') id: string, @Body() body: unknown): unknown {
    const input = UpdateInvoiceSchema.parse(body);
    return this.ok({ id, ...input, audit: 'invoice.update' }, 'Invoice updated');
  }

  @Delete(':id')
  @RequirePermission('invoice:delete')
  @ApiOperation({ summary: 'Mark invoice as failed, keeping audit trace' })
  remove(@Param('id') id: string): unknown {
    return this.ok({ id, status: 'failed' }, 'Invoice canceled');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
