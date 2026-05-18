export type ApiSuccessCode = 0;
export type ApiErrorCode = string;

export interface ApiResponse<T = unknown> {
  code: ApiSuccessCode | ApiErrorCode;
  data: T | null;
  message: string;
  traceId: string;
  details?: unknown;
}

export interface ApiResponseListData<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type ApiResponseList<T = unknown> = ApiResponse<ApiResponseListData<T>>;

export interface ApiErrorResponse {
  code: ApiErrorCode;
  data: null;
  message: string;
  traceId: string;
  details?: unknown;
}

export const API_SUCCESS_CODE: ApiSuccessCode = 0;
