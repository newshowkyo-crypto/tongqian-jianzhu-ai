import type { PositionTag } from './position-tag.js';
import type { UserRole } from './role.js';

export enum ScopeType {
  TENANT = 'tenant',
  PROJECT = 'project',
  OWNER = 'owner',
  PLATFORM = 'platform',
}

export interface ScopeContext {
  tenantId: string;
  userId: string;
  scopeType: ScopeType;
  roles: UserRole[];
  positionTags: PositionTag[];
  traceId: string;
  projectId?: string;
  ownerId?: string;
  ownerOnly?: boolean;
}

export interface ScopeWhere {
  tenant_id: string;
  scope_type: ScopeType;
  deleted_at: null;
  project_id?: string;
  owner_id?: string;
}

export const SCOPE_TYPE_VALUES = Object.values(ScopeType);

export type ScopeTypeValue = `${ScopeType}`;
