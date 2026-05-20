import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import type { AiRequest, AiResponse } from '@tongqian/types';

import { OrchestratorService as OrchestratorServiceToken, type OrchestratorService } from './orchestrator.service.js';

export interface AiGatewayAuditEnvelope {
  readonly action: 'AI_GATEWAY_INVOKE' | 'AI_GATEWAY_VALIDATE' | 'AI_GATEWAY_PREVIEW';
  readonly idempotencyKey?: string;
  readonly taskType: string;
  readonly tenantId: string;
  readonly traceHint: string;
  readonly userId: string;
}

export interface AiGatewayPreview {
  readonly cacheStrategy: string;
  readonly idempotencyKey: string;
  readonly taskType: string;
  readonly tenantId: string;
  readonly userId: string;
}

@Injectable()
export class AiGatewayService {
  constructor(@Inject(OrchestratorServiceToken) private readonly orchestrator: OrchestratorService) {}

  /**
   * Invokes the full AI Gateway chain after validating tenant and idempotency context.
   *
   * @param request Gateway request from business service.
   * @returns AI response with required output elements, cost, provider, and trace id.
   */
  async invoke<T>(request: AiRequest): Promise<AiResponse<T>> {
    this.validateRequest(request);
    return this.orchestrator.invoke<T>(this.withIdempotency(request));
  }

  /**
   * Builds an audit envelope for callers that need to persist intent before queueing.
   *
   * @param request Gateway request.
   * @returns Audit-safe envelope without raw prompt content.
   */
  buildAuditEnvelope(request: AiRequest): AiGatewayAuditEnvelope {
    this.validateRequest(request);
    return {
      action: 'AI_GATEWAY_INVOKE',
      idempotencyKey: request.options?.idempotencyKey,
      taskType: request.taskType,
      tenantId: request.tenantId,
      traceHint: this.traceHint(request),
      userId: request.userId,
    };
  }

  /**
   * Produces a dry-run preview used by admin Prompt testing and cost checks.
   *
   * @param request Gateway request.
   * @returns Preview with normalized idempotency and cache strategy.
   */
  preview(request: AiRequest): AiGatewayPreview {
    this.validateRequest(request);
    const normalized = this.withIdempotency(request);
    return {
      cacheStrategy: normalized.options?.cacheStrategy ?? 'default',
      idempotencyKey: normalized.options?.idempotencyKey ?? this.deriveIdempotencyKey(normalized),
      taskType: normalized.taskType,
      tenantId: normalized.tenantId,
      userId: normalized.userId,
    };
  }

  /**
   * Validates request shape for services that enqueue AI work asynchronously.
   *
   * @param request Gateway request.
   */
  validateRequest(request: AiRequest): void {
    const missing = [
      request.taskType ? '' : 'taskType',
      request.tenantId ? '' : 'tenantId',
      request.userId ? '' : 'userId',
      request.input === undefined ? 'input' : '',
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { missing },
        message: 'AI Gateway request is missing required context.',
      });
    }
  }

  private withIdempotency<TInput, TContext>(request: AiRequest<TInput, TContext>): AiRequest<TInput, TContext> {
    return {
      ...request,
      options: {
        ...request.options,
        idempotencyKey: request.options?.idempotencyKey ?? this.deriveIdempotencyKeyFromParts(request.tenantId, request.userId, request.taskType, request.input),
      },
    };
  }

  private deriveIdempotencyKey(request: AiRequest): string {
    return this.deriveIdempotencyKeyFromParts(request.tenantId, request.userId, request.taskType, request.input);
  }

  private deriveIdempotencyKeyFromParts(tenantId: string, userId: string, taskType: string, input: unknown): string {
    const raw = `${tenantId}:${userId}:${taskType}:${JSON.stringify(input).slice(0, 128)}`;
    let hash = 0;
    for (let index = 0; index < raw.length; index += 1) hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
    return `ai-${hash.toString(16).padStart(8, '0')}`;
  }

  private traceHint(request: AiRequest): string {
    return `${request.tenantId.slice(0, 8)}:${request.userId.slice(0, 8)}:${request.taskType}`;
  }
}
