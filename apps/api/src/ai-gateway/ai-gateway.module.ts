import { Module } from '@nestjs/common';

import { AiGatewayController } from './ai-gateway.controller.js';
import { AiGatewayService } from './ai-gateway.service.js';
import { AiExportAuditService } from './audit/ai-export-audit.service.js';
import { AutoDowngradeService } from './auto-downgrade.service.js';
import { ExactCacheService } from './cache/exact-cache.service.js';
import { SemanticCacheService } from './cache/semantic-cache.service.js';
import { CostCapEnforcerService } from './cost-cap-enforcer.service.js';
import { CostMeterService } from './cost-meter.service.js';
import { CreditLedgerService } from './credit/credit-ledger.service.js';
import { OrchestratorService } from './orchestrator.service.js';
import { OutputValidatorService } from './output-validator.service.js';
import { PromptBuilderService } from './prompt-builder.service.js';
import { ProviderRouterService } from './providers/provider-router.service.js';
import { GovDomesticOnlyGuard } from './routing/gov-domestic-only.guard.js';
import { RoutingService } from './routing/routing.service.js';
import { SafetyFilterService } from './safety-filter.service.js';
import { SanitizerService } from './sanitizer/sanitizer.service.js';

@Module({
  controllers: [AiGatewayController],
  exports: [AiGatewayService],
  providers: [
    AiExportAuditService,
    AiGatewayService,
    AutoDowngradeService,
    CostCapEnforcerService,
    CostMeterService,
    CreditLedgerService,
    ExactCacheService,
    GovDomesticOnlyGuard,
    OrchestratorService,
    OutputValidatorService,
    PromptBuilderService,
    ProviderRouterService,
    RoutingService,
    SafetyFilterService,
    SemanticCacheService,
    SanitizerService,
  ],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AiGatewayModule {}
