import { Body, Controller, Get, Headers, Inject, Param, Post, Put } from '@nestjs/common';
import type { AgentSubtype } from '@tongqian/types';

import { AgentWorkspaceService } from './agent-workspace.service.js';

@Controller('api/v1')
export class AgentWorkspaceController {
  constructor(@Inject(AgentWorkspaceService) private readonly workspace: AgentWorkspaceService) {}

  @Get('agent/dashboard')
  dashboard(@Headers('x-agent-id') agentId = 'mock-agent'): unknown {
    return { code: 'OK', data: this.workspace.dashboard(agentId), message: 'Agent dashboard', traceId: crypto.randomUUID() };
  }

  @Put('agent/me/profile')
  profile(@Body() body: { region: string; subtype: `${AgentSubtype}`; tenantId: string; userId: string }): unknown {
    return { code: 'OK', data: this.workspace.upsertProfile(body), message: 'Agent profile saved', traceId: crypto.randomUUID() };
  }

  @Post('agent/fission/bind')
  bind(@Body() body: { childId: string; parentId: string }): unknown {
    return { code: 'OK', data: this.workspace.bindRelation(body), message: 'Agent relation bound', traceId: crypto.randomUUID() };
  }

  @Post('agent/commissions')
  commission(@Body() body: { agentId: string; amountCny: number; type: 'subscription_first_year' | 'subscription_next_year' | 'topup' }): unknown {
    return { code: 'OK', data: this.workspace.createCommission(body), message: 'Commission created', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/classify')
  classify(@Body() body: { amountCny: number; clientTenantId: string; sourceModule: string; type: string }): unknown {
    return { code: 'OK', data: this.workspace.classifyDispatch(body), message: 'Dispatch classified', traceId: crypto.randomUUID() };
  }

  @Get('dispatches')
  listDispatches(): unknown {
    return { code: 'OK', data: [{ id: 'disp-pending-001', type: '资质代办', status: 'pending' }], message: 'Dispatch list', traceId: crypto.randomUUID() };
  }

  @Post('dispatches')
  createDispatch(@Body() body: Record<string, unknown>): unknown {
    return { code: 'OK', data: { dispatchId: 'disp-pending-001', source: body }, message: 'Dispatch created', traceId: crypto.randomUUID() };
  }

  @Get('dispatches/:id')
  getDispatch(@Param('id') id: string): unknown {
    return { code: 'OK', data: { id, type: '资质代办', status: 'pending' }, message: 'Dispatch detail', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/accept')
  acceptDispatch(@Param('id') id: string, @Body() body: { agentId?: string }): unknown {
    return { code: 'OK', data: { id, agentId: body.agentId, ok: true }, message: 'Dispatch accepted', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/quote')
  quoteDispatch(@Param('id') id: string, @Body() body: { amount?: string; note?: string }): unknown {
    return { code: 'OK', data: { id, ...body, ok: true }, message: 'Dispatch quoted', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/confirm')
  confirmDispatch(@Param('id') id: string): unknown {
    return { code: 'OK', data: { id, ok: true }, message: 'Dispatch confirmed', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/complete')
  completeDispatch(@Param('id') id: string, @Body() body: { rating?: number; review?: string }): unknown {
    return { code: 'OK', data: { id, ...body, ok: true }, message: 'Dispatch completed', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/route')
  route(@Param('id') id: string, @Body() body: { agentId?: string }): unknown {
    return { code: 'OK', data: this.workspace.routeDispatch(id, body.agentId), message: 'Dispatch routed', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/quotes')
  quote(@Param('id') id: string, @Body() body: { agentId: string; description: string; priceCny: number; refHighCny?: number }): unknown {
    return { code: 'OK', data: this.workspace.quote({ ...body, dispatchId: id }), message: 'Dispatch quote created', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/select')
  select(@Param('id') id: string, @Body() body: { agentId: string }): unknown {
    return { code: 'OK', data: this.workspace.selectQuote({ ...body, dispatchId: id }), message: 'Dispatch quote selected', traceId: crypto.randomUUID() };
  }

  @Post('dispatches/:id/rate-agent')
  rateAgent(@Param('id') id: string, @Body() body: { agentId: string; comment: string; stars: number }): unknown {
    return { code: 'OK', data: this.workspace.rateAgent({ ...body, dispatchId: id }), message: 'Agent rated', traceId: crypto.randomUUID() };
  }

  @Get('premium-services')
  premium(): unknown {
    return { code: 'OK', data: this.workspace.premiumShelf(), message: 'Premium services', traceId: crypto.randomUUID() };
  }

  @Post('premium-services/:id/inquire')
  inquire(@Param('id') id: string, @Body() body: { agentId?: string; clientTenantId: string }): unknown {
    return { code: 'OK', data: this.workspace.inquirePremium({ ...body, itemId: id }), message: 'Premium service inquiry created', traceId: crypto.randomUUID() };
  }

  @Post('agent/client-signals/:id/act')
  actSignal(@Param('id') id: string, @Body() body: { action: 'contact_initiated' | 'dismissed' | 'scheduled'; agentId: string }): unknown {
    return { code: 'OK', data: this.workspace.actOnSignal({ ...body, signalId: id }), message: 'Client signal acted', traceId: crypto.randomUUID() };
  }

  @Post('agent/cases')
  uploadCase(@Body() body: { agentId: string; category: string; commitments: string[]; content: Record<string, unknown>; title: string }): unknown {
    return { code: 'OK', data: this.workspace.uploadCase(body), message: 'Case uploaded', traceId: crypto.randomUUID() };
  }

  @Post('agent/cases/:id/download')
  downloadCase(@Param('id') id: string, @Body() body: { buyerAgentId: string }): unknown {
    return { code: 'OK', data: this.workspace.downloadCase({ ...body, caseId: id }), message: 'Case downloaded', traceId: crypto.randomUUID() };
  }

  @Post('agent/consents')
  consent(@Body() body: { agentId: string; commitments: string[]; ip: string; protocolVersion: string; userAgent: string }): unknown {
    return { code: 'OK', data: this.workspace.signConsent(body), message: 'Agent consent signed', traceId: crypto.randomUUID() };
  }

  @Post('agent/partner/referrals')
  partnerReferral(@Body() body: { partnerId: string; referredType: 'agent' | 'building_company' | 'tongqian_consult'; referredUserId: string }): unknown {
    return { code: 'OK', data: this.workspace.partnerReferral(body), message: 'Partner referral created', traceId: crypto.randomUUID() };
  }
}
