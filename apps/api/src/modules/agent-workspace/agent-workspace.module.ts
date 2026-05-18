import { Module } from '@nestjs/common';

import { AgentWorkspaceController } from './agent-workspace.controller.js';
import { AgentWorkspaceService } from './agent-workspace.service.js';

@Module({
  controllers: [AgentWorkspaceController],
  exports: [AgentWorkspaceService],
  providers: [AgentWorkspaceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AgentWorkspaceModule {}
