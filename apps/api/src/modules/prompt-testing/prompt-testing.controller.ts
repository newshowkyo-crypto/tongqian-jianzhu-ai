import { Controller, Get, Post, Query } from '@nestjs/common';

import type { GoldenRunnerService } from './golden-runner.service.js';

@Controller('api/v1/admin/prompt-testing')
export class PromptTestingController {
  constructor(private readonly goldenRunner: GoldenRunnerService) {}

  @Get('golden-sets')
  listGoldenSets() {
    return { code: 0, data: this.goldenRunner.listSets(), message: 'ok' };
  }

  @Post('run-golden')
  runGolden(@Query('taskType') taskType = 'CONTRACT_REVIEW_PRO') {
    return { code: 0, data: this.goldenRunner.runGoldenSet(taskType), message: 'ok' };
  }

  @Get('golden-history')
  goldenHistory() {
    return { code: 0, data: this.goldenRunner.historySnapshot(), message: 'ok' };
  }
}
