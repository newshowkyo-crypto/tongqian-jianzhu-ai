import { Controller, Get, Inject } from '@nestjs/common';

import { OnboardingService } from './onboarding.service.js';

@Controller('api/v1/admin/onboarding')
export class OnboardingController {
  constructor(@Inject(OnboardingService) private readonly onboarding: OnboardingService) {}

  @Get('summary')
  summary() {
    return this.onboarding.summary();
  }
}
