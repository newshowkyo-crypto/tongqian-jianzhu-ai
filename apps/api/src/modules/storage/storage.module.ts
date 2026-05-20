import { Module } from '@nestjs/common';

import { FileUploadController } from './file-upload.controller.js';
import { MockStorageProvider } from './providers/mock-storage-provider.js';
import { OssProvider } from './providers/oss-provider.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [FileUploadController],
  exports: [StorageService],
  providers: [MockStorageProvider, OssProvider, StorageService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StorageModule {}
