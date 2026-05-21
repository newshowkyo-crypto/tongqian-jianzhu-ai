import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { AiCacheStrategy, type AiRequest, type AiResponse } from '@tongqian/types';

import { AiExportAuditService as AiExportAuditServiceToken, type AiExportAuditService } from './audit/ai-export-audit.service.js';
import { ExactCacheService as ExactCacheServiceToken, type ExactCacheService } from './cache/exact-cache.service.js';
import { CostCapEnforcerService as CostCapEnforcerServiceToken, type CostCapEnforcerService } from './cost-cap-enforcer.service.js';
import { CostMeterService as CostMeterServiceToken, type CostMeterService } from './cost-meter.service.js';
import { CreditLedgerService as CreditLedgerServiceToken, type CreditLedgerService } from './credit/credit-ledger.service.js';
import { OutputValidatorService as OutputValidatorServiceToken, type OutputValidatorService } from './output-validator.service.js';
import { PromptBuilderService as PromptBuilderServiceToken, type PromptBuilderService } from './prompt-builder.service.js';
import { contractReviewBasicPrompt } from './prompts/contract-review-basic.js';
import { promptTemplateByTaskType } from './prompts/index.js';
import { ProviderRouterService as ProviderRouterServiceToken, type ProviderRouterService } from './providers/provider-router.service.js';
import { GovDomesticOnlyGuard as GovDomesticOnlyGuardToken, type GovDomesticOnlyGuard } from './routing/gov-domestic-only.guard.js';
import { RoutingService as RoutingServiceToken, type RoutingService } from './routing/routing.service.js';
import { SafetyFilterService as SafetyFilterServiceToken, type SafetyFilterService } from './safety-filter.service.js';
import { SanitizerService as SanitizerServiceToken, type SanitizerService } from './sanitizer/sanitizer.service.js';

@Injectable()
export class OrchestratorService {
  constructor(
    @Inject(AiExportAuditServiceToken) private readonly audit: AiExportAuditService,
    @Inject(ExactCacheServiceToken) private readonly cache: ExactCacheService,
    @Inject(CostCapEnforcerServiceToken) private readonly costCap: CostCapEnforcerService,
    @Inject(CostMeterServiceToken) private readonly costMeter: CostMeterService,
    @Inject(CreditLedgerServiceToken) private readonly credit: CreditLedgerService,
    @Inject(OutputValidatorServiceToken) private readonly outputValidator: OutputValidatorService,
    @Inject(PromptBuilderServiceToken) private readonly promptBuilder: PromptBuilderService,
    @Inject(ProviderRouterServiceToken) private readonly providers: ProviderRouterService,
    @Inject(GovDomesticOnlyGuardToken) private readonly govDomesticOnly: GovDomesticOnlyGuard,
    @Inject(RoutingServiceToken) private readonly routing: RoutingService,
    @Inject(SafetyFilterServiceToken) private readonly safety: SafetyFilterService,
    @Inject(SanitizerServiceToken) private readonly sanitizer: SanitizerService,
  ) {}

  async invoke<T>(request: AiRequest): Promise<AiResponse<T>> {
    const traceId = randomUUID();
    const template = promptTemplateByTaskType.get(request.taskType) ?? contractReviewBasicPrompt;
    const route = this.govDomesticOnly.assertDomestic(request, this.routing.select(request));
    const cacheHit = request.options?.cacheStrategy !== AiCacheStrategy.NONE ? this.cache.lookup<AiResponse<T>>(request.taskType, request.input) : undefined;
    const key = request.options?.idempotencyKey ?? traceId;

    this.credit.preCharge(key, route.costCredits);
    if (cacheHit) {
      this.credit.refund(key);
      return { ...cacheHit, cacheHit: true };
    }

    const sanitized = template.needsSanitize ? this.sanitizer.mask(request.input) : { masked: JSON.stringify(request.input), maskTypes: [], replacements: {} };
    const messages = this.promptBuilder.build(template, sanitized.masked);
    const response = await this.providers.invoke<T>(request.options?.preferredProvider ?? route.provider, {
      messages,
      model: this.costCap.shouldDowngrade(0) ? 'deepseek-chat' : route.model,
    });

    const restored = typeof response.content === 'string' ? this.sanitizer.unmask(response.content, sanitized.replacements) : response.content;
    const validated = this.outputValidator.validate(restored);
    this.safety.check(validated);
    this.credit.commit(key);
    this.audit.write({ fieldCount: sanitized.maskTypes.length, input: request.input, masked: sanitized.masked, providerName: response.provider, traceId });
    this.costMeter.track({ cacheHit: false, credits: route.costCredits, inputTokens: response.inputTokens, outputTokens: response.outputTokens });

    const output = {
      ...validated,
      cacheHit: false,
      cost: { credits: route.costCredits, rmb: route.costCredits / 100 },
      data: validated as T,
      modelUsed: route.model,
      providerUsed: response.provider,
      traceId,
    };
    this.cache.set(request.taskType, request.input, output);
    return output;
  }
}
