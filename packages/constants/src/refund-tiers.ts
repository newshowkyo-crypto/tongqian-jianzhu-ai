export const REFUND_TIERS = [
  { code: 'full', startDay: 0, endDay: 7, refundRate: 1 },
  { code: 'half', startDay: 8, endDay: 30, refundRate: 0.5 },
  { code: 'none', startDay: 31, refundRate: 0 },
] as const;
