import { Injectable } from '@nestjs/common';

const stages = ['lead', 'contacted', 'quoting', 'negotiating', 'won', 'lost'];
const scriptCategories = ['first_contact', 'objection_handling', 'negotiation', 'closing', 'reactivation'];

@Injectable()
export class AgentCrmService {
  addNote(input: { agentId: string; content: string; customerTenantId: string; noteType: string; tenantId: string }): Record<string, unknown> {
    return { ...input, createdAt: new Date().toISOString(), nextActionDesc: 'follow up with evidence and next step' };
  }

  pipeline(): Array<{ probability: number; stage: string }> {
    return stages.map((stage, index) => ({ probability: Math.min(95, 20 + index * 15), stage }));
  }

  scripts(serviceType: string): Array<{ category: string; content: string; serviceType: string }> {
    return scriptCategories.map((category) => ({ category, content: `AI ${category} script for ${serviceType}`, serviceType }));
  }
}
