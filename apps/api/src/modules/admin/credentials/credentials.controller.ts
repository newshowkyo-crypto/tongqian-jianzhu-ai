import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';

import { CredentialsService } from './credentials.service.js';

@Controller('api/v1/admin/credentials')
export class CredentialsController {
  constructor(@Inject(CredentialsService) private readonly credentials: CredentialsService) {}

  @Get()
  list() {
    return this.credentials.list();
  }

  @Post(':key')
  save(@Param('key') key: string, @Body() body: { reason: string; value: string }) {
    return this.credentials.save(key, body);
  }

  @Post(':key/test')
  test(@Param('key') key: string) {
    return this.credentials.test(key);
  }

  @Post(':key/switch')
  switchMode(@Param('key') key: string, @Body() body: { to: 'mock' | 'real' }) {
    return this.credentials.switchMode(key, body);
  }

  @Get(':key/audit')
  audit(@Param('key') key: string, @Query('limit') limit?: string) {
    return this.credentials.auditRows(key, limit ? Number(limit) : 20);
  }
}
