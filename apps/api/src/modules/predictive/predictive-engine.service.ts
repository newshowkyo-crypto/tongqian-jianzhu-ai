import { Injectable } from '@nestjs/common';

const categories = ['cashflow_gap', 'qualification_expire', 'project_overrun', 'agent_score_drop', 'customer_churn'] as const;
const windows = ['7d', '14d', '21d', '30d'] as const;

@Injectable()
export class PredictiveEngineService {
  runDailyPrediction(tenantId: string, userId: string): Array<Record<string, unknown>> {
    return categories.map((category, index) => this.predict(category, windows[index % windows.length] ?? '7d', tenantId, userId));
  }

  private predict(category: (typeof categories)[number], timeWindow: string, tenantId: string, userId: string): Record<string, unknown> {
    return {
      actionSuggestion: this.actionFor(category),
      category,
      confidence: 0.72,
      disclaimer: 'Prediction is probabilistic. Verify important business decisions.',
      id: crypto.randomUUID(),
      prediction: `${category} may require attention in ${timeWindow}; avoid absolute conclusions.`,
      severity: category === 'cashflow_gap' ? 'critical' : 'warning',
      tenantId,
      timeWindow,
      title: `Predictive alert: ${category}`,
      userId,
    };
  }

  private actionFor(category: string): string {
    return {
      agent_score_drop: 'Review steward response time and recent customer feedback.',
      cashflow_gap: 'Lock receivable owner and prepare financing backup.',
      customer_churn: 'Trigger value recap and renewal conversation.',
      project_overrun: 'Review schedule list and material delivery risk.',
      qualification_expire: 'Prepare certificate renewal materials before deadline.',
    }[category] ?? 'Manual review recommended.';
  }
}
