import { Injectable } from '@nestjs/common';
import type { AiRequest, AiResponse } from '@tongqian/types';

import type { OrchestratorService } from './orchestrator.service.js';

@Injectable()
export class AiGatewayService {
  constructor(private readonly orchestrator: OrchestratorService) {}

  invoke<T>(request: AiRequest): Promise<AiResponse<T>> {
    return this.orchestrator.invoke<T>(request);
  }
}
