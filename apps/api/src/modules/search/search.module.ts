import { Module } from '@nestjs/common';

import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  controllers: [SearchController],
  exports: [SearchService],
  providers: [SearchService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SearchModule {}
