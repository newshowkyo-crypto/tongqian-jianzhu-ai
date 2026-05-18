import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { ApprovalEngineService } from './approval-engine.service.js';
import { ApprovalTemplateService } from './approval-template.service.js';

@Controller('api/v1/approvals')
export class ApprovalController {
  constructor(
    @Inject(ApprovalEngineService)
    private readonly engine: ApprovalEngineService,
    @Inject(ApprovalTemplateService)
    private readonly templates: ApprovalTemplateService,
  ) {}

  @Get('me/pending')
  pending(): unknown {
    return { code: 'OK', data: this.engine.pending(), message: 'Pending approvals', traceId: crypto.randomUUID() };
  }

  @Post(':id/sign')
  sign(@Param('id') id: string, @Body() body: { approverId: string; decision: 'approved' | 'rejected'; twoFactorCode?: string }): unknown {
    return { code: 'OK', data: this.engine.sign(id, body), message: 'Signed', traceId: crypto.randomUUID() };
  }

  @Get('templates')
  listTemplates(): unknown {
    return { code: 'OK', data: this.templates.list(), message: 'Approval templates', traceId: crypto.randomUUID() };
  }
}
