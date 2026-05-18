import { Module } from '@nestjs/common';

import { SecurityComplianceController } from './security-compliance.controller.js';
import { SecurityComplianceService } from './security-compliance.service.js';

@Module({
  controllers: [SecurityComplianceController],
  exports: [SecurityComplianceService],
  providers: [SecurityComplianceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SecurityComplianceModule {}
