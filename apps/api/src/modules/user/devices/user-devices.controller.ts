import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { UserDevicesService } from './user-devices.service.js';
import type { BindUserDeviceInput, UserDeviceRecord } from './user-devices.service.js';

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
  traceId: string;
}

type BindDeviceBody = Omit<BindUserDeviceInput, 'lastIp' | 'tenantId' | 'userId'>;

@Controller('api/v1/user/devices')
export class UserDevicesController {
  constructor(@Inject(UserDevicesService) private readonly devices: UserDevicesService) {}

  @Post('bind')
  bind(
    @Body() body: BindDeviceBody,
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
    @Headers('x-forwarded-for') lastIp?: string,
  ): ApiResponse<UserDeviceRecord> {
    return this.wrap(this.devices.bind({ ...body, lastIp, tenantId, userId }), 'Device bound');
  }

  @Get()
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') userId = 'mock-user'): ApiResponse<UserDeviceRecord[]> {
    return this.wrap(this.devices.list(tenantId, userId), 'Device list');
  }

  @Post(':id/revoke')
  revoke(
    @Param('id') deviceId: string,
    @Headers('x-tenant-id') tenantId = 'mock-tenant',
    @Headers('x-user-id') userId = 'mock-user',
  ): ApiResponse<UserDeviceRecord> {
    return this.wrap(this.devices.revoke(tenantId, userId, deviceId), 'Device revoked');
  }

  private wrap<T>(data: T, message: string): ApiResponse<T> {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
