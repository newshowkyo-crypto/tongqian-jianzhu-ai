export const DEFAULT_RATE_LIMITS = {
  publicApi: { windowSeconds: 60, maxRequests: 120 },
  authenticatedApi: { windowSeconds: 60, maxRequests: 600 },
  adminApi: { windowSeconds: 60, maxRequests: 300 },
  authLogin: { windowSeconds: 300, maxAttempts: 5 },
  passwordReset: { windowSeconds: 3600, maxAttempts: 3 },
} as const;
