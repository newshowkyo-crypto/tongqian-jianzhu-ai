interface HeaderRequest {
  headers: Record<string, string | string[] | undefined>;
}

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

export function traceIdMiddleware(request: HeaderRequest, response: HeaderResponse, next: () => void): void {
  const traceId = request.headers['x-trace-id']?.toString() ?? crypto.randomUUID();
  request.headers['x-trace-id'] = traceId;
  response.setHeader('x-trace-id', traceId);
  next();
}
