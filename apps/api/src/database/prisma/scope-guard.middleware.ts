const REQUIRED_SCOPE_KEYS = ['tenantId', 'scopeType'];

export function assertScopedWhere(where: Record<string, unknown>): void {
  for (const key of REQUIRED_SCOPE_KEYS) {
    if (!(key in where)) {
      throw new Error(`PERM.SCOPE.MISSING_${key.toUpperCase()}`);
    }
  }
}
