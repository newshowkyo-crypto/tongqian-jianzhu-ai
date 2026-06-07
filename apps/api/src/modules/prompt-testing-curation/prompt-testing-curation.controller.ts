import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';

import { PromptTestingCurationService } from './prompt-testing-curation.service.js';

@Controller('api/v1/admin/golden-tests')
export class PromptTestingCurationController {
  constructor(@Inject(PromptTestingCurationService) private readonly goldenTests: PromptTestingCurationService) {}

  @Get()
  list(@Query('taskType') taskType?: string) {
    return { code: 0, data: this.goldenTests.list(taskType), message: 'ok' };
  }

  @Post()
  create(@Body() body: { difficulty?: 'hard' | 'medium' | 'simple'; expectedSignals?: string[]; input?: string; reviewerScore?: number; taskType?: string }) {
    return { code: 0, data: this.goldenTests.create({ difficulty: body.difficulty ?? 'medium', expectedSignals: body.expectedSignals ?? ['Tier', '信心度', '引导按钮'], input: body.input ?? '黄金测试输入', reviewerScore: body.reviewerScore ?? 80, taskType: body.taskType ?? 'contract.review.basic' }), message: 'ok' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return { code: 0, data: this.goldenTests.update(id, body), message: 'ok' };
  }

  @Post(':id/run')
  runOne(@Param('id') id: string) {
    return { code: 0, data: this.goldenTests.run(id), message: 'ok' };
  }

  @Get('coverage')
  coverage() {
    return { code: 0, data: this.goldenTests.coverage(), message: 'ok' };
  }

  @Post('run-all')
  runAll() {
    return { code: 0, data: this.goldenTests.runAll(), message: 'ok' };
  }
}
