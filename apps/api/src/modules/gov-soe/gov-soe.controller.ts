import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { GovSoeService } from './gov-soe.service.js';

@Controller('api/v1/gov')
export class GovSoeController {
  constructor(@Inject(GovSoeService) private readonly gov: GovSoeService) {}

  @Get('policies')
  policies(): unknown {
    return { code: 'OK', data: this.gov.policies(), message: 'Gov policies', traceId: crypto.randomUUID() };
  }

  @Post('docs')
  docs(@Body() body: { docType: string; topic: string }, @Headers('x-tenant-id') tenantId = 'mock-gov', @Headers('x-user-id') userId = 'mock-user', @Headers('x-real-ip') ip = '127.0.0.1'): unknown {
    return { code: 'OK', data: this.gov.draftDocument({ ...body, ip, tenantId, userId }), message: 'Gov document drafted', traceId: crypto.randomUUID() };
  }

  @Get('docs/me')
  myDocs(@Headers('x-tenant-id') tenantId = 'mock-gov'): unknown {
    return { code: 'OK', data: this.gov.myDrafts(tenantId), message: 'Gov documents', traceId: crypto.randomUUID() };
  }

  @Post('sourcing')
  sourcing(@Body() body: { description: string; industry: string; region: string; title: string }, @Headers('x-tenant-id') tenantId = 'mock-gov'): unknown {
    return { code: 'OK', data: this.gov.createSourcing({ ...body, publisherTenantId: tenantId }), message: 'Sourcing published', traceId: crypto.randomUUID() };
  }

  @Get('sourcing')
  sourcingList(): unknown {
    return { code: 'OK', data: this.gov.listSourcing(), message: 'Sourcing list', traceId: crypto.randomUUID() };
  }

  @Post('sourcing/:id/reveal-contact')
  reveal(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.gov.revealContact(id), message: 'Contact revealed with audit', traceId: crypto.randomUUID() };
  }

  @Post('consult-intents')
  consult(@Body() body: { amountEstimateCny?: number; topic: string }): unknown {
    return { code: 'OK', data: this.gov.createConsult(body), message: 'Consult intent created', traceId: crypto.randomUUID() };
  }

  @Get('policy-funds')
  funds(): unknown {
    return { code: 'OK', data: this.gov.fundsList(), message: 'Policy funds', traceId: crypto.randomUUID() };
  }

  @Post('policy-funds/match')
  fundMatch(@Body() body: { projectFeatures: string[] }): unknown {
    return { code: 'OK', data: this.gov.fundMatch(body), message: 'Policy funds matched', traceId: crypto.randomUUID() };
  }

  @Post('two-books')
  twoBooks(@Body() body: { projectName: string }, @Headers('x-user-id') userId = 'mock-user', @Headers('x-real-ip') ip = '127.0.0.1'): unknown {
    return { code: 'OK', data: this.gov.twoBooks({ ...body, ip, userId }), message: 'Two-books package generated', traceId: crypto.randomUUID() };
  }
}
