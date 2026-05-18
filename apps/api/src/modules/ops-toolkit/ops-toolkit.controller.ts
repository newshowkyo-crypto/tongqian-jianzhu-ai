import { Body, Controller, Get, Headers, Inject, Param, Post, Put } from '@nestjs/common';
import type { AssistantPersonality, GeneratedDocType } from '@tongqian/types';

import { OpsToolkitService } from './ops-toolkit.service.js';

@Controller('api/v1')
export class OpsToolkitController {
  constructor(@Inject(OpsToolkitService) private readonly ops: OpsToolkitService) {}

  @Post('assistant/queries')
  query(@Body() body: { question: string }, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.ops.runAssistant({ question: body.question, tenantId, userId }), message: 'Assistant query', traceId: crypto.randomUUID() };
  }

  @Get('assistant/streak')
  streak(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.ops.getStreak(userId), message: 'Assistant streak', traceId: crypto.randomUUID() };
  }

  @Post('assistant/personality')
  personality(@Body() body: { personality: AssistantPersonality }, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.ops.switchPersonality(userId, body.personality), message: 'Assistant personality switched', traceId: crypto.randomUUID() };
  }

  @Get('assistant/inspiration-cards')
  cards(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.ops.listInspirationCards(userId), message: 'Inspiration cards', traceId: crypto.randomUUID() };
  }

  @Post('docs/:type')
  doc(@Param('type') type: GeneratedDocType, @Body() body: Record<string, unknown>, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.ops.generateDocument({ docType: type, payload: body, tenantId, userId }), message: 'Document generated', traceId: crypto.randomUUID() };
  }

  @Post('audio/transcribe')
  transcribe(@Body() body: { audioSizeMb: number; url: string }): unknown {
    return { code: 'OK', data: this.ops.transcribe(body), message: 'Audio transcribed', traceId: crypto.randomUUID() };
  }

  @Post('policies/:id/impact')
  policyImpact(@Param('id') id: string, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.ops.policyImpact(tenantId, id), message: 'Policy impact', traceId: crypto.randomUUID() };
  }

  @Put('policies/preferences')
  policyPrefs(@Body() body: { levels: string[]; pushEnabled: boolean; topics: string[] }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.ops.updatePolicyPreferences(tenantId, body), message: 'Policy preferences saved', traceId: crypto.randomUUID() };
  }

  @Post('ops/finance/:kind')
  finance(@Param('kind') kind: 'ar_aging' | 'cashflow' | 'financing', @Body() body: Record<string, unknown>): unknown {
    return { code: 'OK', data: this.ops.financeTool(kind, body), message: 'Finance tool', traceId: crypto.randomUUID() };
  }

  @Post('ops/business/:kind')
  business(@Param('kind') kind: 'client_memo' | 'invitation_letter' | 'tender_prep', @Body() body: Record<string, unknown>): unknown {
    return { code: 'OK', data: this.ops.businessTool(kind, body), message: 'Business tool', traceId: crypto.randomUUID() };
  }

  @Post('ops/document-clerk/:kind')
  documentClerk(@Param('kind') kind: 'archive_catalog' | 'completeness_check' | 'personnel_form_batch', @Body() body: Record<string, unknown>): unknown {
    return { code: 'OK', data: this.ops.documentClerk(kind, body), message: 'Document clerk tool', traceId: crypto.randomUUID() };
  }

  @Post('ops/legal/:kind')
  legal(@Param('kind') kind: 'consult' | 'monthly_review', @Body() body: Record<string, unknown>): unknown {
    return { code: 'OK', data: this.ops.legalTool(kind, body), message: 'Legal tool', traceId: crypto.randomUUID() };
  }

  @Post('ops/peer-intel')
  peerIntel(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.ops.peerIntel(userId), message: 'Peer intel', traceId: crypto.randomUUID() };
  }

  @Get('ops/weekly-report')
  weekly(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.ops.weeklyReport(tenantId), message: 'Weekly report', traceId: crypto.randomUUID() };
  }

  @Get('ops/feature-wall/:plan')
  featureWall(@Param('plan') plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): unknown {
    return { code: 'OK', data: this.ops.featureWall(plan), message: 'Ops feature wall', traceId: crypto.randomUUID() };
  }
}
