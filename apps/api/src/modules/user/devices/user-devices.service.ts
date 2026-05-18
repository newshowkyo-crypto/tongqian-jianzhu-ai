import { Injectable, NotFoundException } from '@nestjs/common';

export type UserDeviceStatus = 'active' | 'revoked';

export interface UserDeviceRecord {
  id: string;
  userId: string;
  tenantId: string;
  deviceType: 'desktop' | 'mobile' | 'web';
  deviceName: string;
  deviceFinger: string;
  lastLoginAt: string;
  lastIp?: string;
  status: UserDeviceStatus;
  revokedAt?: string;
  createdAt: string;
}

export interface BindUserDeviceInput {
  deviceFinger: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'web';
  lastIp?: string;
  tenantId: string;
  userId: string;
}

@Injectable()
export class UserDevicesService {
  private readonly devices = new Map<string, UserDeviceRecord>();

  bind(input: BindUserDeviceInput): UserDeviceRecord {
    const now = new Date().toISOString();
    const existing = [...this.devices.values()].find((device) => device.userId === input.userId && device.deviceFinger === input.deviceFinger);
    if (existing) {
      existing.lastLoginAt = now;
      existing.lastIp = input.lastIp;
      existing.status = 'active';
      existing.revokedAt = undefined;
      return existing;
    }

    const device: UserDeviceRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      deviceFinger: input.deviceFinger,
      deviceName: input.deviceName,
      deviceType: input.deviceType,
      lastIp: input.lastIp,
      lastLoginAt: now,
      status: 'active',
      tenantId: input.tenantId,
      userId: input.userId,
    };
    this.devices.set(device.id, device);
    return device;
  }

  list(tenantId: string, userId: string): UserDeviceRecord[] {
    return [...this.devices.values()].filter((device) => device.tenantId === tenantId && device.userId === userId);
  }

  revoke(tenantId: string, userId: string, deviceId: string): UserDeviceRecord {
    const device = this.devices.get(deviceId);
    if (!device || device.tenantId !== tenantId || device.userId !== userId) {
      throw new NotFoundException({ code: 'SEC.DEVICE.NOT_FOUND', message: 'Device not found' });
    }
    device.status = 'revoked';
    device.revokedAt = new Date().toISOString();
    return device;
  }
}
