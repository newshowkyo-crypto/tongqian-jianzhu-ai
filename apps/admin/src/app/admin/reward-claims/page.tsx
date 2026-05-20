'use client';

import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'rewardClaims' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/reward-claims',
    detailEndpoint: '/api/v1/admin/reward-claims/{id}',
    mutationEndpoint: '/api/v1/admin/reward-claims',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.rewardClaims',
    titleKey: 'admin.pages.rewardClaims.title',
    descriptionKey: 'admin.pages.rewardClaims.description',
  },
  filters: [
    { key: 'tenantId', labelKey: 'admin.filters.tenant', type: 'tenant-select' },
    { key: 'scopeType', labelKey: 'admin.filters.scope', type: 'segmented-control' },
    { key: 'status', labelKey: 'admin.filters.status', type: 'status-select' },
    { key: 'traceId', labelKey: 'admin.filters.trace', type: 'text' },
  ],
  columns: [
    { key: 'name', labelKey: 'admin.table.name', sortable: true },
    { key: 'status', labelKey: 'admin.table.status', badge: true },
    { key: 'owner', labelKey: 'admin.table.owner', sortable: false },
    { key: 'risk', labelKey: 'admin.table.risk', badge: true },
    { key: 'updatedAt', labelKey: 'admin.table.updatedAt', sortable: true },
    { key: 'traceId', labelKey: 'admin.table.traceId', mono: true },
  ],
  rowActions: [
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'reward-claims:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'reward-claims:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'reward-claims:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.rewardClaims.success',
    errorToastKey: 'admin.toast.rewardClaims.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['reward-claims.list', 'reward-claims.detail', 'reward-claims.mutate', 'reward-claims.export'],
    idempotentMutations: true,
    requirePlatformOwnerForWrite: true,
    secondPasswordForRiskWrite: true,
  },
  drawer: {
    sections: [
      { key: 'summary', labelKey: 'admin.drawer.summary' },
      { key: 'beforeAfter', labelKey: 'admin.drawer.beforeAfter' },
      { key: 'approval', labelKey: 'admin.drawer.approval' },
      { key: 'audit', labelKey: 'admin.drawer.audit' },
    ],
  },
  seedRows: [
    { id: 'reward-claims-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-reward-claims-001' },
    { id: 'reward-claims-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-reward-claims-002' },
    { id: 'reward-claims-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-reward-claims-003' },
  ],
  apiClientUsage: [
    'adminClient.rewardClaims.list(filters)',
    'adminClient.rewardClaims.detail(id)',
    'adminClient.rewardClaims.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function RewardClaimsAdminPage() {
  return <AdminModulePage contract={adminPageContract} copy={adminModulePages[moduleKey]} moduleKey={moduleKey} />;
}

export default RewardClaimsAdminPage;
