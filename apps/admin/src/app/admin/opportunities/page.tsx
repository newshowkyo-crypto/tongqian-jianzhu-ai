'use client';

import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'opportunities' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/opportunities',
    detailEndpoint: '/api/v1/admin/opportunities/{id}',
    mutationEndpoint: '/api/v1/admin/opportunities',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.opportunities',
    titleKey: 'admin.pages.opportunities.title',
    descriptionKey: 'admin.pages.opportunities.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'opportunities:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'opportunities:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'opportunities:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.opportunities.success',
    errorToastKey: 'admin.toast.opportunities.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['opportunities.list', 'opportunities.detail', 'opportunities.mutate', 'opportunities.export'],
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
    { id: 'opportunities-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-opportunities-001' },
    { id: 'opportunities-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-opportunities-002' },
    { id: 'opportunities-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-opportunities-003' },
  ],
  apiClientUsage: [
    'adminClient.opportunities.list(filters)',
    'adminClient.opportunities.detail(id)',
    'adminClient.opportunities.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function OpportunitiesAdminPage() {
  return <AdminModulePage contract={adminPageContract} copy={adminModulePages[moduleKey]} moduleKey={moduleKey} />;
}

export default OpportunitiesAdminPage;
