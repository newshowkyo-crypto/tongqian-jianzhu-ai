import { Injectable } from '@nestjs/common';

@Injectable()
export class AttributionService {
  private readonly attributions = new Map<string, { agentId: string; refCode: string }>();

  bind(clientId: string, refCode?: string): void {
    if (refCode && !this.attributions.has(clientId)) {
      this.attributions.set(clientId, { agentId: `agent-${refCode}`, refCode });
    }
  }
}
