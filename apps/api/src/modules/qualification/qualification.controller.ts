import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { QualificationService } from './qualification.service.js';

@Controller('api/v1/qualifications')
export class QualificationController {
  constructor(@Inject(QualificationService) private readonly qualifications: QualificationService) {}

  @Post('certs')
  uploadCert(@Body() body: { category: string; level: string; rawImageUrl: string; subType?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.uploadCert({ ...body, tenantId }), message: 'Qualification cert uploaded', traceId: crypto.randomUUID() };
  }

  @Get('me')
  archive(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.archive(tenantId), message: 'Qualification archive', traceId: crypto.randomUUID() };
  }

  @Post('personnel')
  personnel(@Body() body: { certNo: string; certType: string; name: string; role: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.addPersonnel({ ...body, tenantId }), message: 'Key personnel saved', traceId: crypto.randomUUID() };
  }

  @Post('checkup')
  checkup(@Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.qualifications.checkup(tenantId, userId), message: 'Qualification checkup', traceId: crypto.randomUUID() };
  }

  @Post('upgrade-path')
  upgrade(@Body() body: { category: string; fromLevel: string; toLevel: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.qualifications.upgradePath({ ...body, tenantId, userId }), message: 'Qualification upgrade path', traceId: crypto.randomUUID() };
  }

  @Post('performance')
  performance(@Body() body: { amountCny: number; industry: string; projectName: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.addPerformance({ ...body, tenantId }), message: 'Performance saved', traceId: crypto.randomUUID() };
  }

  @Get('expiry-reminders')
  expiry(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.expiryReminders(tenantId), message: 'Qualification expiry reminders', traceId: crypto.randomUUID() };
  }

  @Post('dynamic-review')
  dynamicReview(@Body() body: { notice: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.qualifications.dynamicReview({ ...body, tenantId }), message: 'Dynamic review guide', traceId: crypto.randomUUID() };
  }

  @Post('dispatch')
  dispatch(@Body() body: { amountCny: number; needType: string }): unknown {
    return { code: 'OK', data: this.qualifications.dispatch(body), message: 'Qualification dispatch decision', traceId: crypto.randomUUID() };
  }

  @Post('personnel/:id/compliance-check')
  compliance(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.qualifications.complianceCheck(id), message: 'Personnel compliance check', traceId: crypto.randomUUID() };
  }

  @Post('service-orders')
  order(@Body() body: { agentId: string; clientId: string; quotedAmountCny: number; servicePeriodDays: number; serviceTerms: string; target: string }): unknown {
    return { code: 'OK', data: this.qualifications.serviceOrder(body), message: 'Qualification service order', traceId: crypto.randomUUID() };
  }
}
