import { Module } from '@nestjs/common';

import { HealthController } from './health.controller.js';
import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';

@Module({
  controllers: [HealthController, MetricsController],
  exports: [MetricsService],
  providers: [MetricsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}
