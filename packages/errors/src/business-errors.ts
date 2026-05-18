import { BaseError, type BaseErrorOptions } from './base-error.js';

type ErrorInit = Omit<BaseErrorOptions, 'httpStatus'> & {
  httpStatus?: number;
};

export class BusinessError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 422, ...options });
  }
}

export class ValidationError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 400, ...options });
  }
}

export class AuthError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 401, ...options });
  }
}

export class PermissionError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 403, ...options });
  }
}

export class NotFoundError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 404, ...options });
  }
}

export class ConflictError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 409, ...options });
  }
}

export class RateLimitError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 429, ...options });
  }
}

export class UpstreamError extends BaseError {
  public constructor(options: ErrorInit) {
    super({ httpStatus: 502, ...options });
  }
}
