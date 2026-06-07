import { Body, Controller, Get, Headers, Inject, Param, Post, Query } from '@nestjs/common';

import { ChangeOrderService } from './change-order.service.js';
import { ClaimRecordService } from './claim-record.service.js';
import { PaymentLedgerService } from './payment-ledger.service.js';
import { PhotoService } from './photo.service.js';
import { ProjectSiteService } from './project-site.service.js';
import { ScheduleService } from './schedule.service.js';
import { TaskBoardService } from './task-board.service.js';

@Controller('api/v1/projects')
export class ProjectSiteController {
  constructor(
    @Inject(ProjectSiteService) private readonly sites: ProjectSiteService,
    @Inject(ScheduleService) private readonly schedules: ScheduleService,
    @Inject(PhotoService) private readonly photos: PhotoService,
    @Inject(PaymentLedgerService) private readonly ledgers: PaymentLedgerService,
    @Inject(ChangeOrderService) private readonly changes: ChangeOrderService,
    @Inject(ClaimRecordService) private readonly claims: ClaimRecordService,
    @Inject(TaskBoardService) private readonly tasks: TaskBoardService,
  ) {}

  @Post()
  create(@Body() body: { name: string; planCode?: string; region?: string; type?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.sites.createProject({ ...body, tenantId, userId }), message: 'Project created', traceId: crypto.randomUUID() };
  }

  @Get()
  list(): unknown {
    return { code: 'OK', data: [{ id: 'proj-wuhan-metro', name: '武汉地铁站点配套工程' }], message: 'Projects', traceId: crypto.randomUUID() };
  }

  @Get(':id')
  detail(@Param('id') id: string): unknown {
    return { code: 'OK', data: { id, name: '武汉地铁站点配套工程' }, message: 'Project detail', traceId: crypto.randomUUID() };
  }

  @Get(':id/site-logs')
  siteLogs(@Param('id') id: string): unknown {
    return { code: 'OK', data: [{ projectId: id, content: '施工日志' }], message: 'Site logs', traceId: crypto.randomUUID() };
  }

  @Get(':id/cost-analysis')
  costAnalysis(@Param('id') id: string): unknown {
    return { code: 'OK', data: { projectId: id, items: [{ label: '材料', value: 46 }, { label: '人工', value: 24 }, { label: '机械', value: 12 }, { label: '分包', value: 18 }] }, message: 'Cost analysis', traceId: crypto.randomUUID() };
  }

  @Get(':id/drawings')
  drawings(@Param('id') id: string): unknown {
    return { code: 'OK', data: [{ projectId: id, name: '总平面图', version: 'V3' }], message: 'Drawings', traceId: crypto.randomUUID() };
  }

  @Post(':id/ai-summary')
  aiSummary(@Param('id') id: string): unknown {
    return { code: 'OK', data: { projectId: id, summary: '本周完成主体节点。', risks: ['工期', '成本', '安全'] }, message: 'AI summary created', traceId: crypto.randomUUID() };
  }

  @Get('me')
  dashboard(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.dashboard(tenantId), message: 'Project dashboard', traceId: crypto.randomUUID() };
  }

  @Post(':id/logs')
  log(@Param('id') id: string, @Body() body: { photosUrls: string[]; userInput: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.sites.addConstructionLog({ ...body, createdBy: userId, projectId: id, tenantId }), message: 'Construction log created', traceId: crypto.randomUUID() };
  }

  @Post(':id/contact-letters')
  letter(@Param('id') id: string, @Body() body: { type: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.createContactLetter({ projectId: id, tenantId, type: body.type }), message: 'Contact letter created', traceId: crypto.randomUUID() };
  }

  @Post(':id/progress-payments')
  progress(@Param('id') id: string, @Body() body: { completedValueCny: number; period: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.progressPayment({ ...body, projectId: id, tenantId }), message: 'Progress payment application created', traceId: crypto.randomUUID() };
  }

  @Post(':id/payment-ledger')
  paymentLedger(@Param('id') id: string, @Body() body: { amountCny: number; eventDate?: string; eventType: 'contract_signed' | 'dispute' | 'invoice_issued' | 'payment_received' | 'work_completed' | 'written_off'; invoiceDate?: string; period: string; status?: 'confirmed' | 'disputed' | 'pending' | 'written_off' }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') createdBy = 'mock-user'): unknown {
    return { code: 'OK', data: this.ledgers.recordEvent({ ...body, createdBy, eventDate: body.eventDate ?? new Date().toISOString(), projectId: id, status: body.status ?? 'pending', tenantId }), message: 'Payment ledger recorded', traceId: crypto.randomUUID() };
  }

  @Post(':id/change-orders')
  changeOrder(@Param('id') id: string, @Body() body: { contractId: string; description: string; evidenceFiles?: string[]; orderType: string; title: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.changes.create({ ...body, evidenceFiles: body.evidenceFiles ?? [], projectId: id, tenantId }), message: 'Change order created', traceId: crypto.randomUUID() };
  }

  @Post(':id/claims')
  claim(@Param('id') id: string, @Body() body: { claimedAmountCny?: number; claimType: string; contractId: string; description: string; evidenceFiles?: string[]; submitDeadline?: string; title: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.claims.create({ ...body, evidenceFiles: body.evidenceFiles ?? [], projectId: id, tenantId }), message: 'Claim record created', traceId: crypto.randomUUID() };
  }

  @Get(':id/tasks')
  taskBoard(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.tasks.board(id), message: 'Project task board', traceId: crypto.randomUUID() };
  }

  @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() body: { category?: string; description?: string; dueDate?: string; relatedChangeId?: string; relatedClaimId?: string; relatedScheduleTaskId?: string; title: string }, @Headers('x-user-id') createdBy = 'mock-user'): unknown {
    return { code: 'OK', data: this.tasks.create({ ...body, createdBy, projectId: id }), message: 'Project task created', traceId: crypto.randomUUID() };
  }

  @Post(':id/major-hazards')
  hazard(@Param('id') id: string, @Body() body: { hazardType: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.majorHazard({ ...body, projectId: id, tenantId }), message: 'Major hazard outline created', traceId: crypto.randomUUID() };
  }

  @Post(':id/archive-checklist')
  archive(@Param('id') id: string, @Body() body: { projectType: string; region: string; uploadedItems?: string[] }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.archiveChecklist({ ...body, projectId: id, tenantId }), message: 'Archive checklist created', traceId: crypto.randomUUID() };
  }

  @Post(':id/safety-monthly-reminder')
  safety(@Param('id') id: string, @Body() body: { season?: 'rain' | 'spring' }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.sites.safetyMonthlyReminder({ ...body, projectId: id, tenantId }), message: 'Safety reminder created', traceId: crypto.randomUUID() };
  }

  @Post(':id/schedules')
  createSchedule(@Param('id') id: string, @Body() body: { endDate: string; startDate: string; title?: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.schedules.createSchedule({ ...body, projectId: id, tenantId }), message: 'Schedule created', traceId: crypto.randomUUID() };
  }

  @Post(':id/schedules/:scheduleId/tasks')
  addScheduleTask(@Param('scheduleId') scheduleId: string, @Body() body: { dependencies?: string[]; name: string; plannedEnd: string; plannedStart: string }): unknown {
    return { code: 'OK', data: this.schedules.addTask(scheduleId, { ...body, dependencies: body.dependencies ?? [] }), message: 'Schedule task created', traceId: crypto.randomUUID() };
  }

  @Post(':id/schedules/:scheduleId/tasks/:taskId/progress')
  updateScheduleProgress(@Param('taskId') taskId: string, @Body() body: { actualEnd?: string; actualStart?: string; progressPct: number }): unknown {
    return { code: 'OK', data: this.schedules.updateProgress(taskId, body.progressPct, body.actualStart, body.actualEnd), message: 'Schedule progress updated', traceId: crypto.randomUUID() };
  }

  @Get(':id/schedules/:scheduleId/critical-path')
  criticalPath(@Param('scheduleId') scheduleId: string): unknown {
    return { code: 'OK', data: { criticalPath: this.schedules.computeCriticalPath(scheduleId), delayReport: this.schedules.getDelayReport(scheduleId) }, message: 'Critical path', traceId: crypto.randomUUID() };
  }

  @Post(':id/schedules/:scheduleId/risk-advisor')
  scheduleRiskAdvisor(@Param('scheduleId') scheduleId: string): unknown {
    return { code: 'OK', data: this.schedules.getDelayReport(scheduleId), message: 'Schedule risk advisor', traceId: crypto.randomUUID() };
  }

  @Post(':id/photos')
  uploadPhoto(@Param('id') id: string, @Body() body: { ossUrl: string; remark?: string }, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.photos.uploadAndClassify({ ...body, projectId: id, uploadedBy: userId }), message: 'Site photo classified', traceId: crypto.randomUUID() };
  }

  @Get(':id/photos')
  listPhotos(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.photos.list(id), message: 'Site photos', traceId: crypto.randomUUID() };
  }

  @Get(':id/photos/daily-summary')
  photoDailySummary(@Param('id') id: string, @Query('date') date?: string): unknown {
    return { code: 'OK', data: this.photos.dailyPhotoSummary(id, date), message: 'Site photo daily summary', traceId: crypto.randomUUID() };
  }
}
