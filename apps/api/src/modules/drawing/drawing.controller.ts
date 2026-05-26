import { Body, Controller, Headers, Inject, Param, Post } from '@nestjs/common';

import { DrawingService } from './drawing.service.js';

@Controller('api/v1/drawings')
export class DrawingController {
  constructor(@Inject(DrawingService) private readonly drawings: DrawingService) {}

  @Post()
  upload(@Body() body: { fileFormat: string; fileUrl: string; pages?: number; projectId?: string; sizeBytes: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.upload({ ...body, tenantId }), message: 'Drawing uploaded', traceId: crypto.randomUUID() };
  }

  @Post(':id/understand')
  understand(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.understand({ drawingId: id, tenantId }), message: 'Drawing understood', traceId: crypto.randomUUID() };
  }

  @Post(':id/error-detect')
  detect(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.detectErrors({ drawingId: id, tenantId }), message: 'Drawing errors detected', traceId: crypto.randomUUID() };
  }

  @Post('version-diff')
  diff(@Body() body: { newId: string; oldId: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.versionDiff({ ...body, tenantId }), message: 'Drawing version diff created', traceId: crypto.randomUUID() };
  }

  @Post(':id/snapshot')
  snapshot(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.snapshot({ drawingId: id, tenantId }), message: 'Drawing snapshot explained', traceId: crypto.randomUUID() };
  }

  @Post(':id/annotations')
  annotate(@Param('id') id: string, @Body() body: { note: string; pageNo?: number; x: number; y: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.annotate({ drawingId: id, tenantId, ...body }), message: 'Drawing annotation saved', traceId: crypto.randomUUID() };
  }

  @Post(':id/quantity')
  quantity(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.drawings.quantity({ drawingId: id, tenantId }), message: 'Drawing quantity estimated', traceId: crypto.randomUUID() };
  }
}
