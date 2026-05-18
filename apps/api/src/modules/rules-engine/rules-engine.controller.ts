import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';

import { RulesEngineService } from './rules-engine.service.js';

@Controller('api/v1')
export class RulesEngineController {
  constructor(@Inject(RulesEngineService) private readonly rules: RulesEngineService) {}

  @Get('qualification-rules')
  qualification(@Query('category') category?: string, @Query('to_level') toLevel?: string): unknown {
    return { code: 'OK', data: this.rules.qualifications({ category, toLevel }), message: 'Qualification rules', traceId: crypto.randomUUID() };
  }

  @Get('contract-rules')
  contract(@Query('type') type?: string, @Query('risk_level') riskLevel?: 'green' | 'red' | 'yellow'): unknown {
    return { code: 'OK', data: this.rules.contracts({ riskLevel, type }), message: 'Contract rules', traceId: crypto.randomUUID() };
  }

  @Get('tender-rules')
  tender(@Query('industry') industry?: string): unknown {
    return { code: 'OK', data: this.rules.tenders({ industry }), message: 'Tender rules', traceId: crypto.randomUUID() };
  }

  @Get('reference-prices')
  prices(@Query('service_type') serviceType?: string, @Query('region') region?: string): unknown {
    return { code: 'OK', data: this.rules.prices({ region, serviceType }), message: 'Reference prices', traceId: crypto.randomUUID() };
  }

  @Post('reference-prices/classify')
  classify(@Body() body: { quoteCny: number; refHighCny: number }): unknown {
    return { code: 'OK', data: { color: this.rules.classifyQuote(body) }, message: 'Quote classified', traceId: crypto.randomUUID() };
  }

  @Post('admin/rules/extract')
  extract(@Body() body: { knowledgeId: string; type: 'contract' | 'qualification' | 'tender' }): unknown {
    return { code: 'OK', data: this.rules.extractCandidate(body), message: 'Rule candidate extracted', traceId: crypto.randomUUID() };
  }

  @Post('admin/rules/:id/review')
  review(@Param('id') id: string, @Body() body: { approved: boolean; changedBy: string; changeReason: string; ruleTable: 'contract' | 'qualification' | 'tender' }): unknown {
    return { code: 'OK', data: this.rules.reviewRule({ ...body, ruleId: id }), message: 'Rule reviewed', traceId: crypto.randomUUID() };
  }

  @Get('admin/rules/:id/versions')
  versions(@Param('id') id: string, @Query('rule_table') ruleTable = 'contract'): unknown {
    return { code: 'OK', data: this.rules.versionsFor(ruleTable, id), message: 'Rule versions', traceId: crypto.randomUUID() };
  }
}
