import { SetMetadata } from '@nestjs/common';

export const REQUIRED_ROLES_KEY = 'requiredRoles';

export function Roles(...roles: string[]): MethodDecorator & ClassDecorator {
  return SetMetadata(REQUIRED_ROLES_KEY, roles);
}
