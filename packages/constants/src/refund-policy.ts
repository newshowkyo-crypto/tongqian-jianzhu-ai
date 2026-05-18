export const REFUND_POLICY = {
  protectionPeriodDays: 7,
  partialRefundEndDays: 30,
  customerServiceSelfApproveBelowCny: 500,
  financeApproveAtLeastCny: 500,
  ownerApproveAtLeastCny: 10000,
  requireApprovalFlow: true,
} as const;
