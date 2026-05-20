import { createHash, randomUUID } from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { MockStorageProvider } from './providers/mock-storage-provider.js';
import { OssProvider } from './providers/oss-provider.js';
import type { StorageProvider, StorageUploadInput, StoredFileRecord } from './storage.types.js';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const MULTIPART_THRESHOLD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.dwg', '.png', '.jpg', '.jpeg', '.xlsx', '.zip']);

@Injectable()
export class StorageService {
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly generatedAssets = new Map<string, StoredFileRecord>();
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(MockStorageProvider) private readonly mockProvider: MockStorageProvider,
    @Inject(OssProvider) private readonly ossProvider: OssProvider,
  ) {}

  /** Uploads a user supplied file after extension, size and magic-number validation. */
  async upload(input: StorageUploadInput): Promise<StoredFileRecord> {
    const buffer = this.decodeContent(input.contentBase64);
    const sizeBytes = input.sizeBytes ?? buffer.byteLength;
    this.assertSize(sizeBytes);
    const extension = this.extensionOf(input.fileName);
    this.assertExtension(extension);
    const mimeType = input.mimeType ?? this.guessMime(extension);
    this.assertMagicNumber({ buffer, extension, mimeType });
    const provider = this.provider();
    const checksum = createHash('sha256').update(buffer).digest('hex');
    const record = provider.putObject({
      buffer,
      checksum,
      fileName: input.fileName,
      mimeType,
      purpose: input.purpose ?? 'general',
      tenantId: input.tenantId,
    });
    record.metadata = {
      ...record.metadata,
      fileId: record.fileId,
      largeFileStrategy: sizeBytes >= MULTIPART_THRESHOLD_BYTES ? 'multipart-recommended' : 'single-put',
      userId: input.userId,
    };
    this.audit('storage.upload', { extension, fileId: record.fileId, provider: record.provider, sizeBytes, tenantId: input.tenantId });
    return record;
  }

  /** Creates a resumable upload session for files from 10MB to the 50MB hard cap. */
  createMultipartUpload(input: { fileName: string; mimeType?: string; purpose?: string; tenantId: string; totalSizeBytes: number }): { expiresAt: string; thresholdBytes: number; uploadId: string } {
    this.assertSize(input.totalSizeBytes);
    if (input.totalSizeBytes < MULTIPART_THRESHOLD_BYTES) throw new Error('STORAGE.MULTIPART.NOT_REQUIRED');
    const extension = this.extensionOf(input.fileName);
    this.assertExtension(extension);
    const session = this.provider().createMultipart({
      fileName: input.fileName,
      mimeType: input.mimeType ?? this.guessMime(extension),
      purpose: input.purpose ?? 'general',
      tenantId: input.tenantId,
      totalSizeBytes: input.totalSizeBytes,
    });
    this.audit('storage.multipart.create', { fileName: input.fileName, tenantId: input.tenantId, uploadId: session.uploadId });
    return { ...session, thresholdBytes: MULTIPART_THRESHOLD_BYTES };
  }

  /** Stores a multipart part and returns the checksum used later by completeMultipartUpload. */
  async uploadPart(input: { contentBase64: string; partNo: number; uploadId: string }): Promise<{ checksum: string; partNo: number; sizeBytes: number }> {
    const buffer = this.decodeContent(input.contentBase64);
    const checksum = createHash('sha256').update(buffer).digest('hex');
    const part = this.provider().putPart({ buffer, checksum, partNo: input.partNo, uploadId: input.uploadId });
    this.audit('storage.multipart.part', { partNo: input.partNo, sizeBytes: part.sizeBytes, uploadId: input.uploadId });
    return part;
  }

  /** Completes multipart upload and returns the same signed URL shape as a single upload. */
  completeMultipartUpload(input: { fileName: string; parts: Array<{ checksum: string; partNo: number; sizeBytes: number }>; purpose?: string; tenantId: string; uploadId: string }): StoredFileRecord {
    const extension = this.extensionOf(input.fileName);
    this.assertExtension(extension);
    const totalBytes = input.parts.reduce((sum, part) => sum + part.sizeBytes, 0);
    this.assertSize(totalBytes);
    const record = this.provider().completeMultipart({
      fileName: input.fileName,
      parts: input.parts,
      purpose: input.purpose ?? 'general',
      tenantId: input.tenantId,
      uploadId: input.uploadId,
    });
    this.audit('storage.multipart.complete', { fileId: record.fileId, partCount: input.parts.length, tenantId: input.tenantId });
    return record;
  }

  /** Registers a file URL already collected by a business service so downstream reports share one file contract. */
  registerExternalFile(input: { fileName: string; mimeType?: string; purpose: string; sizeBytes: number; tenantId: string; url?: string }): StoredFileRecord {
    this.assertSize(input.sizeBytes);
    const extension = this.extensionOf(input.fileName);
    this.assertExtension(extension);
    const record = this.provider().registerReference({
      fileName: input.fileName,
      mimeType: input.mimeType ?? this.guessMime(extension),
      purpose: input.purpose,
      sizeBytes: input.sizeBytes,
      tenantId: input.tenantId,
      url: input.url,
    });
    this.audit('storage.reference.register', { fileId: record.fileId, purpose: input.purpose, tenantId: input.tenantId });
    return record;
  }

  /** Creates a storage URL for generated reports without forcing synchronous services to touch the filesystem. */
  storeGeneratedAsset(input: { content: string; extension: 'h5' | 'html' | 'pdf' | 'json'; reportId: string; tenantId: string }): StoredFileRecord {
    const fileId = randomUUID();
    const digest = createHash('sha256').update(input.content).digest('hex');
    const storageKey = `${input.tenantId}/reports/${input.reportId}.${input.extension}`;
    const record: StoredFileRecord = {
      checksum: digest,
      createdAt: new Date().toISOString(),
      fileId,
      fileName: `${input.reportId}.${input.extension}`,
      metadata: { generated: true, reportId: input.reportId, retentionDays: 3650 },
      mimeType: input.extension === 'pdf' ? 'application/pdf' : 'text/html',
      provider: this.provider().mode,
      purpose: 'report',
      signedUrl: '',
      sizeBytes: Buffer.byteLength(input.content),
      storageKey,
      tenantId: input.tenantId,
      url: `${this.provider().mode === 'oss' ? 'oss' : 'mock'}://storage/${storageKey}`,
    };
    record.signedUrl = this.signGenerated(record.fileId, 86_400);
    this.generatedAssets.set(fileId, record);
    this.audit('storage.generated.store', { fileId, provider: record.provider, reportId: input.reportId });
    return record;
  }

  getSignedUrl(fileId: string, ttlSeconds = 86_400): string {
    return this.generatedAssets.get(fileId)?.signedUrl ?? this.provider().getSignedUrl(fileId, ttlSeconds);
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private provider(): StorageProvider {
    if (this.ossProvider.isEnabled()) return this.ossProvider;
    return this.mockProvider;
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: randomUUID() });
    this.logger.log(`${action} ${JSON.stringify(detail)}`);
  }

  private assertExtension(extension: string): void {
    if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error('STORAGE.FILE_EXTENSION_NOT_ALLOWED');
  }

  private assertMagicNumber(input: { buffer: Buffer; extension: string; mimeType: string }): void {
    if (input.buffer.byteLength === 0) return;
    const hex = input.buffer.subarray(0, 8).toString('hex').toUpperCase();
    const ascii = input.buffer.subarray(0, 8).toString('ascii');
    const ok =
      (input.extension === '.pdf' && ascii.startsWith('%PDF')) ||
      (['.png'].includes(input.extension) && hex.startsWith('89504E47')) ||
      (['.jpg', '.jpeg'].includes(input.extension) && hex.startsWith('FFD8FF')) ||
      (['.docx', '.xlsx', '.zip'].includes(input.extension) && hex.startsWith('504B0304')) ||
      (input.extension === '.dwg' && ascii.startsWith('AC10')) ||
      (input.extension === '.doc' && input.buffer.byteLength > 64);
    if (!ok) throw new Error('STORAGE.MAGIC_NUMBER_MISMATCH');
  }

  private assertSize(sizeBytes: number): void {
    if (sizeBytes <= 0) throw new Error('STORAGE.FILE_EMPTY');
    if (sizeBytes > MAX_UPLOAD_BYTES) throw new Error('STORAGE.FILE_TOO_LARGE');
  }

  private decodeContent(contentBase64?: string): Buffer {
    return Buffer.from(contentBase64 ?? Buffer.from('%PDF-1.7\n% mock upload\n').toString('base64'), 'base64');
  }

  private extensionOf(fileName: string): string {
    const match = /\.[^.]+$/.exec(fileName.toLowerCase());
    return match?.[0] ?? '';
  }

  private guessMime(extension: string): string {
    return (
      {
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.dwg': 'application/acad',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.zip': 'application/zip',
      }[extension] ?? 'application/octet-stream'
    );
  }

  private signGenerated(fileId: string, ttlSeconds: number): string {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const sig = createHash('sha256').update(`${fileId}:${expires}:generated`).digest('hex').slice(0, 24);
    return `http://127.0.0.1:4000/api/v1/upload/files/${fileId}?expires=${expires}&sig=${sig}`;
  }
}
