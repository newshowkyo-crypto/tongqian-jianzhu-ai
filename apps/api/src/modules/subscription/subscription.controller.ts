import { Body, Controller, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common';

import { PlanService } from './plans/plan.service.js';
import type { PlanCode } from './subscription-types.js';
import { SubscriptionService } from './subscription.service.js';

@Controller('api/v1/subscriptions')
export class SubscriptionController {
  constructor(
    @Inject(PlanService) private readonly plans: PlanService,
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
  ) {}

  @Get('plans')
  listPlans(): unknown {
    return { code: 'OK', data: this.plans.list(), message: 'Subscription plans', traceId: crypto.randomUUID() };
  }

  @Get('me')
  me(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subscriptions.getByTenant(tenantId), message: 'Subscription', traceId: crypto.randomUUID() };
  }

  @Post()
  create(@Body() body: { planCode: PlanCode }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.subscriptions.create({ planCode: body.planCode, tenantId }), message: 'Subscription created', traceId: crypto.randomUUID() };
  }

  @Post(':id/change-plan')
  changePlan(@Param('id') id: string, @Body() body: { toPlan: PlanCode }): unknown {
    return { code: 'OK', data: this.subscriptions.changePlan(id, body.toPlan), message: 'Plan changed', traceId: crypto.randomUUID() };
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.subscriptions.cancel(id), message: 'Subscription canceled', traceId: crypto.randomUUID() };
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.subscriptions.reactivate(id), message: 'Subscription reactivated', traceId: crypto.randomUUID() };
  }

  @Patch(':id/auto-renewal')
  setAutoRenewal(@Param('id') id: string, @Body() body: { autoRenew: boolean }): unknown {
    return { code: 'OK', data: this.subscriptions.setAutoRenewal(id, body.autoRenew), message: 'Auto-renewal updated', traceId: crypto.randomUUID() };
  }
}
