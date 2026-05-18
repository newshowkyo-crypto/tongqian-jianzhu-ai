export { BaseError, type BaseErrorOptions, type SerializedBaseError } from './base-error.js';
export {
  AuthError,
  BusinessError,
  ConflictError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  UpstreamError,
  ValidationError,
} from './business-errors.js';
export { ErrorCodes, type ErrorCode, type ErrorCodeDef, type ErrorCodeKey } from './codes.js';
export {
  DEFAULT_ERROR_CODE,
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_ERROR_STATUS,
  errorMiddleware,
  getErrorMessage,
  getHttpStatus,
  getTraceId,
  isBaseError,
  toApiErrorResponse,
  type ApiErrorFailureResponse,
  type ErrorNextFunction,
  type ErrorRequestLike,
  type ErrorResponseLike,
} from './error-middleware.js';
