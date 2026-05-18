import 'reflect-metadata';

import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { ApprovalModule } from './modules/approval/approval.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CreditModule } from './modules/credit/credit.module.js';
import { DataExportModule } from './modules/data-export/data-export.module.js';
import { OpportunityModule } from './modules/opportunity/opportunity.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { ReportCenterModule } from './modules/report-center/report-center.module.js';
import { RiskReviewModule } from './modules/risk-review/risk-review.module.js';
import { SubscriptionModule } from './modules/subscription/subscription.module.js';
import { TenderModule } from './modules/tender/tender.module.js';
import { UserModule } from './modules/user/user.module.js';

@Controller()
class HealthController {
  @Get('health')
  health(): { status: 'ok'; service: string } {
    return { status: 'ok', service: 'api' };
  }
}

@Module({
  controllers: [HealthController],
  imports: [
    ApprovalModule,
    AuthModule,
    CreditModule,
    DataExportModule,
    OpportunityModule,
    PaymentModule,
    ReportCenterModule,
    RiskReviewModule,
    SubscriptionModule,
    TenderModule,
    UserModule,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class AppModule {}

async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT ?? 4000);
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn', 'log'],
  });

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
