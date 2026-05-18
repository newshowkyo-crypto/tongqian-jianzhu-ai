export const DEFAULT_CACHE_TTL_SECONDS = {
  exactAiResult: 86400,
  semanticAiResult: 604800,
  systemConfig: 300,
  permissionSnapshot: 300,
  userSession: 604800,
  dashboardKpi: 60,
  providerHealth: 30,
} as const;
