import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'dataExports' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/data-exports',
    detailEndpoint: '/api/v1/admin/data-exports/{id}',
    mutationEndpoint: '/api/v1/admin/data-exports',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.dataExports',
    titleKey: 'admin.pages.dataExports.title',
    descriptionKey: 'admin.pages.dataExports.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'data-exports:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'data-exports:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'data-exports:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.dataExports.success',
    errorToastKey: 'admin.toast.dataExports.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['data-exports.list', 'data-exports.detail', 'data-exports.mutate', 'data-exports.export'],
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
    { id: 'data-exports-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-data-exports-001' },
    { id: 'data-exports-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-data-exports-002' },
    { id: 'data-exports-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-data-exports-003' },
  ],
  apiClientUsage: [
    'adminClient.dataExports.list(filters)',
    'adminClient.dataExports.detail(id)',
    'adminClient.dataExports.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function DataExportsAdminPage() {
  void adminPageContract;
  return <AdminModulePage copy={adminModulePages[moduleKey]} />;
}

export default DataExportsAdminPage;
