import { Module } from '@nestjs/common';

import { AgentWorkspaceController } from './agent-workspace.controller.js';
import { AgentWorkspaceService } from './agent-workspace.service.js';
import { CustomerOpsService } from './customer-ops.service.js';
import { FollowupReminderService } from './followup-reminder.service.js';

@Module({
  controllers: [AgentWorkspaceController],
  exports: [AgentWorkspaceService, CustomerOpsService, FollowupReminderService],
  providers: [AgentWorkspaceService, CustomerOpsService, FollowupReminderService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AgentWorkspaceModule {}
