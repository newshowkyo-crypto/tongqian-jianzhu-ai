import { Module } from '@nestjs/common';

import { SubcontractController } from './subcontract.controller.js';
import { SubcontractService } from './subcontract.service.js';

@Module({
  controllers: [SubcontractController],
  exports: [SubcontractService],
  providers: [SubcontractService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SubcontractModule {}
