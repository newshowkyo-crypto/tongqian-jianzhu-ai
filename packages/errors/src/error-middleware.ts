import { BaseError } from './base-error.js';

export const DEFAULT_ERROR_CODE = 'SYS_INTERNAL_ERROR';
export const DEFAULT_ERROR_MESSAGE = 'Internal server error';
export const DEFAULT_ERROR_STATUS = 500;

export interface ApiErrorFailureResponse {
  code: string;
  data: null;
  message: string;
  traceId: string;
  details?: unknown;
}

export interface ErrorResponseLike {
  status: (statusCode: number) => ErrorResponseLike;
  json: (body: ApiErrorFailureResponse) => unknown;
}

export interface ErrorRequestLike {
  traceId?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export type ErrorNextFunction = (error?: unknown) => void;

export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

export function getErrorMessage(error: unknown): string {
  if (isBaseError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function getTraceId(error: unknown, request?: ErrorRequestLike): string {
  if (isBaseError(error) && error.traceId !== undefined) {
    return error.traceId;
  }

  if (request?.traceId !== undefined) {
    return request.traceId;
  }

  const headerTraceId = request?.headers?.['x-trace-id'];

  if (typeof headerTraceId === 'string') {
    return headerTraceId;
  }

  if (Array.isArray(headerTraceId) && headerTraceId[0] !== undefined) {
    return headerTraceId[0];
  }

  return 'unknown';
}

export function toApiErrorResponse(error: unknown, request?: ErrorRequestLike): ApiErrorFailureResponse {
  const traceId = getTraceId(error, request);

  if (isBaseError(error)) {
    return {
      code: error.code,
      data: null,
      message: error.message,
      traceId,
      details: error.details,
    };
  }

  return {
    code: DEFAULT_ERROR_CODE,
    data: null,
    message: getErrorMessage(error),
    traceId,
  };
}

export function getHttpStatus(error: unknown): number {
  return isBaseError(error) ? error.httpStatus : DEFAULT_ERROR_STATUS;
}

export function errorMiddleware(
  error: unknown,
  request: ErrorRequestLike,
  response: ErrorResponseLike,
  _next?: ErrorNextFunction,
): unknown {
  return response.status(getHttpStatus(error)).json(toApiErrorResponse(error, request));
}
