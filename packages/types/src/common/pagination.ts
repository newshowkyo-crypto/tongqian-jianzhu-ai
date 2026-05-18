export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PaginatedResult<T = unknown> {
  items: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
