import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'systemConfig' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/system-config',
    detailEndpoint: '/api/v1/admin/system-config/{id}',
    mutationEndpoint: '/api/v1/admin/system-config',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.systemConfig',
    titleKey: 'admin.pages.systemConfig.title',
    descriptionKey: 'admin.pages.systemConfig.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'system-config:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'system-config:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'system-config:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.systemConfig.success',
    errorToastKey: 'admin.toast.systemConfig.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['system-config.list', 'system-config.detail', 'system-config.mutate', 'system-config.export'],
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
    { id: 'system-config-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-system-config-001' },
    { id: 'system-config-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-system-config-002' },
    { id: 'system-config-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-system-config-003' },
  ],
  apiClientUsage: [
    'adminClient.systemConfig.list(filters)',
    'adminClient.systemConfig.detail(id)',
    'adminClient.systemConfig.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function SystemConfigAdminPage() {
  void adminPageContract;
  return <AdminModulePage copy={adminModulePages[moduleKey]} />;
}

export default SystemConfigAdminPage;
