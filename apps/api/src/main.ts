import 'reflect-metadata';

import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AiGatewayModule } from './ai-gateway/ai-gateway.module.js';
import { AddictionModule } from './modules/addiction/addiction.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module.js';
import { AgentWorkspaceModule } from './modules/agent-workspace/agent-workspace.module.js';
import { ApprovalModule } from './modules/approval/approval.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CashflowFinanceModule } from './modules/cashflow-finance/cashflow-finance.module.js';
import { ChatHubModule } from './modules/chat-hub/chat-hub.module.js';
import { CostEstimateModule } from './modules/cost-estimate/cost-estimate.module.js';
import { CostCatalogModule } from './modules/cost-catalog/cost-catalog.module.js';
import { CreditModule } from './modules/credit/credit.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { DataCurationModule } from './modules/data-curation/data-curation.module.js';
import { DataExportModule } from './modules/data-export/data-export.module.js';
import { DrawingModule } from './modules/drawing/drawing.module.js';
import { ExternalApiModule } from './modules/external-api/external-api.module.js';
import { GovSoeModule } from './modules/gov-soe/gov-soe.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { KnowledgeCurationModule } from './modules/knowledge-curation/knowledge-curation.module.js';
import { KnowledgeModule } from './modules/knowledge/knowledge.module.js';
import { LegalCorpusModule } from './modules/legal-corpus/legal-corpus.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { OpportunityModule } from './modules/opportunity/opportunity.module.js';
import { OpsToolkitModule } from './modules/ops-toolkit/ops-toolkit.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { ProjectSiteModule } from './modules/project-site/project-site.module.js';
import { PromptTestingCurationModule } from './modules/prompt-testing-curation/prompt-testing-curation.module.js';
import { QualificationModule } from './modules/qualification/qualification.module.js';
import { ReportCenterModule } from './modules/report-center/report-center.module.js';
import { RiskReviewModule } from './modules/risk-review/risk-review.module.js';
import { RuleCurationModule } from './modules/rule-curation/rule-curation.module.js';
import { RuleExtractionModule } from './modules/rule-extraction/rule-extraction.module.js';
import { RulesEngineModule } from './modules/rules-engine/rules-engine.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { SecurityComplianceModule } from './modules/security-compliance/security-compliance.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { SubscriptionModule } from './modules/subscription/subscription.module.js';
import { SystemConfigModule } from './modules/system-config/system-config.module.js';
import { TenderModule } from './modules/tender/tender.module.js';
import { UserModule } from './modules/user/user.module.js';
import { WebhookModule } from './modules/webhook/webhook.module.js';

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
    AddictionModule,
    AiGatewayModule,
    AdminModule,
    AgentWorkspaceModule,
    AdminOpsModule,
    ApprovalModule,
    AuthModule,
    CashflowFinanceModule,
    ChatHubModule,
    CostCatalogModule,
    CostEstimateModule,
    CreditModule,
    DashboardModule,
    DataCurationModule,
    DataExportModule,
    DrawingModule,
    ExternalApiModule,
    GovSoeModule,
    HealthModule,
    KnowledgeModule,
    KnowledgeCurationModule,
    LegalCorpusModule,
    NotificationModule,
    OpportunityModule,
    OpsToolkitModule,
    PaymentModule,
    PromptTestingCurationModule,
    QualificationModule,
    ProjectSiteModule,
    ReportCenterModule,
    RiskReviewModule,
    RuleCurationModule,
    RuleExtractionModule,
    RulesEngineModule,
    SecurityComplianceModule,
    SearchModule,
    StorageModule,
    SubscriptionModule,
    SystemConfigModule,
    TenderModule,
    UserModule,
    WebhookModule,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class AppModule {}

async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT ?? 4000);
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn', 'log'],
  });
  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key', 'x-tenant-id', 'x-trace-id', 'x-user-id'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3010',
      'http://localhost:3011',
      'http://localhost:3012',
      'http://localhost:3013',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3010',
      'http://127.0.0.1:3011',
      'http://127.0.0.1:3012',
      'http://127.0.0.1:3013',
    ],
  });

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
