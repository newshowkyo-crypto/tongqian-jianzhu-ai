export interface StoredFileRecord {
  checksum: string;
  createdAt: string;
  expiresAt?: string;
  fileId: string;
  fileName: string;
  localPath?: string;
  metadata: Record<string, unknown>;
  mimeType: string;
  provider: 'mock' | 'oss';
  purpose: string;
  signedUrl: string;
  sizeBytes: number;
  storageKey: string;
  tenantId: string;
  url: string;
}

export interface StorageUploadInput {
  contentBase64?: string;
  fileName: string;
  mimeType?: string;
  purpose?: string;
  sizeBytes?: number;
  tenantId: string;
  userId?: string;
}

export interface StorageProvider {
  readonly mode: 'mock' | 'oss';
  completeMultipart(input: { fileName: string; parts: Array<{ checksum: string; partNo: number; sizeBytes: number }>; purpose: string; tenantId: string; uploadId: string }): StoredFileRecord;
  createMultipart(input: { fileName: string; mimeType: string; purpose: string; tenantId: string; totalSizeBytes: number }): { expiresAt: string; uploadId: string };
  getSignedUrl(fileId: string, ttlSeconds: number): string;
  putObject(input: { buffer: Buffer; checksum: string; fileName: string; mimeType: string; purpose: string; tenantId: string }): StoredFileRecord;
  putPart(input: { buffer: Buffer; checksum: string; partNo: number; uploadId: string }): { checksum: string; partNo: number; sizeBytes: number };
  registerReference(input: { fileName: string; mimeType: string; purpose: string; sizeBytes: number; tenantId: string; url?: string }): StoredFileRecord;
}
