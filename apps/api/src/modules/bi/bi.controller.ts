import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';

import { BiQueryService } from './bi-query.service.js';

@Controller('api/v1/bi')
export class BiController {
  constructor(@Inject(BiQueryService) private readonly bi: BiQueryService) {}

  @Post('classify')
  classify(@Body() body: { question: string }): unknown {
    return { code: 'OK', data: this.bi.classify(body.question), message: 'BI question classified', traceId: crypto.randomUUID() };
  }

  @Post('query')
  query(@Body() body: { params?: Record<string, string | number | boolean>; templateId: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.bi.run({ ...body, tenantId }), message: 'BI query executed', traceId: crypto.randomUUID() };
  }
}
