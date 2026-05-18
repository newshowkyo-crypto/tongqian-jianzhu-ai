import { Injectable } from '@nestjs/common';

import type { RegistrationRole } from './registration-types.js';

@Injectable()
export class DomainRouterService {
  resolve(domain?: string): RegistrationRole | undefined {
    if (domain?.includes('agents.')) return 'AGENT';
    if (domain?.includes('gov.')) return 'GOV_USER';
    if (domain?.includes('admin.')) return 'PLATFORM';
    if (domain?.includes('tongqian')) return 'BUILDING_COMPANY_USER';
    return undefined;
  }
}
