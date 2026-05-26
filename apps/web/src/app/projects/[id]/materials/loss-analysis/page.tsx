import { AiDisclaimer } from '@tongqian/ui';

export default function MaterialLossAnalysisPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2">
        <p className="text-sm text-neutral-500">Tier 2 · confidence medium</p>
        <h1 className="text-2xl font-semibold">High-loss material analysis</h1>
        <p className="max-w-3xl text-sm text-neutral-600">Cement loss is above the 5% warning line. Check wet storage, double outbound registration, and subcontract usage confirmations first.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {['Check receiving slips', 'Ask site keeper', 'Compare subcontract usage', 'Create deduction memo', 'Request steward fallback'].map((label) => <button className="rounded-md border border-outline-variant p-4 text-left text-sm" key={label} type="button">{label}</button>)}
      </section>
      <AiDisclaimer variant="banner" customText="AI can flag likely loss causes, but final deductions require verified evidence and contract terms." />
    </main>
  );
}
