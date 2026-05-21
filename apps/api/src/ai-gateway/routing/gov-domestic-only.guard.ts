import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiProviderCode, AiTaskType, type AiRequest } from '@tongqian/types';

import type { AiRouteConfig } from './default-routing.js';

const GOV_TASKS = new Set<AiTaskType>([
  AiTaskType.GOV_DOC_NOTICE,
  AiTaskType.GOV_DOC_REPORT,
  AiTaskType.GOV_DOC_REQUEST,
  AiTaskType.GOV_POLICY_IMPACT,
]);

@Injectable()
export class GovDomesticOnlyGuard {
  assertDomestic(request: AiRequest, route: AiRouteConfig): AiRouteConfig {
    const role = String(request.context?.role ?? '').toLowerCase();
    const isGov = role === 'gov' || GOV_TASKS.has(request.taskType);
    if (!isGov) return route;
    if (route.primaryProvider !== AiProviderCode.DEEPSEEK_DIRECT || route.fallbackProvider !== AiProviderCode.DEEPSEEK_DIRECT || route.overseas) {
      throw new BusinessError({
        code: ErrorCodes.GOV_DOMESTIC_MODEL_REQUIRED.code,
        details: { fallbackProvider: route.fallbackProvider, overseas: route.overseas, primaryProvider: route.primaryProvider, taskType: request.taskType },
        message: 'Government AI requests are restricted to the domestic DeepSeek route.',
      });
    }
    return { ...route, fallbackProvider: AiProviderCode.DEEPSEEK_DIRECT, overseas: false, primaryProvider: AiProviderCode.DEEPSEEK_DIRECT };
  }

  explain(request: AiRequest): Record<string, unknown> {
    return {
      domesticOnly: String(request.context?.role ?? '').toLowerCase() === 'gov' || GOV_TASKS.has(request.taskType),
      provider: AiProviderCode.DEEPSEEK_DIRECT,
      reason: 'M3.11 government and SOE materials do not leave the domestic model route.',
      taskType: request.taskType,
    };
  }
}
