import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

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
  private readonly alerts: Array<{ alertType: string; at: string; deviceId: string; userId: string }> = [];
  private readonly devices = new Map<string, UserDeviceRecord>();

  /**
   * Binds a device and enforces the five active device limit.
   *
   * @param input Device binding input.
   * @returns Bound device.
   */
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
    const active = this.list(input.tenantId, input.userId).filter((device) => device.status === 'active');
    if (active.length >= 5) {
      throw new BusinessError({ code: ErrorCodes.SEC_REDLINE_TRIGGERED.code, details: { active: active.length, userId: input.userId }, message: 'User device limit reached.' });
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
    this.detectRemoteLogin(device);
    return device;
  }

  /**
   * Lists devices within tenant and user boundaries.
   *
   * @param tenantId Tenant id.
   * @param userId User id.
   * @returns Device records.
   */
  list(tenantId: string, userId: string): UserDeviceRecord[] {
    return [...this.devices.values()].filter((device) => device.tenantId === tenantId && device.userId === userId);
  }

  /**
   * Revokes a device and returns the updated record.
   *
   * @param tenantId Tenant id.
   * @param userId User id.
   * @param deviceId Device id.
   * @returns Revoked device.
   */
  revoke(tenantId: string, userId: string, deviceId: string): UserDeviceRecord {
    const device = this.devices.get(deviceId);
    if (!device || device.tenantId !== tenantId || device.userId !== userId) {
      throw new BusinessError({ code: ErrorCodes.SEC_REDLINE_TRIGGERED.code, details: { deviceId, tenantId, userId }, message: 'Device not found.' });
    }
    device.status = 'revoked';
    device.revokedAt = new Date().toISOString();
    this.alerts.push({ alertType: 'device.revoked', at: device.revokedAt, deviceId, userId });
    return device;
  }

  /**
   * Kicks out every device except the current one after password reset.
   *
   * @param tenantId Tenant id.
   * @param userId User id.
   * @param keepDeviceId Device id to keep.
   * @returns Revoked device count.
   */
  revokeOthers(tenantId: string, userId: string, keepDeviceId: string): number {
    let count = 0;
    for (const device of this.list(tenantId, userId)) {
      if (device.id !== keepDeviceId && device.status === 'active') {
        this.revoke(tenantId, userId, device.id);
        count += 1;
      }
    }
    return count;
  }

  /**
   * Lists remote-login and device-security alerts.
   *
   * @param userId User id.
   * @returns Security alerts.
   */
  listAlerts(userId: string): Array<{ alertType: string; at: string; deviceId: string; userId: string }> {
    return this.alerts.filter((alert) => alert.userId === userId);
  }

  private detectRemoteLogin(device: UserDeviceRecord): void {
    const previous = this.list(device.tenantId, device.userId).filter((item) => item.id !== device.id && item.status === 'active').at(-1);
    if (previous?.lastIp && device.lastIp && previous.lastIp !== device.lastIp) {
      this.alerts.push({ alertType: 'device.remote_ip_changed', at: new Date().toISOString(), deviceId: device.id, userId: device.userId });
    }
  }
}
