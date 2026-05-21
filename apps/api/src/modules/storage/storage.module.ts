import { Module } from '@nestjs/common';

import { FileUploadController } from './file-upload.controller.js';
import { MockStorageProvider } from './providers/mock-storage-provider.js';
import { AliyunOcrProvider } from './providers/ocr/aliyun-ocr.provider.js';
import { OcrBulkUploaderController } from './providers/ocr/ocr-bulk-uploader.controller.js';
import { PaperDocumentExtractorService } from './providers/ocr/paper-document-extractor.service.js';
import { OssProvider } from './providers/oss-provider.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [FileUploadController, OcrBulkUploaderController],
  exports: [PaperDocumentExtractorService, StorageService],
  providers: [AliyunOcrProvider, MockStorageProvider, OssProvider, PaperDocumentExtractorService, StorageService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StorageModule {}
