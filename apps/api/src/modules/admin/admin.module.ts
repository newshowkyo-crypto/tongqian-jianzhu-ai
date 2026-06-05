import { Module } from '@nestjs/common';

import { TenantContextService } from '../../common/context/tenant-context.service.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { CostCatalogModule } from '../cost-catalog/cost-catalog.module.js';
import { LegalCorpusModule } from '../legal-corpus/legal-corpus.module.js';
import { RuleExtractionModule } from '../rule-extraction/rule-extraction.module.js';
import { SecurityComplianceService } from '../security-compliance/security-compliance.service.js';
import { SystemConfigService } from '../system-config/system-config.service.js';

import { AddictionConfigAdminController } from './addiction-config/addiction-config-admin.controller.js';
import { AdminResourceService } from './admin-resource.service.js';
import { AgentsAdminController } from './agents/agents-admin.controller.js';
import { ApprovalsAdminController } from './approvals/approvals-admin.controller.js';
import { AuditAdminController } from './audit/audit-admin.controller.js';
import { BillingAdminController } from './billing/billing-admin.controller.js';
import { CaseMarketAdminController } from './case-market/case-market-admin.controller.js';
import { ConfigAdminController } from './config/config-admin.controller.js';
import { CostCatalogAdminController } from './cost-catalog-admin/cost-catalog-admin.controller.js';
import { CredentialsAdminController } from './credentials/credentials-admin.controller.js';
import { CredentialsAdminRepository } from './credentials/credentials-admin.repository.js';
import { CredentialsAdminService } from './credentials/credentials-admin.service.js';
import { CredentialsController } from './credentials/credentials.controller.js';
import { CredentialsService } from './credentials/credentials.service.js';
import { CreditsAdminController } from './credits/credits-admin.controller.js';
import { DataExportsAdminController } from './data-exports/data-exports-admin.controller.js';
import { FeatureFlagsAdminController } from './feature-flags/feature-flags-admin.controller.js';
import { FuelProgressModule } from './fuel-progress/fuel-progress.module.js';
import { GovAdminController } from './gov/gov-admin.controller.js';
import { IcpController } from './icp/icp.controller.js';
import { IcpService } from './icp/icp.service.js';
import { IncidentsAdminController } from './incidents/incidents-admin.controller.js';
import { IngestAdminController } from './ingest/ingest-admin.controller.js';
import { IngestAdminRepository } from './ingest/ingest-admin.repository.js';
import { JobsAdminController } from './jobs/jobs-admin.controller.js';
import { LegalCorpusAdminController } from './legal-corpus-admin/legal-corpus-admin.controller.js';
import { ModelsAdminController } from './models/models-admin.controller.js';
import { NotificationsAdminController } from './notifications/notifications-admin.controller.js';
import { OnboardingController } from './onboarding/onboarding.controller.js';
import { OnboardingService } from './onboarding/onboarding.service.js';
import { OperationsAdminController } from './operations/operations-admin.controller.js';
import { OpportunitiesAdminController } from './opportunities/opportunities-admin.controller.js';
import { OrdersAdminController } from './orders/orders-admin.controller.js';
import { PolicyFundsAdminController } from './policy-funds/policy-funds-admin.controller.js';
import { PromptTestsAdminController } from './prompt-tests/prompt-tests-admin.controller.js';
import { PromptsAdminController } from './prompts/prompts-admin.controller.js';
import { RefundsAdminController } from './refunds/refunds-admin.controller.js';
import { ReportsAdminController } from './reports/reports-admin.controller.js';
import { RewardClaimsAdminController } from './reward-claims/reward-claims-admin.controller.js';
import { RiskAdminController } from './risk/risk-admin.controller.js';
import { RuleCandidatesModule } from './rule-candidates/rule-candidates.module.js';
import { RulesAdminController } from './rules/rules-admin.controller.js';
import { SecurityAdminController } from './security/security-admin.controller.js';
import { ServicesAdminController } from './services/services-admin.controller.js';
import { SubscriptionsAdminController } from './subscriptions/subscriptions-admin.controller.js';
import { SystemConfigAdminController } from './system-config/system-config-admin.controller.js';
import { TenantsAdminController } from './tenants/tenants-admin.controller.js';
import { UsersAdminController } from './users/users-admin.controller.js';

@Module({
  controllers: [AddictionConfigAdminController, AgentsAdminController, ApprovalsAdminController, AuditAdminController, BillingAdminController, CaseMarketAdminController, ConfigAdminController, CostCatalogAdminController, CredentialsAdminController, CredentialsController, CreditsAdminController, DataExportsAdminController, FeatureFlagsAdminController, GovAdminController, IcpController, IngestAdminController, IncidentsAdminController, JobsAdminController, LegalCorpusAdminController, ModelsAdminController, NotificationsAdminController, OnboardingController, OperationsAdminController, OpportunitiesAdminController, OrdersAdminController, PolicyFundsAdminController, PromptTestsAdminController, PromptsAdminController, RefundsAdminController, ReportsAdminController, RewardClaimsAdminController, RiskAdminController, RulesAdminController, SecurityAdminController, ServicesAdminController, SubscriptionsAdminController, SystemConfigAdminController, TenantsAdminController, UsersAdminController],
  exports: [AdminResourceService],
  imports: [CostCatalogModule, FuelProgressModule, LegalCorpusModule, RuleCandidatesModule, RuleExtractionModule],
  providers: [AdminResourceService, CredentialsAdminRepository, CredentialsAdminService, CredentialsService, IcpService, IngestAdminRepository, OnboardingService, SecurityComplianceService, SystemConfigService, TenantContextService, JwtGuard, PermissionGuard],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AdminModule {}
