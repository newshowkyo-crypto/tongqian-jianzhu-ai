import { AiDisclaimer } from '@tongqian/ui';

export default function MeetingsPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Shared office</p><h1 className="text-2xl font-semibold">Meeting OA</h1><p className="max-w-3xl text-sm text-neutral-600">Bosses and project teams share meeting minutes, decisions, and todo follow-up.</p></section>
      <section className="grid gap-4 md:grid-cols-4">{['Submit transcript', 'AI minute', 'Action items', 'Project archive'].map((label) => <article className="rounded-md border border-outline-variant p-4 text-sm" key={label}>{label}</article>)}</section>
      <AiDisclaimer variant="banner" customText="AI meeting records assist office follow-up and do not replace signed minutes or approval flows." />
    </main>
  );
}
