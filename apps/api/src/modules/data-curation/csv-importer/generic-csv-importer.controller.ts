import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import type { WenshuCsvImporterService } from './wenshu-csv-importer.service.js';

@Controller('api/v1/admin/csv')
export class GenericCsvImporterController {
  constructor(private readonly importer: WenshuCsvImporterService) {}

  @Post('import')
  async import(@Query('type') type = 'wenshu', @Body() body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const data = await this.importer.import({ fieldMapping: body.fieldMapping as Record<string, string> | undefined, fileName: String(body.fileName ?? 'mock.csv'), idempotencyKey: body.idempotencyKey as string | undefined, operatorId: String(body.operatorId ?? 'platform-owner'), tenantId: String(body.tenantId ?? 'platform-tenant'), totalBytes: Number(body.totalBytes ?? 1024), type: type as 'business-profile' | 'opportunity' | 'policy-fund' | 'wenshu' });
    return { code: 'OK', data, message: 'csv import queued', traceId: crypto.randomUUID() };
  }

  @Get('imports/:jobId')
  progress(@Param('jobId') jobId: string): Record<string, unknown> { return { code: 'OK', data: this.importer.getProgress(jobId), message: 'csv import progress', traceId: crypto.randomUUID() }; }
}
