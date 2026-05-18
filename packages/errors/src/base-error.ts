export interface BaseErrorOptions {
  code: string;
  httpStatus: number;
  message: string;
  details?: unknown;
  traceId?: string;
  cause?: unknown;
}

export interface SerializedBaseError {
  name: string;
  code: string;
  httpStatus: number;
  message: string;
  details?: unknown;
  traceId?: string;
}

export class BaseError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: unknown;
  public readonly traceId?: string;
  public override readonly cause?: unknown;

  public constructor(options: BaseErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.details = options.details;
    this.traceId = options.traceId;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): SerializedBaseError {
    return {
      name: this.name,
      code: this.code,
      httpStatus: this.httpStatus,
      message: this.message,
      details: this.details,
      traceId: this.traceId,
    };
  }
}
