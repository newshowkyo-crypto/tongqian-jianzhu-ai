import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import type { KnowledgeCurationService } from './knowledge-curation.service.js';

@Controller('api/v1/admin/knowledge')
export class KnowledgeCurationController {
  constructor(private readonly knowledge: KnowledgeCurationService) {}

  @Post('upload')
  upload(@Body() body: { category: 'case' | 'policy' | 'regulation' | 'rfp' | 'standard' | 'template'; fileName?: string; tags?: string[]; text?: string; title?: string }) {
    return { code: 0, data: this.knowledge.upload({ category: body.category, fileName: body.fileName ?? 'upload.txt', tags: body.tags, text: body.text, title: body.title ?? '专家上传知识文档' }), message: 'ok' };
  }

  @Post(':id/parse')
  parse(@Param('id') id: string, @Body() body: { text?: string }) {
    return { code: 0, data: this.knowledge.parse(id, body.text), message: 'ok' };
  }

  @Get('list')
  list(@Query('category') category?: 'case' | 'policy' | 'regulation' | 'rfp' | 'standard' | 'template') {
    return { code: 0, data: this.knowledge.list(category), message: 'ok' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return { code: 0, data: this.knowledge.update(id, body), message: 'ok' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { code: 0, data: this.knowledge.softDelete(id), message: 'ok' };
  }

  @Get('stats')
  stats() {
    return { code: 0, data: this.knowledge.stats(), message: 'ok' };
  }
}
