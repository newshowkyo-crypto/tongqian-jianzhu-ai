'use client';

import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'refunds' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/refunds',
    detailEndpoint: '/api/v1/admin/refunds/{id}',
    mutationEndpoint: '/api/v1/admin/refunds',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.refunds',
    titleKey: 'admin.pages.refunds.title',
    descriptionKey: 'admin.pages.refunds.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'refunds:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'refunds:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'refunds:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.refunds.success',
    errorToastKey: 'admin.toast.refunds.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['refunds.list', 'refunds.detail', 'refunds.mutate', 'refunds.export'],
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
    { id: 'refunds-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-refunds-001' },
    { id: 'refunds-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-refunds-002' },
    { id: 'refunds-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-refunds-003' },
  ],
  apiClientUsage: [
    'adminClient.refunds.list(filters)',
    'adminClient.refunds.detail(id)',
    'adminClient.refunds.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function RefundsAdminPage() {
  return <AdminModulePage contract={adminPageContract} copy={adminModulePages[moduleKey]} moduleKey={moduleKey} />;
}

export default RefundsAdminPage;
