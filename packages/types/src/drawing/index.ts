export type DrawingFormat = 'dwg' | 'jpg' | 'pdf' | 'png';

export interface DrawingView {
  createdAt: string;
  fileFormat: DrawingFormat;
  fileUrl: string;
  id: string;
  pages?: number;
  previewUrls: string[];
  projectId?: string;
  sizeBytes: number;
  tenantId: string;
}

export interface DrawingUnderstandingView {
  aiTaskId: string;
  designParams: Record<string, unknown>;
  disclaimer: string;
  drawingId: string;
  drawingType: string;
  id: string;
  keyDimensions: Array<{ name: string; value: string }>;
  mainComponents: string[];
  tierBadge: 1;
}

export interface DrawingErrorView {
  aiTaskId: string;
  description: string;
  drawingId: string;
  id: string;
  level: 'red' | 'yellow';
  pageNo?: number;
  type: 'dimension_conflict' | 'missing_annotation' | 'spec_deviation';
}

export interface DrawingVersionDiffView {
  aiTaskId: string;
  changes: Array<{ impact: string; location: string; summary: string }>;
  id: string;
  newDrawingId: string;
  oldDrawingId: string;
}

export interface QuantityEstimateView {
  aiTaskId: string;
  components: Array<{ high: number; low: number; name: string; unit: string }>;
  disclaimer: string;
  drawingId: string;
  id: string;
  precisionBand: { high: 0.3; low: -0.3 };
}
