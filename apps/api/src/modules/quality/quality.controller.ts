import { Body, Controller, Inject, Param, Post } from '@nestjs/common';

import { QualityService } from './quality.service.js';

@Controller('api/v1/projects/:projectId/quality')
export class QualityController {
  constructor(@Inject(QualityService) private readonly quality: QualityService) {}

  @Post('checks')
  recordCheck(@Param('projectId') projectId: string, @Body() body: { location: string; photoUrls: string[]; result: string; standardRef: string; tenantId?: string }): unknown {
    return { code: 'OK', data: this.quality.recordCheck({ ...body, projectId, tenantId: body.tenantId ?? 'mock-tenant' }), message: 'Quality check recorded', traceId: crypto.randomUUID() };
  }

  @Post('rectifications')
  createRectification(@Param('projectId') projectId: string, @Body() body: { checkpointId: string; description: string; tenantId?: string }): unknown {
    return { code: 'OK', data: this.quality.createRectification({ ...body, projectId, tenantId: body.tenantId ?? 'mock-tenant' }), message: 'Rectification created', traceId: crypto.randomUUID() };
  }

  @Post('rectifications/:id/verify')
  submitVerify(@Param('id') id: string, @Body() body: { evidenceUrls: string[] }): unknown {
    return { code: 'OK', data: this.quality.submitVerify(id, body.evidenceUrls), message: 'Rectification submitted for verify', traceId: crypto.randomUUID() };
  }

  @Post('rectifications/:id/close')
  closeOrReject(@Param('id') id: string, @Body() body: { note?: string; result: 'closed' | 'rejected' }): unknown {
    return { code: 'OK', data: this.quality.closeOrReject(id, body.result, body.note), message: 'Rectification reviewed', traceId: crypto.randomUUID() };
  }
}
