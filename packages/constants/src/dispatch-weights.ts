export const DEFAULT_DISPATCH_WEIGHTS = {
  regionMatch: 0.3,
  businessSubtypeMatch: 0.3,
  reputationLevel: 0.25,
  ratingScore: 0.15,
  topCandidateLimit: 3,
  topCandidateGrabHours: 1,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'dispatch.weights',
      value: DEFAULT_DISPATCH_WEIGHTS,
      description: 'Default 4-factor dispatch scoring weights.',
      isOverridable: true,
    },
  ] as const;
}
