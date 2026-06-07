import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';

import { RulesService } from './rules.service.js';

@Controller('api/v1/admin/rules')
export class RuleCurationController {
  constructor(@Inject(RulesService) private readonly rules: RulesService) {}

  @Post('extract')
  extract(@Body() body: { files?: Array<{ name: string; text: string }> }) {
    return { code: 0, data: this.rules.extract(body.files ?? [{ name: 'manual.txt', text: '合同付款、投标评分、资质升级规则文本' }]), message: 'ok' };
  }

  @Get('candidates')
  candidates(@Query('status') status?: 'approved' | 'pending' | 'rejected') {
    return { code: 0, data: this.rules.listCandidates(status), message: 'ok' };
  }

  @Patch('candidates/:id')
  updateCandidate(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return { code: 0, data: this.rules.updateCandidate(id, body), message: 'ok' };
  }

  @Post('candidates/:id/approve')
  approveCandidate(@Param('id') id: string, @Body() body: { changedBy?: string }) {
    return { code: 0, data: this.rules.approveCandidate(id, body.changedBy), message: 'ok' };
  }

  @Post('candidates/:id/reject')
  rejectCandidate(@Param('id') id: string, @Body() body: { reason?: string }) {
    return { code: 0, data: this.rules.rejectCandidate(id, body.reason ?? '专家复核不通过'), message: 'ok' };
  }

  @Get('list')
  list(@Query('type') type?: 'contract' | 'price' | 'qual' | 'regulation' | 'tender') {
    return { code: 0, data: this.rules.listRules(type), message: 'ok' };
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) {
    return { code: 0, data: this.rules.versionsFor(id), message: 'ok' };
  }

  @Post(':id/rollback')
  rollback(@Param('id') id: string, @Body() body: { version?: number }) {
    return { code: 0, data: this.rules.rollback(id, body.version ?? 1), message: 'ok' };
  }
}
