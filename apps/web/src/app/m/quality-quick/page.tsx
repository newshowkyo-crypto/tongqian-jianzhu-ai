import { AiDisclaimer } from '@tongqian/ui';

export default function MobileQualityQuickPage(): JSX.Element {
  return (
    <main className="space-y-6 p-4">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Mobile quick check</p><h1 className="text-2xl font-semibold">Quality quick capture</h1><p className="text-sm text-neutral-600">Reuses the M37 photo-report capture pattern for quality evidence and rectification creation.</p></section>
      <textarea className="h-36 w-full rounded-md border border-outline-variant p-4 text-sm" defaultValue="Location, finding, standardRef, responsible person." />
      <section className="grid gap-4">{['Add photos', 'Create rectification', 'Submit verify'].map((label) => <button className="rounded-md border border-outline-variant p-4 text-left text-sm" key={label} type="button">{label}</button>)}</section>
      <AiDisclaimer variant="banner" customText="AI quick capture helps structure evidence. Final quality acceptance remains a verified project action." />
    </main>
  );
}
