import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';

import { GovDocumentService } from './gov-document.service.js';

@Controller('api/v1/gov-documents')
export class GovDocumentController {
  constructor(@Inject(GovDocumentService) private readonly documents: GovDocumentService) {}

  @Post('generate')
  generate(@Body() body: { body: string; docType: string; title: string }, @Headers('x-forwarded-for') ip = '127.0.0.1', @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.documents.generate({ ...body, generatorIp: ip, tenantId, userId }), message: 'Gov document generated', traceId: crypto.randomUUID() };
  }

  @Post('minute-asr')
  minute(@Body() body: { audioUrl: string; transcript?: string }, @Headers('x-forwarded-for') ip = '127.0.0.1', @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.documents.transcribeMinute({ ...body, generatorIp: ip, tenantId, userId }), message: 'Meeting minute structured', traceId: crypto.randomUUID() };
  }
}
