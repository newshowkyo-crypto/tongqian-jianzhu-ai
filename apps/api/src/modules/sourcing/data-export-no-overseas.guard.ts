export function assertNoOverseasGovExport(input: { isGovTenant: boolean; targetRegion: string }): void {
  if (input.isGovTenant && input.targetRegion !== 'CN') {
    throw new Error('GOV_DATA_EXPORT_OVERSEAS_FORBIDDEN');
  }
}

export function govPolicyExportMode(isGovTenant: boolean): 'cn-only' | 'standard' {
  return isGovTenant ? 'cn-only' : 'standard';
}
