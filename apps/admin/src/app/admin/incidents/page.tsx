import { AdminModulePage } from '../../../components/admin-module-page';
import { adminModulePages } from '../../../m3-pages';

const moduleKey = 'incidents' as const;

const adminPageContract = {
  api: {
    clientPackage: '@tongqian/api-client',
    queryKey: ['admin', moduleKey, 'list'],
    listEndpoint: '/api/v1/admin/incidents',
    detailEndpoint: '/api/v1/admin/incidents/{id}',
    mutationEndpoint: '/api/v1/admin/incidents',
    queryLibrary: '@tanstack/react-query',
    staleTimeMs: 30000,
  },
  layout: {
    components: ['PageLayout', 'PageHeader', 'PageContent', 'FilterBar', 'DataTable', 'Drawer', 'StatusBadge', 'LoadingState', 'ErrorState', 'EmptyState'],
    breadcrumbsKey: 'admin.navigation.incidents',
    titleKey: 'admin.pages.incidents.title',
    descriptionKey: 'admin.pages.incidents.description',
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
    { key: 'openDrawer', labelKey: 'admin.actions.openDrawer', permission: 'incidents:read' },
    { key: 'approve', labelKey: 'admin.actions.approve', permission: 'incidents:approve' },
    { key: 'rollback', labelKey: 'admin.actions.rollback', permission: 'incidents:rollback' },
  ],
  states: {
    loadingKey: 'admin.states.loading',
    errorKey: 'admin.states.error',
    emptyKey: 'admin.states.empty',
    successToastKey: 'admin.toast.incidents.success',
    errorToastKey: 'admin.toast.incidents.error',
  },
  safeguards: {
    whereGuard: ['tenant_id', 'scope_type', 'project_id', 'owner_id'],
    auditEvents: ['incidents.list', 'incidents.detail', 'incidents.mutate', 'incidents.export'],
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
    { id: 'incidents-001', status: 'active', risk: 'medium', owner: 'platform-owner', traceId: 'm37-incidents-001' },
    { id: 'incidents-002', status: 'processing', risk: 'high', owner: 'ops-admin', traceId: 'm37-incidents-002' },
    { id: 'incidents-003', status: 'completed', risk: 'low', owner: 'audit-bot', traceId: 'm37-incidents-003' },
  ],
  apiClientUsage: [
    'adminClient.incidents.list(filters)',
    'adminClient.incidents.detail(id)',
    'adminClient.incidents.mutate(payload, idempotencyKey)',
    'queryClient.invalidateQueries({ queryKey: adminPageContract.api.queryKey })',
  ],
} as const;

function IncidentsAdminPage() {
  void adminPageContract;
  return <AdminModulePage copy={adminModulePages[moduleKey]} />;
}

export default IncidentsAdminPage;
