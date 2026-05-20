import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';

import type { StorageProvider, StoredFileRecord } from '../storage.types.js';

interface MultipartState {
  createdAt: string;
  fileName: string;
  mimeType: string;
  parts: Map<number, { checksum: string; localPath: string; partNo: number; sizeBytes: number }>;
  purpose: string;
  tenantId: string;
  totalSizeBytes: number;
}

@Injectable()
export class MockStorageProvider implements StorageProvider {
  readonly mode = 'mock' as const;
  private readonly logger = new Logger(MockStorageProvider.name);
  private readonly multipart = new Map<string, MultipartState>();
  private readonly records = new Map<string, StoredFileRecord>();
  private readonly root = resolve(process.cwd(), 'data', 'uploads');

  constructor() {
    this.ensureDir(this.root);
  }

  putObject(input: { buffer: Buffer; checksum: string; fileName: string; mimeType: string; purpose: string; tenantId: string }): StoredFileRecord {
    const fileId = randomUUID();
    const safeName = this.safeFileName(input.fileName);
    const storageKey = `${input.tenantId}/${input.purpose}/${fileId}-${safeName}`;
    const localPath = join(this.root, storageKey);
    this.ensureDir(join(this.root, input.tenantId, input.purpose));
    writeFileSync(localPath, input.buffer);
    const record = this.toRecord({
      checksum: input.checksum,
      fileId,
      fileName: input.fileName,
      localPath,
      mimeType: input.mimeType,
      purpose: input.purpose,
      sizeBytes: input.buffer.byteLength,
      storageKey,
      tenantId: input.tenantId,
      url: `mock://storage/${storageKey}`,
    });
    this.records.set(fileId, record);
    this.logger.log(`storage.mock.putObject tenant=${input.tenantId} fileId=${fileId} bytes=${input.buffer.byteLength}`);
    return record;
  }

  registerReference(input: { fileName: string; mimeType: string; purpose: string; sizeBytes: number; tenantId: string; url?: string }): StoredFileRecord {
    const fileId = randomUUID();
    const storageKey = `${input.tenantId}/${input.purpose}/${fileId}-${this.safeFileName(input.fileName)}`;
    const checksum = createHash('sha256').update(`${input.url ?? storageKey}:${input.sizeBytes}`).digest('hex');
    const record = this.toRecord({
      checksum,
      fileId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      purpose: input.purpose,
      sizeBytes: input.sizeBytes,
      storageKey,
      tenantId: input.tenantId,
      url: input.url ?? `mock://storage/${storageKey}`,
    });
    this.records.set(fileId, record);
    return record;
  }

  createMultipart(input: { fileName: string; mimeType: string; purpose: string; tenantId: string; totalSizeBytes: number }): { expiresAt: string; uploadId: string } {
    const uploadId = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.multipart.set(uploadId, { createdAt: new Date().toISOString(), ...input, parts: new Map() });
    this.ensureDir(join(this.root, input.tenantId, 'multipart', uploadId));
    return { expiresAt, uploadId };
  }

  putPart(input: { buffer: Buffer; checksum: string; partNo: number; uploadId: string }): { checksum: string; partNo: number; sizeBytes: number } {
    const state = this.multipart.get(input.uploadId);
    if (!state) throw new Error('STORAGE.MULTIPART.NOT_FOUND');
    const localPath = join(this.root, state.tenantId, 'multipart', input.uploadId, `part-${input.partNo}`);
    writeFileSync(localPath, input.buffer);
    const part = { checksum: input.checksum, localPath, partNo: input.partNo, sizeBytes: input.buffer.byteLength };
    state.parts.set(input.partNo, part);
    return { checksum: part.checksum, partNo: part.partNo, sizeBytes: part.sizeBytes };
  }

  completeMultipart(input: { fileName: string; parts: Array<{ checksum: string; partNo: number; sizeBytes: number }>; purpose: string; tenantId: string; uploadId: string }): StoredFileRecord {
    const state = this.multipart.get(input.uploadId);
    if (!state) throw new Error('STORAGE.MULTIPART.NOT_FOUND');
    const ordered = [...state.parts.values()].sort((left, right) => left.partNo - right.partNo);
    if (ordered.length === 0 || ordered.length !== input.parts.length) throw new Error('STORAGE.MULTIPART.PARTS_INCOMPLETE');
    const digest = createHash('sha256');
    for (const part of ordered) digest.update(`${part.partNo}:${part.checksum}:${part.sizeBytes}`);
    const record = this.registerReference({
      fileName: input.fileName,
      mimeType: state.mimeType,
      purpose: input.purpose,
      sizeBytes: ordered.reduce((sum, part) => sum + part.sizeBytes, 0),
      tenantId: input.tenantId,
      url: `mock://storage/${input.tenantId}/${input.purpose}/${input.uploadId}/${this.safeFileName(input.fileName)}`,
    });
    record.metadata = { ...record.metadata, multipart: true, partCount: ordered.length, uploadChecksum: digest.digest('hex') };
    this.records.set(record.fileId, record);
    this.multipart.delete(input.uploadId);
    return record;
  }

  getSignedUrl(fileId: string, ttlSeconds: number): string {
    const record = this.records.get(fileId);
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const sig = createHash('sha256').update(`${fileId}:${expires}:mock-storage`).digest('hex').slice(0, 24);
    return `http://127.0.0.1:4000/api/v1/upload/files/${fileId}?expires=${expires}&sig=${sig}&provider=${record?.provider ?? 'mock'}`;
  }

  private ensureDir(path: string): void {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }

  private safeFileName(fileName: string): string {
    return fileName.replaceAll(/[^\w.-]+/g, '_').slice(0, 120);
  }

  private toRecord(input: Omit<StoredFileRecord, 'createdAt' | 'metadata' | 'provider' | 'signedUrl'>): StoredFileRecord {
    const record: StoredFileRecord = {
      ...input,
      createdAt: new Date().toISOString(),
      metadata: { auditMode: 'MOCK', retentionDays: 365, scanStatus: 'mock-pass' },
      provider: this.mode,
      signedUrl: '',
    };
    record.signedUrl = this.getSignedUrl(record.fileId, 86_400);
    return record;
  }
}
