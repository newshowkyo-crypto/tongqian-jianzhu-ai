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
