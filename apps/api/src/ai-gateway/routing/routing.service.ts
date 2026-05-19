import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiProviderCode, type AiRequest, type AiTaskType } from '@tongqian/types';

import { defaultAiRouting, type AiRouteConfig } from './default-routing.js';

@Injectable()
export class RoutingService {
  /**
   * Selects the provider/model route for the request.
   *
   * @param request AI request.
   * @returns DeepSeek-only route for M3.7.
   */
  select(request: AiRequest): AiRouteConfig {
    const route = defaultAiRouting[request.taskType as AiTaskType];
    if (!route) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { taskType: request.taskType },
        message: 'AI task type is not registered in routing table.',
      });
    }
    return this.enforceM37DeepSeek(route);
  }

  /**
   * Returns a serializable route snapshot for admin model routing pages.
   *
   * @returns Routing table summary.
   */
  snapshot(): Array<{ model: string; provider: AiProviderCode; taskType: AiTaskType }> {
    return Object.entries(defaultAiRouting).map(([taskType, route]) => ({
      model: route.model,
      provider: route.provider,
      taskType: taskType as AiTaskType,
    }));
  }

  /**
   * Validates that route overrides still comply with M3.7 all-DeepSeek policy.
   *
   * @param route Candidate route.
   * @returns The route when compliant.
   */
  enforceM37DeepSeek(route: AiRouteConfig): AiRouteConfig {
    if (route.provider !== AiProviderCode.DEEPSEEK_DIRECT || route.primaryProvider !== AiProviderCode.DEEPSEEK_DIRECT) {
      throw new BusinessError({
        code: ErrorCodes.GOV_DOMESTIC_MODEL_REQUIRED.code,
        details: { provider: route.provider, primaryProvider: route.primaryProvider },
        message: 'M3.7 routing only allows DeepSeek direct provider.',
      });
    }
    return { ...route, fallbackProvider: AiProviderCode.DEEPSEEK_DIRECT, overseas: false };
  }

  /**
   * Lists task types whose route appears non-compliant for health checks.
   *
   * @returns Non-compliant task route ids.
   */
  findNonCompliantRoutes(): string[] {
    return Object.entries(defaultAiRouting)
      .filter(([, route]) => route.provider !== AiProviderCode.DEEPSEEK_DIRECT || route.fallbackProvider !== AiProviderCode.DEEPSEEK_DIRECT)
      .map(([taskType]) => taskType);
  }

  /**
   * Resolves failover sequence. M3.7 intentionally retries inside DeepSeek only.
   *
   * @param route Base route.
   * @returns Ordered model/provider attempts.
   */
  failoverPlan(route: AiRouteConfig): Array<{ model: string; provider: AiProviderCode }> {
    const compliant = this.enforceM37DeepSeek(route);
    return [
      { model: compliant.primaryModel, provider: AiProviderCode.DEEPSEEK_DIRECT },
      { model: compliant.fallbackModel, provider: AiProviderCode.DEEPSEEK_DIRECT },
    ];
  }

  /**
   * Confirms whether an admin override may be accepted without restart.
   *
   * @param route Candidate route.
   * @returns True for DeepSeek-only overrides.
   */
  canHotSwap(route: AiRouteConfig): boolean {
    return route.primaryProvider === AiProviderCode.DEEPSEEK_DIRECT && route.fallbackProvider === AiProviderCode.DEEPSEEK_DIRECT && !route.overseas;
  }
}
