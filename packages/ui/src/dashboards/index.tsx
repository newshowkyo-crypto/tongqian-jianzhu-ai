import { PositionTag, type PositionTagValue } from '@tongqian/types';
import { type ReactNode } from 'react';

import { StatCard } from '../data-display/index.js';
import { PageContent, SectionCard } from '../layout/page.js';

export interface DashboardProps {
  actions?: ReactNode;
  items?: ReactNode;
  kpis?: Array<{ label: ReactNode; value: ReactNode }>;
  title?: ReactNode;
}

function DashboardShell({ actions, items, kpis = [], title }: DashboardProps): ReactNode {
  return <PageContent><div className="grid gap-3 md:grid-cols-4">{kpis.map((kpi, index) => <StatCard key={index} label={kpi.label} value={kpi.value} />)}</div><SectionCard actions={actions} title={title}>{items}</SectionCard></PageContent>;
}

export function OwnerDashboard(props: DashboardProps): ReactNode { return <DashboardShell title="OWNER" {...props} />; }
export function TenderWriterDashboard(props: DashboardProps): ReactNode { return <DashboardShell title="TENDER" {...props} />; }
export function PMDashboard(props: DashboardProps): ReactNode { return <DashboardShell title="PM" {...props} />; }
export function FinanceDashboard(props: DashboardProps): ReactNode { return <DashboardShell title="FINANCE" {...props} />; }
export function DocStaffDashboard(props: DashboardProps): ReactNode { return <DashboardShell title="DOC" {...props} />; }

export const defaultDashboardByPosition: Partial<Record<PositionTagValue, string>> = {
  [PositionTag.OWNER]: 'owner',
  [PositionTag.PROJECT_DOCUMENT_CONTROLLER]: 'doc',
  [PositionTag.PROJECT_MANAGER]: 'pm',
  [PositionTag.TENDER_WRITER]: 'tender',
  [PositionTag.FINANCE_DIRECTOR]: 'finance',
};
