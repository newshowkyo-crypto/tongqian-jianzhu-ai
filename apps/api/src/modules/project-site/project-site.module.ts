import { Module } from '@nestjs/common';

import { ApprovalModule } from '../approval/approval.module.js';

import { ProjectSiteController } from './project-site.controller.js';
import { ProjectSiteService } from './project-site.service.js';

@Module({
  controllers: [ProjectSiteController],
  exports: [ProjectSiteService],
  imports: [ApprovalModule],
  providers: [ProjectSiteService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProjectSiteModule {}
