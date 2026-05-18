import { type PermissionPoint } from './permission-points.js';
import { getPositionPermissions, type PositionPermissionSubject } from './position-permission.js';
import { getRolePermissions, type RolePermissionSubject } from './role-permission.js';

export function hasPermission(
  roles: readonly RolePermissionSubject[],
  positionTags: readonly PositionPermissionSubject[],
  requiredPoint: PermissionPoint | string,
): boolean {
  const grantedPoints = new Set<string>();

  for (const role of roles) {
    for (const point of getRolePermissions(role)) {
      grantedPoints.add(point);
    }
  }

  for (const positionTag of positionTags) {
    for (const point of getPositionPermissions(positionTag)) {
      grantedPoints.add(point);
    }
  }

  return grantedPoints.has(requiredPoint);
}
