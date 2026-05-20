import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { StorageService } from './storage.service.js';

interface UploadBody {
  contentBase64?: string;
  fileName: string;
  mimeType?: string;
  purpose?: string;
  sizeBytes?: number;
  tenantId?: string;
  userId?: string;
}

interface MultipartCreateBody {
  fileName: string;
  mimeType?: string;
  purpose?: string;
  tenantId?: string;
  totalSizeBytes: number;
}

@Controller('api/v1/upload')
export class FileUploadController {
  constructor(@Inject(StorageService) private readonly storage: StorageService) {}

  @Post()
  async upload(@Body() body: UploadBody): Promise<unknown> {
    const traceId = crypto.randomUUID();
    const record = await this.storage.upload({
      contentBase64: body.contentBase64,
      fileName: body.fileName,
      mimeType: body.mimeType,
      purpose: body.purpose ?? 'general',
      sizeBytes: body.sizeBytes,
      tenantId: body.tenantId ?? 'demo-tenant',
      userId: body.userId,
    });
    return { code: 'OK', data: { ...record, mock: record.provider === 'mock' }, message: 'File uploaded', traceId };
  }

  @Post('multipart')
  createMultipart(@Body() body: MultipartCreateBody): unknown {
    const traceId = crypto.randomUUID();
    const session = this.storage.createMultipartUpload({
      fileName: body.fileName,
      mimeType: body.mimeType,
      purpose: body.purpose ?? 'general',
      tenantId: body.tenantId ?? 'demo-tenant',
      totalSizeBytes: body.totalSizeBytes,
    });
    return { code: 'OK', data: { ...session, mock: true }, message: 'Multipart upload created', traceId };
  }

  @Post('multipart/:uploadId/parts/:partNo')
  async uploadPart(@Param('uploadId') uploadId: string, @Param('partNo') partNo: string, @Body() body: { contentBase64: string }): Promise<unknown> {
    const traceId = crypto.randomUUID();
    const part = await this.storage.uploadPart({ contentBase64: body.contentBase64, partNo: Number(partNo), uploadId });
    return { code: 'OK', data: part, message: 'Multipart part uploaded', traceId };
  }

  @Post('multipart/:uploadId/complete')
  completeMultipart(
    @Param('uploadId') uploadId: string,
    @Body() body: { fileName: string; parts: Array<{ checksum: string; partNo: number; sizeBytes: number }>; purpose?: string; tenantId?: string },
  ): unknown {
    const traceId = crypto.randomUUID();
    const record = this.storage.completeMultipartUpload({
      fileName: body.fileName,
      parts: body.parts,
      purpose: body.purpose ?? 'general',
      tenantId: body.tenantId ?? 'demo-tenant',
      uploadId,
    });
    return { code: 'OK', data: record, message: 'Multipart upload completed', traceId };
  }

  @Get('files/:fileId')
  signedUrl(@Param('fileId') fileId: string): unknown {
    const traceId = crypto.randomUUID();
    return { code: 'OK', data: { fileId, signedUrl: this.storage.getSignedUrl(fileId, 86_400), ttlSeconds: 86_400 }, message: 'Signed URL refreshed', traceId };
  }
}
