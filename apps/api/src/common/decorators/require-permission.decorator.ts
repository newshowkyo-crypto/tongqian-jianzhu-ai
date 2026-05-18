import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

export function RequirePermission(permission: string): MethodDecorator & ClassDecorator {
  return SetMetadata(REQUIRED_PERMISSION_KEY, permission);
}
