import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiProviderCode, AiTaskType, type AiRequest } from '@tongqian/types';

import { M312_MODELS, type AiRouteConfig } from './default-routing.js';

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
    if (route.primaryProvider !== AiProviderCode.ALIYUN_DASHSCOPE || route.primaryModel !== M312_MODELS.dashscopeText || route.overseas) {
      throw new BusinessError({
        code: ErrorCodes.GOV_DOMESTIC_MODEL_REQUIRED.code,
        details: { model: route.primaryModel, overseas: route.overseas, primaryProvider: route.primaryProvider, taskType: request.taskType },
        message: 'Government AI requests are restricted to Aliyun DashScope qwen3-max domestic route.',
      });
    }
    return { ...route, fallbackModel: M312_MODELS.dashscopeText, fallbackProvider: AiProviderCode.ALIYUN_DASHSCOPE, model: M312_MODELS.dashscopeText, overseas: false, primaryModel: M312_MODELS.dashscopeText, primaryProvider: AiProviderCode.ALIYUN_DASHSCOPE, provider: AiProviderCode.ALIYUN_DASHSCOPE };
  }

  explain(request: AiRequest): Record<string, unknown> {
    return {
      domesticOnly: String(request.context?.role ?? '').toLowerCase() === 'gov' || GOV_TASKS.has(request.taskType),
      model: M312_MODELS.dashscopeText,
      provider: AiProviderCode.ALIYUN_DASHSCOPE,
      reason: 'M3.12 government and SOE materials are restricted to Aliyun DashScope qwen3-max domestic route.',
      taskType: request.taskType,
    };
  }
}
