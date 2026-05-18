import { Module } from '@nestjs/common';

import { CashflowFinanceController } from './cashflow-finance.controller.js';
import { CashflowFinanceService } from './cashflow-finance.service.js';

@Module({
  controllers: [CashflowFinanceController],
  exports: [CashflowFinanceService],
  providers: [CashflowFinanceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CashflowFinanceModule {}
