import { Module } from '@nestjs/common';

import { LegalCorpusService } from './legal-corpus.service.js';

@Module({
  exports: [LegalCorpusService],
  providers: [LegalCorpusService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LegalCorpusModule {}
