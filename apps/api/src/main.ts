import 'reflect-metadata';

import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AgentWorkspaceModule } from './modules/agent-workspace/agent-workspace.module.js';
import { ApprovalModule } from './modules/approval/approval.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CashflowFinanceModule } from './modules/cashflow-finance/cashflow-finance.module.js';
import { CostEstimateModule } from './modules/cost-estimate/cost-estimate.module.js';
import { CreditModule } from './modules/credit/credit.module.js';
import { DataExportModule } from './modules/data-export/data-export.module.js';
import { DrawingModule } from './modules/drawing/drawing.module.js';
import { KnowledgeModule } from './modules/knowledge/knowledge.module.js';
import { OpportunityModule } from './modules/opportunity/opportunity.module.js';
import { OpsToolkitModule } from './modules/ops-toolkit/ops-toolkit.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { ProjectSiteModule } from './modules/project-site/project-site.module.js';
import { QualificationModule } from './modules/qualification/qualification.module.js';
import { ReportCenterModule } from './modules/report-center/report-center.module.js';
import { RiskReviewModule } from './modules/risk-review/risk-review.module.js';
import { RulesEngineModule } from './modules/rules-engine/rules-engine.module.js';
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
    AgentWorkspaceModule,
    AuthModule,
    CashflowFinanceModule,
    CostEstimateModule,
    CreditModule,
    DataExportModule,
    DrawingModule,
    KnowledgeModule,
    OpportunityModule,
    OpsToolkitModule,
    PaymentModule,
    QualificationModule,
    ProjectSiteModule,
    ReportCenterModule,
    RiskReviewModule,
    RulesEngineModule,
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
