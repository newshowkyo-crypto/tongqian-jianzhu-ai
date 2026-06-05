import { Body, Controller, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import type { OwnerRiskGenerationType, OwnerRiskReportType, ReviewType } from '@tongqian/types';
import { z } from 'zod';

import { TenantContextService } from '../../common/context/tenant-context.service.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';

import { OwnerRiskService } from './owner-risk.service.js';

const CreateProfileSchema = z.object({
  ownerName: z.string().min(1),
  idCardMasked: z.string().optional(),
  creditCode: z.string().optional(),
});

const UpdateProfileSchema = z.object({
  ownerName: z.string().optional(),
  idCardMasked: z.string().optional(),
  creditCode: z.string().optional(),
});

const CreateReportSchema = z.object({
  reportType: z.string().min(1),
});

const GenerateAnalysisSchema = z.object({
  analysisType: z.string().min(1),
});

const CreateReviewRequestSchema = z.object({
  profileId: z.string().min(1),
  reviewType: z.string().min(1),
});

@Controller('api/v1/owner-risk')
@UseGuards(JwtGuard, PermissionGuard)
export class OwnerRiskController {
  constructor(
    @Inject(OwnerRiskService) private readonly ownerRisk: OwnerRiskService,
    @Inject(TenantContextService) private readonly contextService: TenantContextService,
  ) {}

  @Get('profiles')
  @RequirePermission('owner-risk:view')
  async listProfiles(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ): Promise<unknown> {
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.listProfiles(tenantId, userId, Number(page), Number(pageSize));
    return this.ok(data, 'Profiles listed');
  }

  @Post('profiles')
  @RequirePermission('owner-risk:create')
  async createProfile(
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = CreateProfileSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.createProfile(tenantId, userId, input);
    return this.ok(data, 'Profile created');
  }

  @Get('profiles/:id')
  @RequirePermission('owner-risk:view')
  async getProfile(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.getProfile(tenantId, id);
    return this.ok(data, 'Profile retrieved');
  }

  @Put('profiles/:id')
  @RequirePermission('owner-risk:create')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = UpdateProfileSchema.parse(body);
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.updateProfile(tenantId, id, input);
    return this.ok(data, 'Profile updated');
  }

  @Get('cards')
  @RequirePermission('owner-risk:view')
  async listCards(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listCards(tenantId);
    return this.ok(data, 'Cards listed');
  }

  @Get('cards/:id')
  @RequirePermission('owner-risk:view')
  async getCard(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.getCard(tenantId, id);
    return this.ok(data, 'Card retrieved');
  }

  @Post('cards/:id/unlock')
  @RequirePermission('owner-risk:unlock')
  async unlockCard(
    @Param('id') id: string,
  ): Promise<unknown> {
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.unlockCard(tenantId, userId, id);
    return this.ok(data, 'Card unlocked');
  }

  @Get('profiles/:profileId/guarantees')
  @RequirePermission('owner-risk:view')
  async listGuaranteeRecords(
    @Param('profileId') profileId: string,
  ): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listGuaranteeRecords(tenantId, profileId);
    return this.ok(data, 'Guarantees listed');
  }

  @Get('profiles/:profileId/mixing')
  @RequirePermission('owner-risk:view')
  async listMixingRecords(
    @Param('profileId') profileId: string,
  ): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listMixingRecords(tenantId, profileId);
    return this.ok(data, 'Mixing records listed');
  }

  @Get('counterparties')
  @RequirePermission('owner-risk:view')
  async listCounterpartyWatchlist(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listCounterpartyWatchlist(tenantId);
    return this.ok(data, 'Counterparties listed');
  }

  @Get('counterparties/:id/risk-events')
  @RequirePermission('owner-risk:view')
  async listCounterpartyRiskEvents(
    @Param('id') id: string,
  ): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listCounterpartyRiskEvents(tenantId, id);
    return this.ok(data, 'Risk events listed');
  }

  @Get('profiles/:profileId/receivables')
  @RequirePermission('owner-risk:view')
  async listReceivableRecords(
    @Param('profileId') profileId: string,
  ): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listReceivableRecords(tenantId, profileId);
    return this.ok(data, 'Receivables listed');
  }

  @Get('profiles/:profileId/reports')
  @RequirePermission('owner-risk:view')
  async listReports(
    @Param('profileId') profileId: string,
  ): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listReports(tenantId, profileId);
    return this.ok(data, 'Reports listed');
  }

  @Get('reports/:id')
  @RequirePermission('owner-risk:view')
  async getReport(@Param('id') id: string): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.getReport(tenantId, id);
    return this.ok(data, 'Report retrieved');
  }

  @Post('profiles/:profileId/reports')
  @RequirePermission('owner-risk:export')
  async createReport(
    @Param('profileId') profileId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = CreateReportSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.createReport(tenantId, userId, profileId, input.reportType as OwnerRiskReportType);
    return this.ok(data, 'Report created');
  }

  @Post('profiles/:profileId/analyze')
  @RequirePermission('owner-risk:analyze')
  async generateAnalysis(
    @Param('profileId') profileId: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = GenerateAnalysisSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.generateAnalysis(tenantId, userId, profileId, input.analysisType as OwnerRiskGenerationType);
    return this.ok(data, 'Analysis started');
  }

  @Post('reviews')
  @RequirePermission('owner-risk:submit-review')
  async createReviewRequest(
    @Body() body: unknown,
  ): Promise<unknown> {
    const input = CreateReviewRequestSchema.parse(body);
    const { tenantId, userId } = this.contextService.get();
    const data = await this.ownerRisk.createReviewRequest(tenantId, userId, input.profileId, input.reviewType as ReviewType);
    return this.ok(data, 'Review submitted');
  }

  @Get('reviews')
  @RequirePermission('owner-risk:view')
  async listReviewRequests(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listReviewRequests(tenantId);
    return this.ok(data, 'Reviews listed');
  }

  @Get('unlock-logs')
  @RequirePermission('owner-risk:view')
  async listUnlockLogs(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listUnlockLogs(tenantId);
    return this.ok(data, 'Unlock logs listed');
  }

  @Get('generation-logs')
  @RequirePermission('owner-risk:view')
  async listGenerationLogs(): Promise<unknown> {
    const { tenantId } = this.contextService.get();
    const data = await this.ownerRisk.listGenerationLogs(tenantId);
    return this.ok(data, 'Generation logs listed');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
