import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'featureFlags' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/feature-flags',
    detailEndpoint: '/api/v1/admin/feature-flags/{id}',
    mutationEndpoint: '/api/v1/admin/feature-flags',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.featureFlags',
    titleKey: 'admin.pages.featureFlags.title',
    descriptionKey: 'admin.pages.featureFlags.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'feature-flags:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'feature-flags:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'feature-flags:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.featureFlags.success',
    errorToastKey: 'admin.toast.featureFlags.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['feature-flags.list', 'feature-flags.detail', 'feature-flags.mutate', 'feature-flags.export'],
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
    { id: 'feature-flags-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-feature-flags-001' },
    { id: 'feature-flags-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-feature-flags-002' },
    { id: 'feature-flags-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-feature-flags-003' },
  ],
  apiClientUsage: [
    'adminClient.featureFlags.list(filters)',
    'adminClient.featureFlags.detail(id)',
    'adminClient.featureFlags.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function FeatureFlagsAdminPage() {
  void adminPageContract;
  return <AdminModulePage copy={adminModulePages[moduleKey]} />;
}

export default FeatureFlagsAdminPage;
