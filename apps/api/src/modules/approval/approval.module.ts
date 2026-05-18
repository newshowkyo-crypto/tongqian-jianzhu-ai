import { Module } from '@nestjs/common';

import { ApprovalEngineService } from './approval-engine.service.js';
import { ApprovalTemplateService } from './approval-template.service.js';
import { ApprovalController } from './approval.controller.js';

@Module({
  controllers: [ApprovalController],
  exports: [ApprovalEngineService, ApprovalTemplateService],
  providers: [ApprovalEngineService, ApprovalTemplateService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApprovalModule {}
