import { Body, Controller, Inject, Post } from '@nestjs/common';

import { DataExportService } from './data-export.service.js';

@Controller('api/v1/data-exports')
export class DataExportController {
  constructor(@Inject(DataExportService) private readonly dataExport: DataExportService) {}

  @Post('request')
  request(@Body() body: { requesterRole: string; resourceId: string; twoFactorCode?: string }): unknown {
    return { code: 'OK', data: this.dataExport.request(body), message: 'Data export approval created', traceId: crypto.randomUUID() };
  }
}
