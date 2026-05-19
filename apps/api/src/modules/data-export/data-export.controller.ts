import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';

import { DataExportService } from './data-export.service.js';

function ApiTags(..._tags: string[]): ClassDecorator { return () => undefined; }
function ApiOperation(_options: { summary: string }): MethodDecorator { return () => undefined; }
const RequestSchema = z.object({ format: z.enum(['csv', 'xlsx', 'zip']).optional(), requesterRole: z.string(), resourceId: z.string().min(1), twoFactorCode: z.string().optional() });
const UpdateSchema = z.object({ status: z.enum(['ready', 'expired']).optional() });

@ApiTags('data-export')
@Controller('api/v1/data-exports')
export class DataExportController {
  constructor(@Inject(DataExportService) private readonly dataExport: DataExportService) {}

  @Get()
  @RequirePermission('data-export:read')
  @ApiOperation({ summary: 'List tenant data export jobs' })
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return this.ok(this.dataExport.list(tenantId), 'Data export jobs');
  }

  @Get(':id')
  @RequirePermission('data-export:read')
  @ApiOperation({ summary: 'Get data export detail by approval flow id' })
  detail(@Param('id') id: string): unknown {
    return this.ok(this.dataExport.getByFlow(id), 'Data export job');
  }

  @Post()
  @RequirePermission('data-export:create')
  @ApiOperation({ summary: 'Create BR-104 export approval request' })
  create(@Body() body: unknown, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const input = RequestSchema.parse(body);
    return this.ok(this.dataExport.request({ ...input, tenantId }), 'Data export approval created');
  }

  @Patch(':id')
  @RequirePermission('data-export:update')
  @ApiOperation({ summary: 'Mark export as ready or expired' })
  update(@Param('id') id: string, @Body() body: unknown): unknown {
    const input = UpdateSchema.parse(body);
    const data = input.status === 'expired' ? { ...this.dataExport.getByFlow(id), status: 'expired' } : this.dataExport.markReady(id);
    return this.ok(data, 'Data export updated');
  }

  @Delete(':id')
  @RequirePermission('data-export:delete')
  @ApiOperation({ summary: 'Expire a data export signed URL without deleting audit logs' })
  remove(@Param('id') id: string): unknown {
    const data = { ...this.dataExport.getByFlow(id), status: 'expired' };
    return this.ok(data, 'Data export expired');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
