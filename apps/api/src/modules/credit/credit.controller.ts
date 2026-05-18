import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';

import { CreditService } from './credit.service.js';
import { TopupPackageService } from './topup/topup-package.service.js';

@Controller('api/v1')
export class CreditController {
  constructor(
    @Inject(CreditService) private readonly credits: CreditService,
    @Inject(TopupPackageService) private readonly packages: TopupPackageService,
  ) {}

  @Get('credits/balance')
  balance(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.credits.balance(userId, tenantId), message: 'Credit balance', traceId: crypto.randomUUID() };
  }

  @Get('credits/lots')
  lots(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.credits.lotsFor(userId, tenantId), message: 'Credit lots', traceId: crypto.randomUUID() };
  }

  @Get('credits/logs')
  logs(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.credits.logsFor(userId, tenantId), message: 'Credit logs', traceId: crypto.randomUUID() };
  }

  @Get('topup/packages')
  topupPackages(): unknown {
    return { code: 'OK', data: this.packages.list(), message: 'Topup packages', traceId: crypto.randomUUID() };
  }

  @Post('topup')
  topup(
    @Body() body: { idempotencyKey?: string; packageCode: string; paymentId?: string },
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return {
      code: 'OK',
      data: this.credits.topup({
        idempotencyKey: body.idempotencyKey ?? crypto.randomUUID(),
        packageCode: body.packageCode,
        paymentId: body.paymentId ?? 'mock-payment',
        tenantId,
        userId,
      }),
      message: 'Topup completed',
      traceId: crypto.randomUUID(),
    };
  }
}
