import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const alerts = ['cashflow_gap', 'qualification_expire', 'project_overrun', 'agent_score_drop', 'customer_churn'];

export default function PredictionsPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="Dashboard / Predictions" description="Future 1-4 week warnings and proactive suggestions." title="Predictive alerts" />
        <section className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => <SectionCard key={alert} title={alert}><p className="text-sm text-stitch-on-surface-variant">Confidence 72% · window 7d/14d/21d/30d.</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
