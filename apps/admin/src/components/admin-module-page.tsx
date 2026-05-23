'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type AdminModuleSummary } from '@tongqian/api-client';
import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  Input,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  StatCard,
  Toast,
} from '@tongqian/ui';
import { useMemo, useState, type ReactNode } from 'react';

import type { AdminModulePageCopy } from '../m3-pages';

type AdminStatus = 'active' | 'completed' | 'failed' | 'pending' | 'processing';

interface AdminPageContract {
  readonly api: {
    readonly detailEndpoint: string;
    readonly listEndpoint: string;
    readonly mutationEndpoint: string;
    readonly queryKey: readonly unknown[];
    readonly staleTimeMs?: number;
  };
  readonly columns: ReadonlyArray<{
    readonly badge?: boolean;
    readonly key: string;
    readonly labelKey: string;
    readonly mono?: boolean;
    readonly sortable?: boolean;
  }>;
  readonly drawer?: {
    readonly sections?: ReadonlyArray<{ readonly key: string; readonly labelKey: string }>;
  };
  readonly filters: ReadonlyArray<{
    readonly key: string;
    readonly labelKey: string;
    readonly type: string;
  }>;
  readonly layout: {
    readonly breadcrumbsKey: string;
    readonly descriptionKey: string;
    readonly titleKey: string;
  };
  readonly rowActions: ReadonlyArray<{
    readonly key: string;
    readonly labelKey: string;
    readonly permission: string;
  }>;
  readonly safeguards: {
    readonly auditEvents: readonly string[];
    readonly idempotentMutations: boolean;
    readonly requirePlatformOwnerForWrite: boolean;
    readonly secondPasswordForRiskWrite: boolean;
    readonly whereGuard: readonly string[];
  };
  readonly seedRows: ReadonlyArray<Record<string, string>>;
  readonly states: {
    readonly emptyKey: string;
    readonly errorKey: string;
    readonly errorToastKey: string;
    readonly loadingKey: string;
    readonly successToastKey: string;
  };
}

type AdminRow = Record<string, ReactNode> & {
  actions: ReactNode;
  id: string;
  name: string;
  owner: string;
  risk: ReactNode;
  status: AdminStatus;
  traceId: ReactNode;
  updatedAt: string;
};

export function AdminModulePage({
  contract,
  copy,
  moduleKey,
}: {
  contract: AdminPageContract;
  copy: AdminModulePageCopy;
  moduleKey: string;
}) {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedRow, setSelectedRow] = useState<AdminRow>();
  const [toast, setToast] = useState<string>();

  const query = useQuery({
    queryFn: () => apiClient.admin.module(moduleKey),
    queryKey: contract.api.queryKey,
    staleTime: contract.api.staleTimeMs ?? 30_000,
  });

  const action = useMutation({
    mutationFn: (input: { actionKey: string; rowId?: string }) =>
      apiClient.admin.mutate(moduleKey, {
        action: input.actionKey,
        endpoint: contract.api.mutationEndpoint,
        idempotencyKey: `${moduleKey}-${input.actionKey}-${input.rowId ?? 'bulk'}`,
        rowId: input.rowId,
      }),
    onError: () => setToast(readable(contract.states.errorToastKey)),
    onSuccess: async (result) => {
      setToast(result.message);
      await queryClient.invalidateQueries({ queryKey: contract.api.queryKey });
    },
  });

  const summary = query.data ?? buildFallbackSummary(copy, contract, moduleKey);
  const summaryStats = summary.stats ?? [];
  const summaryAlerts = summary.alerts ?? [];
  const contractFilters = contract.filters ?? [];
  const contractColumns = contract.columns ?? [];
  const contractRowActions = contract.rowActions ?? [];
  const whereGuards = contract.safeguards?.whereGuard ?? [];
  const auditEvents = contract.safeguards?.auditEvents ?? [];
  const rows = useMemo(() => buildRows(summary, contract, moduleKey, selectedRow?.id), [contract, moduleKey, selectedRow?.id, summary]);
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesKeyword = keyword.length === 0 || JSON.stringify(row).toLowerCase().includes(keyword.toLowerCase());
        const matchesStatus = status === 'all' || row.status === status;
        return matchesKeyword && matchesStatus;
      }),
    [keyword, rows, status],
  );

  function runAction(actionKey: string, rowId?: string) {
    action.mutate({ actionKey, rowId });
  }

  return (
    <PageLayout>
      <PageHeader
        actions={
          <>
            <Button
              className="min-h-11"
              onClick={() => {
                setToast(`Export task created for ${contract.api.listEndpoint}`);
                runAction('export');
              }}
              variant="outline"
            >
              Export audit
            </Button>
            <Button className="min-h-11" disabled={action.isPending} onClick={() => runAction('bulkApprove')}>
              {action.isPending ? 'Submitting' : copy.action}
            </Button>
          </>
        }
        breadcrumbs={`Admin / ${moduleKey}`}
        description={copy.description}
        title={copy.title}
      />
      <PageContent className="space-y-6">
        {query.isLoading ? <LoadingState label={readable(contract.states.loadingKey)} /> : null}
        {query.isError ? (
          <ErrorState
            actionLabel="Retry"
            description={`Real API returned an error. Mock fallback remains available for ${contract.api.listEndpoint}.`}
            onRetry={() => void query.refetch()}
            title={readable(contract.states.errorKey)}
          />
        ) : null}

        <FilterBar>
          {contractFilters.map((filter) => (
            <label className="min-w-48 text-sm font-medium text-neutral-700" key={filter.key}>
              {readable(filter.labelKey)}
              {filter.type === 'status-select' ? (
                <select
                  className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              ) : (
                <Input
                  className="mt-1"
                  onChange={(event) => {
                    if (filter.key === 'traceId' || filter.key === 'tenantId') setKeyword(event.target.value);
                  }}
                  placeholder={filter.type}
                />
              )}
            </label>
          ))}
        </FilterBar>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryStats.map((item) => (
            <StatCard key={item.label} label={item.label} trend={item.trend} value={item.value} />
          ))}
        </div>

        <SectionCard description={`GET ${contract.api.listEndpoint}; mutations use ${contract.api.mutationEndpoint}.`} title="Module data">
          {filteredRows.length === 0 ? (
            <EmptyState action={<Button onClick={() => setKeyword('')}>Clear filters</Button>} description={readable(contract.states.emptyKey)} title="No records" />
          ) : (
            <DataTable
              columns={[
                ...contractColumns.map((column) => ({
                  cell: (row: AdminRow) => row[column.key] ?? '-',
                  header: readable(column.labelKey),
                  key: column.key as keyof AdminRow & string,
                })),
                { header: 'Actions', key: 'actions' as keyof AdminRow & string },
              ]}
              data={filteredRows}
              empty="No records"
              getRowKey={(row) => row.id}
            />
          )}
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard description="The page now consumes the per-route contract instead of discarding it." title="Contract safeguards">
            <div className="grid gap-4 md:grid-cols-2">
              {whereGuards.map((guard) => (
                <label className="flex min-h-12 items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm" key={guard}>
                  <span className="font-medium text-neutral-800">{guard}</span>
                  <input checked readOnly type="checkbox" />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-600">
              {auditEvents.map((event) => (
                <span className="rounded-sm bg-neutral-100 px-2 py-1" key={event}>{event}</span>
              ))}
            </div>
          </SectionCard>

          <SectionCard description={selectedRow ? `Selected ${selectedRow.id}` : 'Click Open on a row to inspect action context.'} title="Drawer preview">
            <div className="space-y-4">
              {(contract.drawer?.sections ?? []).map((section) => (
                <Alert key={section.key} tone="info">
                  {readable(section.labelKey)}
                </Alert>
              ))}
              {summaryAlerts.map((item) => (
                <Alert key={item.message} tone={item.level === 'warning' ? 'warning' : 'success'}>
                  {item.message}
                </Alert>
              ))}
            </div>
          </SectionCard>
        </div>

        {toast ? <Toast onClick={() => setToast(undefined)}>{toast}</Toast> : null}
      </PageContent>
    </PageLayout>
  );

  function buildRowActions(row: AdminRow): ReactNode {
    return (
      <div className="flex flex-wrap gap-2">
        {contractRowActions.map((rowAction) => (
          <Button
            className="min-h-11"
            key={rowAction.key}
            onClick={() => {
              if (rowAction.key === 'openDrawer') setSelectedRow(row);
              runAction(rowAction.key, row.id);
            }}
            size="sm"
            variant={rowAction.key === 'rollback' ? 'outline' : 'primary'}
          >
            {readable(rowAction.labelKey)}
          </Button>
        ))}
      </div>
    );
  }

  function buildRows(summaryData: AdminModuleSummary, pageContract: AdminPageContract, key: string, activeId?: string): AdminRow[] {
    const safeRows = summaryData?.rows ?? [];
    const seedRows = pageContract?.seedRows ?? [];
    const sourceRows = safeRows.length > 0 ? safeRows : [...seedRows];
    return sourceRows.map((source, index) => {
      const id = source.id ?? `${key}-${index + 1}`;
      const statusValue = normalizeStatus(source.status);
      const row = {
        actions: null,
        id,
        name: source.name ?? source.item ?? `${copy.title} ${index + 1}`,
        owner: source.owner ?? 'ops-admin',
        risk: <span className="rounded-sm bg-warning-50 px-2 py-1 text-xs text-warning-700">{source.risk ?? 'medium'}</span>,
        status: activeId === id ? 'processing' : statusValue,
        traceId: <code className="text-xs">{source.traceId ?? `m38-${key}-${index + 1}`}</code>,
        updatedAt: source.updatedAt ?? new Date().toISOString().slice(0, 16).replace('T', ' '),
      } satisfies AdminRow;
      return { ...row, actions: buildRowActions(row) };
    });
  }
}

function buildFallbackSummary(copy: AdminModulePageCopy, contract: AdminPageContract, moduleKey: string): AdminModuleSummary {
  return {
    alerts: [
      { level: 'success', message: `${moduleKey} mock API fallback is active.` },
      { level: 'warning', message: 'Write actions keep approval, audit, and idempotency markers visible.' },
    ],
    rows: contract.seedRows.map((row, index) => ({
      ...row,
      item: row.name ?? `${copy.title} ${index + 1}`,
      next: index === 0 ? copy.action : 'write audit_log and refresh system_configs',
      updatedAt: `2026-05-20 1${index}:20`,
    })),
    stats: [
      { label: 'Rows', trend: contract.api.listEndpoint, value: String(contract.seedRows.length) },
      { label: 'Actions', trend: 'clickable', value: String(contract.rowActions.length) },
      { label: 'Guards', trend: '4-layer WHERE', value: String(contract.safeguards.whereGuard.length) },
    ],
    workflow: ['Read contract', 'Load list endpoint', 'Run row action', 'Write audit event', 'Invalidate query'],
  };
}

function normalizeStatus(value: unknown): AdminStatus {
  if (value === 'active' || value === 'completed' || value === 'failed' || value === 'pending' || value === 'processing') return value;
  return 'active';
}

function readable(key: string): string {
  const last = key.split('.').at(-1) ?? key;
  return last
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
