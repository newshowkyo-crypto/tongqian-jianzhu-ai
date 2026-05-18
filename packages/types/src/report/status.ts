export enum ReportStatus {
  QUEUED = 'queued',
  GENERATING = 'generating',
  RENDERING = 'rendering',
  READY = 'ready',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export enum ReportFormat {
  H5 = 'h5',
  PDF = 'pdf',
}

export enum ReportReviewStatus {
  NOT_REQUESTED = 'not_requested',
  REQUESTED = 'requested',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const REPORT_STATUS_VALUES = Object.values(ReportStatus);
export const REPORT_FORMAT_VALUES = Object.values(ReportFormat);
export const REPORT_REVIEW_STATUS_VALUES = Object.values(ReportReviewStatus);

export type ReportStatusValue = `${ReportStatus}`;
export type ReportFormatValue = `${ReportFormat}`;
export type ReportReviewStatusValue = `${ReportReviewStatus}`;
