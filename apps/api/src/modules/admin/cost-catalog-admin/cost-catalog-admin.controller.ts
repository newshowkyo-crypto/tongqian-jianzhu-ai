import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';

import { CostCatalogService } from '../../cost-catalog/cost-catalog.service.js';

@Controller('api/v1/admin/cost-catalogs')
export class CostCatalogAdminController {
  constructor(@Inject(CostCatalogService) private readonly catalogs: CostCatalogService) {}

  @Get()
  list() {
    return { code: 0, data: { items: this.catalogs.list() }, message: 'ok', traceId: crypto.randomUUID() };
  }

  @Post('import')
  async import(@Body() body: { catalogCode: string; csvPath?: string; csvUrl?: string; region: string; sourceLicense: string }) {
    const result = body.csvPath ? await this.catalogs.importFromCsv(body.catalogCode, body.csvPath, { region: body.region, sourceLicense: body.sourceLicense, sourceUrl: body.csvUrl }) : { errors: [], imported: 0 };
    return { code: 0, data: { ...result, job: body.csvPath ? 'completed' : 'queued' }, message: 'import queued', traceId: crypto.randomUUID() };
  }

  @Get(':catalogCode/items')
  items(@Param('catalogCode') _catalogCode: string, @Query('keyword') keyword = '') {
    return { code: 0, data: { items: this.catalogs.searchByKeyword(keyword), total: this.catalogs.searchByKeyword(keyword).length }, message: 'ok', traceId: crypto.randomUUID() };
  }
}
