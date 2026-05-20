import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';

import { SearchService } from './search.service.js';

@Controller('api/v1/search')
export class SearchController {
  constructor(@Inject(SearchService) private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') q = '', @Query('types') types = '', @Headers('x-tenant-id') tenantId = 'demo-tenant'): unknown {
    return {
      code: 'OK',
      data: this.searchService.search({ q, tenantId, types }),
      message: 'Search results',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('suggestions')
  suggestions(@Headers('x-tenant-id') tenantId = 'demo-tenant'): unknown {
    return {
      code: 'OK',
      data: {
        items: this.searchService.suggest(tenantId),
        keyboardHint: 'Cmd+K / Ctrl+K',
        tenantId,
      },
      message: 'Search suggestions',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('stats')
  stats(): unknown {
    return {
      code: 'OK',
      data: {
        ...this.searchService.stats(),
        searchableTypes: ['customers', 'projects', 'contracts', 'reports', 'agents', 'tenders', 'policies'],
        shortcuts: ['Ctrl+K', 'Cmd+K'],
      },
      message: 'Search stats',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('help')
  help(): unknown {
    return {
      code: 'OK',
      data: {
        examples: ['合同 风险', '政策 资金', 'LV5 智能管家', '招标 框架'],
        notes: ['Results are scoped by tenant headers.', 'Public policies are visible to every tenant.', 'The UI opens this endpoint through the shared Command component.'],
      },
      message: 'Search help',
      traceId: crypto.randomUUID(),
    };
  }
}
