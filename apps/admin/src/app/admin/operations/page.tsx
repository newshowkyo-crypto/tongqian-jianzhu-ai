import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'operations' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/operations',
    detailEndpoint: '/api/v1/admin/operations/{id}',
    mutationEndpoint: '/api/v1/admin/operations',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.operations',
    titleKey: 'admin.pages.operations.title',
    descriptionKey: 'admin.pages.operations.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'operations:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'operations:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'operations:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.operations.success',
    errorToastKey: 'admin.toast.operations.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['operations.list', 'operations.detail', 'operations.mutate', 'operations.export'],
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
    { id: 'operations-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-operations-001' },
    { id: 'operations-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-operations-002' },
    { id: 'operations-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-operations-003' },
  ],
  apiClientUsage: [
    'adminClient.operations.list(filters)',
    'adminClient.operations.detail(id)',
    'adminClient.operations.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function OperationsAdminPage() {
  void adminPageContract;
  return <AdminModulePage copy={adminModulePages[moduleKey]} />;
}

export default OperationsAdminPage;
