import { AiDisclaimer } from '@tongqian/ui';

export default function PersonalMeetingsPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Personal office</p><h1 className="text-2xl font-semibold">Meetings</h1><p className="max-w-3xl text-sm text-neutral-600">Collect transcripts, generate minutes, and turn action items into personal todos.</p></section>
      <section className="grid gap-4 md:grid-cols-3">{['New transcript', 'Pending minute', 'My follow-up'].map((label) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={label}>{label}</article>)}</section>
      <AiDisclaimer variant="banner" customText="AI minutes need attendee confirmation before they become official company records." />
    </main>
  );
}
