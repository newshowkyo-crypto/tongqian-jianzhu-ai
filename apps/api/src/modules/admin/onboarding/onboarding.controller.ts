import { Controller, Get } from '@nestjs/common';

import type { OnboardingService } from './onboarding.service.js';

@Controller('api/v1/admin/onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('summary')
  summary() {
    return this.onboarding.summary();
  }
}
