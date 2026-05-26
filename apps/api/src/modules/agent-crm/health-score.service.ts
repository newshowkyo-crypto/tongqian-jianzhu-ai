export class AgentHealthScoreService {
  compute(input: { lastInteractedAt?: Date; lastOrderAt?: Date; nextRenewalDate?: Date }): Record<string, unknown> {
    let score = 100;
    if (!input.lastInteractedAt) score -= 20;
    if (!input.lastOrderAt) score -= 15;
    if (input.nextRenewalDate && input.nextRenewalDate.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30) score -= 20;
    return { riskLevel: score < 60 ? 'high' : score < 80 ? 'medium' : 'low', score };
  }
}
