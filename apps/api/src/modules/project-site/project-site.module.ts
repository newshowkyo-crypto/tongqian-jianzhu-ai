import { Module } from '@nestjs/common';

import { ApprovalModule } from '../approval/approval.module.js';

import { BriefingService } from './briefing.service.js';
import { ChangeOrderService } from './change-order.service.js';
import { ClaimRecordService } from './claim-record.service.js';
import { PaymentLedgerService } from './payment-ledger.service.js';
import { PhotoService } from './photo.service.js';
import { ProjectSiteController } from './project-site.controller.js';
import { ProjectSiteService } from './project-site.service.js';
import { ScheduleService } from './schedule.service.js';
import { TaskBoardService } from './task-board.service.js';

@Module({
  controllers: [ProjectSiteController],
  exports: [ProjectSiteService],
  imports: [ApprovalModule],
  providers: [BriefingService, ChangeOrderService, ClaimRecordService, PaymentLedgerService, PhotoService, ProjectSiteService, ScheduleService, TaskBoardService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProjectSiteModule {}
