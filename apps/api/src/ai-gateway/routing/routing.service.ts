import { Injectable } from '@nestjs/common';
import type { AiRequest, AiTaskType } from '@tongqian/types';

import { defaultAiRouting, type AiRouteConfig } from './default-routing.js';

@Injectable()
export class RoutingService {
  select(request: AiRequest): AiRouteConfig {
    const route = defaultAiRouting[request.taskType as AiTaskType];
    if (!route) throw new Error('AI.TASK_TYPE.UNKNOWN');
    if (route.overseas && request.options?.allowOverseasModel !== true) {
      return { ...route, model: 'qwen-max', overseas: false, provider: defaultAiRouting[request.taskType].provider };
    }
    return route;
  }
}
