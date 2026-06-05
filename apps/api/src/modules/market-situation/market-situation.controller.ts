import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { FeedbackType, MarketSignalGenerationType, MarketSignalReportType, SimulationType, UnlockType } from '@tongqian/types';
import { z } from 'zod';

import { TenantContextService } from '../../common/context/tenant-context.service.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';

import { MarketSituationService } from './market-situation.service.js';

const CreateSignalSchema = z.object({
  signalType: z.enum(['project_hot', 'party_risk', 'competitor_active', 'qualification_dynamic', 'policy_window', 'judicial_risk']),
  title: z.string().min(1),
  summary: z.string().min(1),
  region: z.string().min(1),
  businessLine: z.string().optional(),
  sourceUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rawData: z.record(z.any()).optional(),
});

const UnlockSignalSchema = z.object({
  unlockType: z.enum(['impact_analysis', 'simulation', 'report', 'full']),
});

const GenerateAnalysisSchema = z.object({
  analysisType: z.enum(['summary', 'impact_analysis', 'simulation', 'report']),
});

const CreateSimulationSchema = z.object({
  signalId: z.string().uuid(),
  simulationType: z.enum(['project_participation', 'market_impact', 'risk_spread', 'opportunity_timing']),
  inputParams: z.record(z.any()),
});

const CreateReportSchema = z.object({
  signalId: z.string().uuid(),
  reportType: z.enum(['situation_summary', 'impact_analysis', 'participation_recommendation']),
});

const CreateFeedbackSchema = z.object({
  signalId: z.string().uuid(),
  feedbackType: z.enum(['accuracy', 'relevance', 'usefulness', 'new_info']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

@Controller('api/v1/market-situation')
@UseGuards(JwtGuard, PermissionGuard)
export class MarketSituationController {
  constructor(
    @Inject(MarketSituationService) private readonly marketSituation: MarketSituationService,
    @Inject(TenantContextService) private readonly contextService: TenantContextService,
  ) {}

  @Get('signals')
  @RequirePermission('market-situation:view')
  async listSignals(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('region') region?: string,
    @Query('signalType') signalType?: string,
    @Query('riskLevel') riskLevel?: string,
  ): Promise<unknown> {
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.listSignals(
      tenantId,
      userId,
      Number(page),
      Number(pageSize),
      { region, signalType, riskLevel },
    );
    return this.ok(data, 'Signals listed');
  }

  @Get('signals/featured')
  @RequirePermission('market-situation:view')
  async listFeaturedSignals(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listFeaturedSignals(tenantId);
    return this.ok(data, 'Featured signals listed');
  }

  @Get('signals/:id')
  @RequirePermission('market-situation:view')
  async getSignal(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.getSignal(tenantId, id);
    return this.ok(data, 'Signal retrieved');
  }

  @Post('signals')
  @RequirePermission('market-situation:admin-manage')
  async createSignal(@Body() body: unknown): Promise<unknown> {
    const input = CreateSignalSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.createSignal(tenantId, userId, input);
    return this.ok(data, 'Signal created');
  }

  @Post('signals/:id/unlock')
  @RequirePermission('market-situation:unlock')
  async unlockSignal(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = UnlockSignalSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.unlockSignal(tenantId, userId, id, input.unlockType as UnlockType);
    return this.ok(data, 'Signal unlocked');
  }

  @Post('signals/:id/analyze')
  @RequirePermission('market-situation:view')
  async generateAnalysis(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = GenerateAnalysisSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.generateAnalysis(tenantId, userId, id, input.analysisType as MarketSignalGenerationType);
    return this.ok(data, 'Analysis started');
  }

  @Get('signals/:signalId/simulations')
  @RequirePermission('market-situation:simulate')
  async listSimulations(@Param('signalId') signalId: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listSimulations(tenantId, signalId);
    return this.ok(data, 'Simulations listed');
  }

  @Post('simulations')
  @RequirePermission('market-situation:simulate')
  async createSimulation(@Body() body: unknown): Promise<unknown> {
    const input = CreateSimulationSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.createSimulation(
      tenantId,
      userId,
      input.signalId,
      input.simulationType as SimulationType,
      input.inputParams,
    );
    return this.ok(data, 'Simulation created');
  }

  @Get('simulations/:id')
  @RequirePermission('market-situation:simulate')
  async getSimulation(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.getSimulation(tenantId, id);
    return this.ok(data, 'Simulation retrieved');
  }

  @Get('signals/:signalId/reports')
  @RequirePermission('market-situation:create-report')
  async listReports(@Param('signalId') signalId: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listReports(tenantId, signalId);
    return this.ok(data, 'Reports listed');
  }

  @Post('reports')
  @RequirePermission('market-situation:create-report')
  async createReport(@Body() body: unknown): Promise<unknown> {
    const input = CreateReportSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.createReport(
      tenantId,
      userId,
      input.signalId,
      input.reportType as MarketSignalReportType,
    );
    return this.ok(data, 'Report created');
  }

  @Get('reports/:id')
  @RequirePermission('market-situation:create-report')
  async getReport(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.getReport(tenantId, id);
    return this.ok(data, 'Report retrieved');
  }

  @Post('feedbacks')
  @RequirePermission('market-situation:view')
  async createFeedback(@Body() body: unknown): Promise<unknown> {
    const input = CreateFeedbackSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.marketSituation.createFeedback(
      tenantId,
      userId,
      input.signalId,
      input.feedbackType as FeedbackType,
      input.rating,
      input.comment,
    );
    return this.ok(data, 'Feedback submitted');
  }

  @Get('signals/:signalId/feedbacks')
  @RequirePermission('market-situation:view')
  async listFeedbacks(@Param('signalId') signalId: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listFeedbacks(tenantId, signalId);
    return this.ok(data, 'Feedbacks listed');
  }

  @Get('sources')
  @RequirePermission('market-situation:view')
  async listSources(): Promise<unknown> {
    const data = await this.marketSituation.listSources();
    return this.ok(data, 'Sources listed');
  }

  @Get('tags')
  @RequirePermission('market-situation:view')
  async listTags(): Promise<unknown> {
    const data = await this.marketSituation.listTags();
    return this.ok(data, 'Tags listed');
  }

  @Get('unlock-logs')
  @RequirePermission('market-situation:view')
  async listUnlockLogs(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listUnlockLogs(tenantId);
    return this.ok(data, 'Unlock logs listed');
  }

  @Get('generation-logs')
  @RequirePermission('market-situation:view')
  async listGenerationLogs(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.marketSituation.listGenerationLogs(tenantId);
    return this.ok(data, 'Generation logs listed');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
