import { Controller, Get } from '@nestjs/common';

import { FuelProgressService } from './fuel-progress.service.js';

@Controller('api/v1/admin/fuel-progress')
export class FuelProgressController {
  constructor(private readonly fuelProgress: FuelProgressService) {}

  @Get()
  get() {
    return this.fuelProgress.get();
  }
}
