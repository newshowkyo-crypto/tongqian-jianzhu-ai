import { Injectable } from '@nestjs/common';

@Injectable()
export class BriefingService {
  generateSafetyBriefing(input: { projectId: string; siteCondition: string; weather?: string; workType: string }): Record<string, unknown> {
    return this.record('safety', input.projectId, input.workType, input.siteCondition);
  }

  generateTechnicalBriefing(input: { process: string; projectId: string; siteCondition: string }): Record<string, unknown> {
    return this.record('technical', input.projectId, input.process, input.siteCondition);
  }

  private record(type: 'safety' | 'technical', projectId: string, workType: string, siteCondition: string): Record<string, unknown> {
    const id = crypto.randomUUID();
    const signUrl = `https://h5.tongqian.local/briefings/${id}/sign`;
    return { constructionLog: { aiTaskId: `briefing-${id}`, projectId, tags: [type, workType], userInput: siteCondition }, id, qrCode: `qrcode:${signUrl}`, signUrl, type, workType };
  }
}
