import { AiDisclaimer } from '@tongqian/ui';

const dims = ['quality', 'schedule', 'safety', 'cooperation', 'settlement'];

export default function SubcontractEvaluationPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · confidence medium</p><h1 className="text-2xl font-semibold">Five-dimension evaluation</h1><p className="max-w-3xl text-sm text-neutral-600">Scores are averaged for risk warning and blacklist review.</p></section>
      <section className="grid gap-4 md:grid-cols-5">{dims.map((dim) => <label className="rounded-md border border-outline-variant p-4 text-sm" key={dim}>{dim}<input className="mt-3 w-full rounded-md border px-3 py-2" max="5" min="1" type="number" defaultValue="4" /></label>)}</section>
      <section className="rounded-md border border-outline-variant p-4 text-sm">AI warning: settlement score below 3 should trigger owner review before next progress payment.</section>
      <AiDisclaimer variant="banner" customText="AI evaluation summaries can miss site context. Keep signed evidence for every score." />
    </main>
  );
}
