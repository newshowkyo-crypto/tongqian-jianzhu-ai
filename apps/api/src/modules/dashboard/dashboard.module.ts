import { Module } from '@nestjs/common';

import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AgentDashboardController } from './agent-dashboard.controller.js';
import { CrossProjectAlertsService } from './cross-project-alerts.service.js';
import { GovDashboardController } from './gov-dashboard.controller.js';
import { OwnerDashboardController } from './owner-dashboard.controller.js';

@Module({
  controllers: [AdminDashboardController, AgentDashboardController, GovDashboardController, OwnerDashboardController],
  providers: [CrossProjectAlertsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DashboardModule {}
