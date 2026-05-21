import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import type { AiProviderCode, AiRequest, AiTaskType } from '@tongqian/types';

import { defaultAiRouting, isM312DomesticProvider, type AiRouteConfig } from './default-routing.js';

@Injectable()
export class RoutingService {
  /**
   * Selects the provider/model route for the request.
   *
   * @param request AI request.
   * @returns M3.12 China-only flagship route.
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
    return this.enforceM312Domestic(route);
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
   * Validates that route overrides comply with M3.12 domestic flagship policy.
   *
   * @param route Candidate route.
   * @returns The route when compliant.
   */
  enforceM312Domestic(route: AiRouteConfig): AiRouteConfig {
    if (!isM312DomesticProvider(route.provider) || !isM312DomesticProvider(route.primaryProvider) || !isM312DomesticProvider(route.fallbackProvider) || route.overseas) {
      throw new BusinessError({
        code: ErrorCodes.GOV_DOMESTIC_MODEL_REQUIRED.code,
        details: { fallbackProvider: route.fallbackProvider, provider: route.provider, primaryProvider: route.primaryProvider },
        message: 'M3.12 routing only allows DeepSeek direct and Aliyun DashScope domestic providers.',
      });
    }
    return { ...route, overseas: false };
  }

  /**
   * Lists task types whose route appears non-compliant for health checks.
   *
   * @returns Non-compliant task route ids.
   */
  findNonCompliantRoutes(): string[] {
    return Object.entries(defaultAiRouting)
      .filter(([, route]) => !isM312DomesticProvider(route.provider) || !isM312DomesticProvider(route.fallbackProvider) || route.overseas)
      .map(([taskType]) => taskType);
  }

  /**
   * Resolves failover sequence. M3.12 retries inside the same domestic provider and model family.
   *
   * @param route Base route.
   * @returns Ordered model/provider attempts.
   */
  failoverPlan(route: AiRouteConfig): Array<{ model: string; provider: AiProviderCode }> {
    const compliant = this.enforceM312Domestic(route);
    return [
      { model: compliant.primaryModel, provider: compliant.primaryProvider },
      { model: compliant.fallbackModel, provider: compliant.fallbackProvider },
    ];
  }

  /**
   * Confirms whether an admin override may be accepted without restart.
   *
   * @param route Candidate route.
   * @returns True for DeepSeek-only overrides.
   */
  canHotSwap(route: AiRouteConfig): boolean {
    return isM312DomesticProvider(route.primaryProvider) && isM312DomesticProvider(route.fallbackProvider) && !route.overseas;
  }
}
