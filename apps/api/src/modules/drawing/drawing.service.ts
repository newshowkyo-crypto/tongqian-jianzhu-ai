import { Inject, Injectable } from '@nestjs/common';
import type {
  DrawingErrorView,
  DrawingFormat,
  DrawingUnderstandingView,
  DrawingVersionDiffView,
  DrawingView,
  QuantityEstimateView,
} from '@tongqian/types';

import { StorageService } from '../storage/storage.service.js';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const SUPPORTED_FORMATS = new Set<DrawingFormat>(['dwg', 'jpg', 'pdf', 'png']);

@Injectable()
export class DrawingService {
  private readonly drawings = new Map<string, DrawingView>();
  private readonly understandings = new Map<string, DrawingUnderstandingView>();
  private readonly annotations = new Map<string, Array<{ id: string; note: string; pageNo: number; x: number; y: number }>>();

  constructor(@Inject(StorageService) private readonly storage: StorageService) {}

  upload(input: { fileFormat: string; fileUrl: string; pages?: number; projectId?: string; sizeBytes: number; tenantId: string }): DrawingView {
    const fileFormat = input.fileFormat.toLowerCase() as DrawingFormat;
    if (!SUPPORTED_FORMATS.has(fileFormat)) throw new Error('DRAW.NOT_SUPPORTED_FORMAT');
    if (input.sizeBytes > MAX_FILE_BYTES) throw new Error('DRAW.FILE_TOO_LARGE');
    const file = this.storage.registerExternalFile({
      fileName: input.fileUrl.split('/').at(-1) || `drawing-${crypto.randomUUID()}.${fileFormat}`,
      mimeType: fileFormat === 'pdf' ? 'application/pdf' : fileFormat === 'dwg' ? 'application/acad' : `image/${fileFormat}`,
      purpose: 'drawing-recognition',
      sizeBytes: input.sizeBytes,
      tenantId: input.tenantId,
      url: input.fileUrl,
    });
    const drawing: DrawingView = {
      createdAt: new Date().toISOString(),
      fileFormat,
      fileUrl: file.signedUrl,
      id: crypto.randomUUID(),
      pages: input.pages ?? 1,
      previewUrls: this.previewUrls(fileFormat, input.fileUrl, input.pages ?? 1),
      projectId: input.projectId,
      sizeBytes: input.sizeBytes,
      tenantId: input.tenantId,
    };
    this.drawings.set(drawing.id, drawing);
    return drawing;
  }

  understand(input: { drawingId: string; tenantId: string }): DrawingUnderstandingView {
    const drawing = this.mustGetDrawing(input.drawingId, input.tenantId);
    const view: DrawingUnderstandingView = {
      aiTaskId: `drawing-understand-${crypto.randomUUID()}`,
      designParams: { concreteGrade: 'C30', model: 'qwen3-vl-max.mock', rebarGrade: 'HRB400' },
      disclaimer: 'drawing.disclaimer.referenceOnly.requiresDesignerConfirmation',
      drawingId: drawing.id,
      drawingType: drawing.fileFormat === 'dwg' ? 'structural_plan' : 'construction_pdf',
      id: crypto.randomUUID(),
      keyDimensions: [
        { name: 'axisWidth', value: 'drawing.dimension.placeholder.axisWidth' },
        { name: 'floorHeight', value: 'drawing.dimension.placeholder.floorHeight' },
      ],
      mainComponents: ['concrete', 'rebar', 'masonry'],
      tierBadge: 1,
    };
    this.understandings.set(drawing.id, view);
    return view;
  }

  detectErrors(input: { drawingId: string; tenantId: string }): DrawingErrorView[] {
    const drawing = this.mustGetDrawing(input.drawingId, input.tenantId);
    return [
      {
        aiTaskId: `drawing-error-${crypto.randomUUID()}`,
        description: 'drawing.error.dimensionConflict.requiresManualCheck',
        drawingId: drawing.id,
        id: crypto.randomUUID(),
        level: 'yellow',
        pageNo: 1,
        type: 'dimension_conflict',
      },
      {
        aiTaskId: `drawing-error-${crypto.randomUUID()}`,
        description: 'drawing.error.missingAnnotation.requiresDesignerConfirmation',
        drawingId: drawing.id,
        id: crypto.randomUUID(),
        level: 'yellow',
        pageNo: drawing.pages && drawing.pages > 1 ? 2 : 1,
        type: 'missing_annotation',
      },
    ];
  }

  versionDiff(input: { newId: string; oldId: string; tenantId: string }): DrawingVersionDiffView {
    const oldDrawing = this.mustGetDrawing(input.oldId, input.tenantId);
    const newDrawing = this.mustGetDrawing(input.newId, input.tenantId);
    return {
      aiTaskId: `drawing-diff-${crypto.randomUUID()}`,
      changes: [
        { impact: 'drawing.diff.impact.quantityMayChange', location: 'A-3 axis', summary: 'drawing.diff.summary.dimensionAdjusted' },
        { impact: 'drawing.diff.impact.reviewBeforeTender', location: 'general_notes', summary: 'drawing.diff.summary.materialNoteChanged' },
      ],
      id: crypto.randomUUID(),
      newDrawingId: newDrawing.id,
      oldDrawingId: oldDrawing.id,
    };
  }

  snapshot(input: { drawingId: string; tenantId: string }): { annotations: number; drawingId: string; promptVersion: string; summary: string } {
    const drawing = this.mustGetDrawing(input.drawingId, input.tenantId);
    return {
      annotations: this.annotations.get(drawing.id)?.length ?? 0,
      drawingId: drawing.id,
      promptVersion: 'drawing-snapshot-v1',
      summary: 'Snapshot uses pdfjs-compatible page previews, axis tags, scale notes, and manual annotations for AI explanation.',
    };
  }

  annotate(input: { drawingId: string; note: string; pageNo?: number; tenantId: string; x: number; y: number }): { id: string; note: string; pageNo: number; x: number; y: number } {
    const drawing = this.mustGetDrawing(input.drawingId, input.tenantId);
    const item = { id: crypto.randomUUID(), note: input.note, pageNo: input.pageNo ?? 1, x: input.x, y: input.y };
    this.annotations.set(drawing.id, [...(this.annotations.get(drawing.id) ?? []), item]);
    return item;
  }

  quantity(input: { drawingId: string; tenantId: string }): QuantityEstimateView {
    const drawing = this.mustGetDrawing(input.drawingId, input.tenantId);
    const pageFactor = drawing.pages ?? 1;
    return {
      aiTaskId: `drawing-quantity-${crypto.randomUUID()}`,
      components: [
        { high: Math.round(pageFactor * 130), low: Math.round(pageFactor * 70), name: 'C30 concrete', unit: 'm3' },
        { high: Math.round(pageFactor * 18), low: Math.round(pageFactor * 10), name: 'HRB400 rebar', unit: 'ton' },
        { high: Math.round(pageFactor * 260), low: Math.round(pageFactor * 140), name: 'masonry', unit: 'm3' },
      ],
      disclaimer: 'drawing.quantity.disclaimer.roughOnly.notBim.notRebarCutting',
      drawingId: drawing.id,
      id: crypto.randomUUID(),
      precisionBand: { high: 0.3, low: -0.3 },
    };
  }

  private mustGetDrawing(id: string, tenantId: string): DrawingView {
    const drawing = this.drawings.get(id);
    if (!drawing || drawing.tenantId !== tenantId) throw new Error('DRAW.NOT_FOUND');
    return drawing;
  }

  private previewUrls(format: DrawingFormat, fileUrl: string, pages: number): string[] {
    const stem = encodeURIComponent(fileUrl.split('/').at(-1) ?? 'drawing');
    return Array.from({ length: pages }, (_, index) => `mock://oss/drawing-preview/${stem}/${format}/page-${index + 1}.png`);
  }
}
