import { Injectable } from '@nestjs/common';

import { scanFinOpportunities } from './scanner/fin-scanner.js';
import { scanQualOpportunities } from './scanner/qual-scanner.js';
import { scanTenderOpportunities } from './scanner/tender-scanner.js';

@Injectable()
export class AgentOpportunityService {
  scanAll(): Record<string, unknown[]> {
    return { AGENT_FIN: scanFinOpportunities(), AGENT_QUAL: scanQualOpportunities(), AGENT_TENDER: scanTenderOpportunities() };
  }

  match(agentSubtype: 'AGENT_FIN' | 'AGENT_QUAL' | 'AGENT_TENDER', region: string): { agentSubtype: string; matchScore: number; region: string } {
    return { agentSubtype, matchScore: agentSubtype === 'AGENT_TENDER' ? 88 : 82, region };
  }

  generatePitch(input: { agentSubtype: string; summary: string }): string {
    return `Use ${input.agentSubtype} evidence-first pitch: ${input.summary}. Offer concrete next action, not training.`;
  }
}
