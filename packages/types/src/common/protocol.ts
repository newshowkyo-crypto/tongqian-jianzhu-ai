export type EntityId = string;
export type TenantId = string;
export type UserId = string;
export type ProjectId = string;
export type TraceId = string;
export type IdempotencyKey = string;

export interface IdempotentRequest<T = unknown> {
  idempotencyKey: IdempotencyKey;
  payload: T;
}

export enum AsyncTaskStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export interface AsyncTaskRef {
  taskId: EntityId;
  status: AsyncTaskStatus;
  traceId: TraceId;
  queuedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface MoneyAmount {
  amount: string;
  currency: 'CNY';
}

export interface AuditLog {
  id: EntityId;
  traceId: TraceId;
  userId?: UserId;
  tenantId?: TenantId;
  action: string;
  resource: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export const ASYNC_TASK_STATUS_VALUES = Object.values(AsyncTaskStatus);
export const DEFAULT_CURRENCY = 'CNY';
