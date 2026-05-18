import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';
import type { PayChannel, PaymentOrderType } from '@tongqian/types';

import { PaymentService } from './payment.service.js';

@Controller('api/v1')
export class PaymentController {
  constructor(@Inject(PaymentService) private readonly payments: PaymentService) {}

  @Post('payments/orders')
  createOrder(
    @Body() body: { amountCny: number; channel: PayChannel; idempotencyKey?: string; metadata?: Record<string, unknown>; type: PaymentOrderType },
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return {
      code: 'OK',
      data: this.payments.createOrder({ ...body, idempotencyKey: body.idempotencyKey ?? crypto.randomUUID(), tenantId, userId }),
      message: 'Payment order created',
      traceId: crypto.randomUUID(),
    };
  }

  @Get('payments/orders/:id')
  getOrder(@Param('id') id: string, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.payments.getOrder(id, tenantId, userId), message: 'Payment order', traceId: crypto.randomUUID() };
  }

  @Post('payments/wechat/webhook')
  wechatWebhook(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string | string[] | undefined>): unknown {
    return { code: 'OK', data: this.payments.handleWebhook('wechat', { body, headers }), message: 'Wechat webhook accepted', traceId: crypto.randomUUID() };
  }

  @Post('payments/alipay/webhook')
  alipayWebhook(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string | string[] | undefined>): unknown {
    return { code: 'OK', data: this.payments.handleWebhook('alipay', { body, headers }), message: 'Alipay webhook accepted', traceId: crypto.randomUUID() };
  }

  @Post('refunds/request')
  requestRefund(
    @Body() body: { amountCny?: number; orderId: string; reason: string },
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
  ): unknown {
    return { code: 'OK', data: this.payments.requestRefund({ ...body, tenantId, userId }), message: 'Refund requested', traceId: crypto.randomUUID() };
  }

  @Post('refunds/:id/complete')
  completeRefund(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.payments.completeRefund(id), message: 'Refund completed', traceId: crypto.randomUUID() };
  }

  @Get('refunds/me')
  refunds(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.payments.listRefunds(userId), message: 'Refunds', traceId: crypto.randomUUID() };
  }

  @Post('payments/auto-charge/wechat-contracts')
  signWechatContract(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.payments.signWechatContract(userId), message: 'Wechat contract signed', traceId: crypto.randomUUID() };
  }

  @Post('payments/auto-charge/wechat-contracts/:id/revoke')
  revokeContract(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.payments.revokeContract(id), message: 'Wechat contract revoked', traceId: crypto.randomUUID() };
  }

  @Post('agent/commissions/cross-domain')
  settleCrossDomain(@Body() body: { actualAmountCny: number; assignedAgentId: string; clientTenantId: string; dispatchId: string; ownerAgentId: string }): unknown {
    return { code: 'OK', data: this.payments.settleCrossDomain(body), message: 'Cross-domain commission settled', traceId: crypto.randomUUID() };
  }

  @Get('agent/commissions/me')
  commissions(@Headers('x-agent-id') agentId = 'mock-agent'): unknown {
    return { code: 'OK', data: this.payments.listCommissions(agentId), message: 'Agent commissions', traceId: crypto.randomUUID() };
  }

  @Post('agent/withdrawals')
  requestWithdrawal(@Body() body: { amountCny: number; bankCardId: string; level?: 'gold' | 'standard' | 'vip' }, @Headers('x-agent-id') agentId = 'mock-agent'): unknown {
    return { code: 'OK', data: this.payments.requestWithdrawal({ ...body, agentId }), message: 'Withdrawal requested', traceId: crypto.randomUUID() };
  }

  @Get('agent/withdrawals/me')
  withdrawals(@Headers('x-agent-id') agentId = 'mock-agent'): unknown {
    return { code: 'OK', data: this.payments.listWithdrawals(agentId), message: 'Agent withdrawals', traceId: crypto.randomUUID() };
  }

  @Post('rewards/payment-route')
  routeReward(@Body() body: { amountCny: number }): unknown {
    return { code: 'OK', data: this.payments.routeRewardPayment(body.amountCny), message: 'Reward payment route', traceId: crypto.randomUUID() };
  }
}
