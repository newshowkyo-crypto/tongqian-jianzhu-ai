import { Injectable } from '@nestjs/common';

const docCredits: Record<string, number> = { feasibility_study: 1500, minute: 300, project_proposal: 800, speech: 500 };

@Injectable()
export class GovDocumentService {
  readonly provider = 'aliyun-bailian';

  generate(input: { body: string; docType: string; generatorIp: string; tenantId: string; title: string; userId: string }): Record<string, unknown> {
    const watermark = this.watermark(input.userId, input.generatorIp);
    return { ...input, aiConfidence: 'medium', creditsCost: docCredits[input.docType] ?? 300, provider: this.provider, watermark };
  }

  transcribeMinute(input: { audioUrl: string; generatorIp: string; tenantId: string; transcript?: string; userId: string }): Record<string, unknown> {
    return { ...input, creditsCost: 300, provider: this.provider, structuredMinute: { actions: [], attendees: [], decisions: [], topics: [] }, watermark: this.watermark(input.userId, input.generatorIp) };
  }

  listTemplates(): string[] {
    return ['request', 'report', 'bulletin', 'reply', 'supervise', 'research', 'speech', 'minute', 'outline', 'summary', 'scheme', 'project_proposal', 'feasibility_study'];
  }

  private watermark(generatorUserId: string, generatorIp: string): string {
    return `internal use only | user=${generatorUserId} | generatorIp=${generatorIp} | time=${new Date().toISOString()}`;
  }
}
