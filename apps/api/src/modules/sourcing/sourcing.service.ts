import { Injectable } from '@nestjs/common';

import { sanitizeSourcingText } from './sanitizer.js';

type Direction = 'company_to_gov' | 'gov_to_company';

@Injectable()
export class SourcingService {
  create(input: { direction: Direction; rawSummary: string; region: string; tenantId: string; title: string }): Record<string, unknown> {
    return { ...input, auditRetentionYears: 6, sanitizedSummary: sanitizeSourcingText(input.rawSummary), status: 'open' };
  }

  chat(input: { content: string; fromTenantId: string; sourcingProjectId: string; toTenantId: string }): Record<string, unknown> {
    return { ...input, sanitizedContent: sanitizeSourcingText(input.content), intentConfirmed: false, retentionYears: 6 };
  }

  directions(): Direction[] {
    return ['gov_to_company', 'company_to_gov'];
  }
}
