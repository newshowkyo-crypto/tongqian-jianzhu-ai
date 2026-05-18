import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { AddictionService } from './addiction.service.js';

@Controller('api/v1')
export class AddictionController {
  constructor(@Inject(AddictionService) private readonly addiction: AddictionService) {}

  @Post('checkins')
  checkin(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.checkin(userId), message: 'Checkin completed', traceId: crypto.randomUUID() };
  }

  @Get('checkins/streak')
  streak(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.streak(userId), message: 'Checkin streak', traceId: crypto.randomUUID() };
  }

  @Post('lottery/draw')
  draw(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.drawLottery(userId), message: 'Lottery draw', traceId: crypto.randomUUID() };
  }

  @Get('lottery/upcoming')
  upcoming(): unknown {
    return { code: 'OK', data: this.addiction.upcomingLottery(), message: 'Upcoming lottery', traceId: crypto.randomUUID() };
  }

  @Get('building-level/me')
  level(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.addiction.addBuildingExp(tenantId, 0), message: 'Building level', traceId: crypto.randomUUID() };
  }

  @Post('building-level/exp')
  exp(@Body() body: { exp: number }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.addiction.addBuildingExp(tenantId, body.exp), message: 'Building level updated', traceId: crypto.randomUUID() };
  }

  @Get('monthly-growth-reports/me')
  report(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.addiction.growthReport(tenantId), message: 'Monthly growth report', traceId: crypto.randomUUID() };
  }

  @Post('urgency-push')
  urgency(@Body() body: { resourceId: string; type: string }, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.pushUrgency(userId, body), message: 'Urgency push evaluated', traceId: crypto.randomUUID() };
  }

  @Get('addiction/hooks')
  hooks(@Headers('x-user-role') role: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM' = 'BUILDING_COMPANY_USER'): unknown {
    return { code: 'OK', data: this.addiction.hooks(role), message: 'Addiction hooks', traceId: crypto.randomUUID() };
  }

  @Post('addiction/hooks/:code/trigger')
  trigger(@Param('code') code: string, @Headers('x-user-id') userId = 'mock-user', @Headers('x-user-role') role: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM' = 'BUILDING_COMPANY_USER'): unknown {
    return { code: 'OK', data: this.addiction.triggerHook(userId, code, role), message: 'Hook trigger evaluated', traceId: crypto.randomUUID() };
  }

  @Post('share-unlock/:resourceType/:resourceId')
  share(@Param('resourceType') resourceType: string, @Param('resourceId') resourceId: string, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.shareUnlock(userId, resourceType, resourceId), message: 'Share unlock granted', traceId: crypto.randomUUID() };
  }

  @Get('onboarding/me')
  onboarding(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.onboardingStatus(userId), message: 'Onboarding progress', traceId: crypto.randomUUID() };
  }

  @Post('onboarding/steps/:step')
  step(@Param('step') step: string, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.addiction.completeOnboardingStep(userId, step), message: 'Onboarding step saved', traceId: crypto.randomUUID() };
  }

  @Post('reward-clearing/preview')
  clearing(@Body() body: { amount: number; kind: 'cash' | 'credits' | 'physical' }): unknown {
    return { code: 'OK', data: this.addiction.clearingPreview(body.kind, body.amount), message: 'Reward clearing preview', traceId: crypto.randomUUID() };
  }
}
