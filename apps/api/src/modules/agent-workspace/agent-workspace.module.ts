import { Module } from '@nestjs/common';

import { AgentWorkspaceController } from './agent-workspace.controller.js';
import { AgentWorkspaceService } from './agent-workspace.service.js';
import { FollowupReminderService } from './followup-reminder.service.js';

@Module({
  controllers: [AgentWorkspaceController],
  exports: [AgentWorkspaceService, FollowupReminderService],
  providers: [AgentWorkspaceService, FollowupReminderService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AgentWorkspaceModule {}
