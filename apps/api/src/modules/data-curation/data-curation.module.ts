import { Module } from '@nestjs/common';

import { AiScorerService } from './ai-scorer.service.js';
import { GenericCsvImporterController } from './csv-importer/generic-csv-importer.controller.js';
import { WenshuCsvImporterService } from './csv-importer/wenshu-csv-importer.service.js';
import { DuplicateDetectorService } from './duplicate-detector.service.js';
import { QualityComparatorService } from './quality-comparator.service.js';

@Module({ controllers: [GenericCsvImporterController], exports: [AiScorerService, DuplicateDetectorService, QualityComparatorService, WenshuCsvImporterService], providers: [AiScorerService, DuplicateDetectorService, QualityComparatorService, WenshuCsvImporterService] })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DataCurationModule {}
