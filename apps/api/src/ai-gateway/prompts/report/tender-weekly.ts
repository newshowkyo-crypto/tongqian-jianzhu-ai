import { z } from 'zod';

export const outputSchema = z.object({
  confidence: z.enum(['high', 'medium', 'low']),
  disclaimer: z.string(),
  findings: z.array(z.object({ detail: z.string(), level: z.enum(['red', 'yellow', 'green']), title: z.string() })).min(5),
  nextStepButtons: z.array(z.string()).min(5),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  traceId: z.string(),
});
