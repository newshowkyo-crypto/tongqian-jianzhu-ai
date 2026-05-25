import { Body, Controller, Post } from '@nestjs/common';

import { DueDiligenceService } from './due-diligence.service.js';

@Controller('api/v1/customer-dd')
export class DueDiligenceController {
  constructor(private readonly service: DueDiligenceService) {}

  @Post()
  async run(@Body() body: { companyName: string }) {
    return { code: 'OK', costCredits: 5, data: await this.service.dueDiligence(body), message: 'Customer due diligence report', traceId: crypto.randomUUID() };
  }
}
