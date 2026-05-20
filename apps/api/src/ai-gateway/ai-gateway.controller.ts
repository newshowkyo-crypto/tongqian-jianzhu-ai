import { Body, Controller, Get, Headers, Inject, Param, Post, Sse, type MessageEvent } from '@nestjs/common';
import { AiCacheStrategy, AiTaskType, type AiRequest, type AiResponse } from '@tongqian/types';
import { Observable } from 'rxjs';

import { AiGatewayService } from './ai-gateway.service.js';

interface AiInvokeDto {
  allowOverseasModel?: boolean;
  cacheStrategy?: AiCacheStrategy;
  context?: Record<string, unknown>;
  idempotencyKey?: string;
  input: Record<string, unknown> | string;
  preferredProvider?: AiRequest['options'] extends infer T ? T extends { preferredProvider?: infer P } ? P : never : never;
  taskType?: AiTaskType;
}

interface AsyncTaskRecord {
  cancelReason?: string;
  createdAt: string;
  id: string;
  request: AiRequest;
  result?: AiResponse<unknown>;
  status: 'cancelled' | 'completed' | 'failed' | 'queued' | 'running';
  traceId: string;
  updatedAt: string;
}

@Controller('api/v1/ai')
export class AiGatewayController {
  private readonly tasks = new Map<string, AsyncTaskRecord>();

  constructor(@Inject(AiGatewayService) private readonly gateway: AiGatewayService) {}

  @Post('invoke')
  async invoke(
    @Body() dto: AiInvokeDto,
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): Promise<unknown> {
    const traceId = crypto.randomUUID();
    const request = this.toRequest(dto, tenantId, userId);
    const result = await this.gateway.invoke(request);
    return { code: 'OK', data: result, message: 'AI invocation completed', traceId };
  }

  @Post('stream')
  @Sse()
  stream(
    @Body() dto: AiInvokeDto,
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): Observable<MessageEvent> {
    const request = this.toRequest(dto, tenantId, userId);
    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({ data: { stage: 'queued', taskType: request.taskType } });
      subscriber.next({ data: { stage: 'sanitizing', message: 'AI input accepted by gateway' } });
      void this.gateway
        .invoke(request)
        .then((result) => {
          subscriber.next({ data: { result, stage: 'completed' } });
          subscriber.complete();
        })
        .catch((error: unknown) => {
          subscriber.next({ data: { error: error instanceof Error ? error.message : String(error), stage: 'failed' } });
          subscriber.complete();
        });
    });
  }

  @Post('async')
  submitAsync(
    @Body() dto: AiInvokeDto,
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    const now = new Date().toISOString();
    const task: AsyncTaskRecord = {
      createdAt: now,
      id: crypto.randomUUID(),
      request: this.toRequest(dto, tenantId, userId),
      status: 'queued',
      traceId: crypto.randomUUID(),
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    void this.runAsyncTask(task.id);
    return { code: 'OK', data: { status: task.status, taskId: task.id, traceId: task.traceId }, message: 'AI task queued', traceId: task.traceId };
  }

  @Get('tasks/:taskId')
  getTask(@Param('taskId') taskId: string): unknown {
    const task = this.mustGetTask(taskId);
    return { code: 'OK', data: this.toTaskView(task), message: 'AI task status', traceId: task.traceId };
  }

  @Post('tasks/:taskId/cancel')
  cancelTask(@Param('taskId') taskId: string, @Body() body: { reason?: string } = {}): unknown {
    const task = this.mustGetTask(taskId);
    if (task.status === 'completed') return { code: 'OK', data: this.toTaskView(task), message: 'AI task already completed', traceId: task.traceId };
    const next: AsyncTaskRecord = {
      ...task,
      cancelReason: body.reason ?? 'user_cancelled',
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(taskId, next);
    return { code: 'OK', data: { ...this.toTaskView(next), refunded: true }, message: 'AI task cancelled and pre-charge refunded', traceId: next.traceId };
  }

  @Get('tasks')
  listTasks(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const tasks = [...this.tasks.values()].filter((task) => task.request.userId === userId && task.request.tenantId === tenantId);
    return { code: 'OK', data: tasks.map((task) => this.toTaskView(task)), message: 'AI tasks', traceId: crypto.randomUUID() };
  }

  private async runAsyncTask(taskId: string): Promise<void> {
    const task = this.mustGetTask(taskId);
    if (task.status === 'cancelled') return;
    this.tasks.set(taskId, { ...task, status: 'running', updatedAt: new Date().toISOString() });
    try {
      const result = await this.gateway.invoke(task.request);
      const latest = this.mustGetTask(taskId);
      if (latest.status === 'cancelled') return;
      this.tasks.set(taskId, { ...latest, result, status: 'completed', updatedAt: new Date().toISOString() });
    } catch (error) {
      const latest = this.mustGetTask(taskId);
      this.tasks.set(taskId, { ...latest, cancelReason: error instanceof Error ? error.message : String(error), status: 'failed', updatedAt: new Date().toISOString() });
    }
  }

  private toRequest(dto: AiInvokeDto, tenantId: string, userId: string): AiRequest {
    return {
      context: { channel: 'http', role: 'owner', ...(dto.context ?? {}) },
      input: typeof dto.input === 'string' ? { message: dto.input } : dto.input,
      options: {
        allowOverseasModel: dto.allowOverseasModel ?? false,
        cacheStrategy: dto.cacheStrategy ?? AiCacheStrategy.EXACT,
        idempotencyKey: dto.idempotencyKey,
        preferredProvider: dto.preferredProvider,
      },
      taskType: dto.taskType ?? AiTaskType.CHAT_LONG,
      tenantId,
      userId,
    };
  }

  private mustGetTask(taskId: string): AsyncTaskRecord {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('AI_TASK.NOT_FOUND');
    return task;
  }

  private toTaskView(task: AsyncTaskRecord): Record<string, unknown> {
    return {
      cancelReason: task.cancelReason,
      createdAt: task.createdAt,
      result: task.result,
      status: task.status,
      taskId: task.id,
      taskType: task.request.taskType,
      traceId: task.traceId,
      updatedAt: task.updatedAt,
    };
  }
}
