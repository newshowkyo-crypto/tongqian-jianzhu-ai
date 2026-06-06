import { BusinessError } from '@tongqian/errors';

export function assertNoOverseasGovExport(input: { isGovTenant: boolean; targetRegion: string }): void {
  if (input.isGovTenant && input.targetRegion !== 'CN') {
    throw new BusinessError({ code: 'GOV.DATA_EXPORT.OVERSEAS_FORBIDDEN', httpStatus: 403, message: 'Government data cannot be exported overseas.' });
  }
}

export function govPolicyExportMode(isGovTenant: boolean): 'cn-only' | 'standard' {
  return isGovTenant ? 'cn-only' : 'standard';
}
