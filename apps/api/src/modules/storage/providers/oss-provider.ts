import { createHash, randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

import type { StorageProvider, StoredFileRecord } from '../storage.types.js';

@Injectable()
export class OssProvider implements StorageProvider {
  readonly mode = 'oss' as const;
  private readonly logger = new Logger(OssProvider.name);
  private readonly records = new Map<string, StoredFileRecord>();

  isEnabled(): boolean {
    return ['ALIYUN_OSS_ACCESS_KEY_ID', 'ALIYUN_OSS_ACCESS_KEY_SECRET', 'ALIYUN_OSS_BUCKET', 'ALIYUN_OSS_REGION'].every((key) => {
      const value = process.env[key];
      return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
    });
  }

  putObject(input: { buffer: Buffer; checksum: string; fileName: string; mimeType: string; purpose: string; tenantId: string }): StoredFileRecord {
    if (!this.isEnabled()) throw new Error('STORAGE.OSS.DISABLED_UNTIL_API_KEY_PROVIDED');
    const fileId = randomUUID();
    const bucket = process.env.ALIYUN_OSS_BUCKET ?? 'tongqian-placeholder';
    const region = process.env.ALIYUN_OSS_REGION ?? 'oss-cn-shanghai';
    const storageKey = `${input.tenantId}/${input.purpose}/${fileId}-${this.safeFileName(input.fileName)}`;
    const url = `oss://${bucket}/${storageKey}`;
    const record = this.toRecord({
      checksum: input.checksum,
      fileId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      purpose: input.purpose,
      sizeBytes: input.buffer.byteLength,
      storageKey,
      tenantId: input.tenantId,
      url,
    });
    record.metadata = { ...record.metadata, bucket, region, sdk: 'DISABLED_UNTIL_API_KEY_PROVIDED scaffold' };
    this.records.set(fileId, record);
    this.logger.log(`storage.oss.putObject tenant=${input.tenantId} fileId=${fileId} bytes=${input.buffer.byteLength}`);
    return record;
  }

  registerReference(input: { fileName: string; mimeType: string; purpose: string; sizeBytes: number; tenantId: string; url?: string }): StoredFileRecord {
    const fileId = randomUUID();
    const storageKey = `${input.tenantId}/${input.purpose}/${fileId}-${this.safeFileName(input.fileName)}`;
    const checksum = createHash('sha256').update(`${storageKey}:${input.sizeBytes}`).digest('hex');
    const record = this.toRecord({
      checksum,
      fileId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      purpose: input.purpose,
      sizeBytes: input.sizeBytes,
      storageKey,
      tenantId: input.tenantId,
      url: input.url ?? `oss://${process.env.ALIYUN_OSS_BUCKET ?? 'bucket'}/${storageKey}`,
    });
    this.records.set(fileId, record);
    return record;
  }

  createMultipart(input: { fileName: string; mimeType: string; purpose: string; tenantId: string; totalSizeBytes: number }): { expiresAt: string; uploadId: string } {
    if (!this.isEnabled()) throw new Error('STORAGE.OSS.DISABLED_UNTIL_API_KEY_PROVIDED');
    return { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), uploadId: `oss-${randomUUID()}-${input.tenantId}` };
  }

  putPart(input: { buffer: Buffer; checksum: string; partNo: number; uploadId: string }): { checksum: string; partNo: number; sizeBytes: number } {
    if (!this.isEnabled()) throw new Error('STORAGE.OSS.DISABLED_UNTIL_API_KEY_PROVIDED');
    return { checksum: input.checksum, partNo: input.partNo, sizeBytes: input.buffer.byteLength };
  }

  completeMultipart(input: { fileName: string; parts: Array<{ checksum: string; partNo: number; sizeBytes: number }>; purpose: string; tenantId: string; uploadId: string }): StoredFileRecord {
    if (!this.isEnabled()) throw new Error('STORAGE.OSS.DISABLED_UNTIL_API_KEY_PROVIDED');
    return this.registerReference({
      fileName: input.fileName,
      mimeType: 'application/octet-stream',
      purpose: input.purpose,
      sizeBytes: input.parts.reduce((sum, part) => sum + part.sizeBytes, 0),
      tenantId: input.tenantId,
    });
  }

  getSignedUrl(fileId: string, ttlSeconds: number): string {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const record = this.records.get(fileId);
    const key = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET ?? 'placeholder-secret';
    const sig = createHash('sha256').update(`${fileId}:${expires}:${key}`).digest('hex').slice(0, 32);
    return `https://${process.env.ALIYUN_OSS_BUCKET ?? 'bucket'}.${process.env.ALIYUN_OSS_REGION ?? 'oss-cn-shanghai'}.aliyuncs.com/${record?.storageKey ?? fileId}?Expires=${expires}&Signature=${sig}`;
  }

  private safeFileName(fileName: string): string {
    return fileName.replaceAll(/[^\w.-]+/g, '_').slice(0, 120);
  }

  private toRecord(input: Omit<StoredFileRecord, 'createdAt' | 'metadata' | 'provider' | 'signedUrl'>): StoredFileRecord {
    const record: StoredFileRecord = {
      ...input,
      createdAt: new Date().toISOString(),
      metadata: { auditMode: 'REAL_READY', scanStatus: 'pending-sdk-upload' },
      provider: this.mode,
      signedUrl: '',
    };
    record.signedUrl = this.getSignedUrl(record.fileId, 86_400);
    return record;
  }
}
