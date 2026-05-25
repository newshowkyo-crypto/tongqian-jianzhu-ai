import { Module } from '@nestjs/common';

import { ApprovalModule } from '../approval/approval.module.js';

import { ProjectSiteController } from './project-site.controller.js';
import { BriefingService } from './briefing.service.js';
import { ProjectSiteService } from './project-site.service.js';
import { ScheduleService } from './schedule.service.js';

@Module({
  controllers: [ProjectSiteController],
  exports: [ProjectSiteService],
  imports: [ApprovalModule],
  providers: [BriefingService, ProjectSiteService, ScheduleService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProjectSiteModule {}
