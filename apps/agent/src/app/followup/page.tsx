import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const reminders = ['inquiry_no_order', 'free_quota', 'renewal', 'payment_failed', 'report_unread'];

export default function AgentFollowupPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="Agent / Follow-up" description="Automatic customer follow-up reminders and AI scripts." title="Follow-up reminders" />
        <section className="grid gap-4 md:grid-cols-2">
          {reminders.map((scenario) => (
            <SectionCard key={scenario} title={scenario}>
              <p className="text-sm text-stitch-on-surface-variant">Red dot reminder with one-click AI script.</p>
              <button className="mt-4 rounded-md bg-stitch-primary-container px-4 py-2 text-sm text-white">Generate script</button>
            </SectionCard>
          ))}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
