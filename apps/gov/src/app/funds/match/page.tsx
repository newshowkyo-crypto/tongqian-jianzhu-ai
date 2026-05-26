import { AiDisclaimer } from '@tongqian/ui';

export default function PolicyFundMatchPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · confidence medium · China-hosted model</p><h1 className="text-2xl font-semibold">Policy fund match engine</h1><p className="max-w-3xl text-sm text-neutral-600">Enter sanitized project features and receive match score, success probability, and application path.</p></section>
      <textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Infrastructure renewal project, confirmed land, capital gap, local matching funds." />
      <section className="grid gap-4 md:grid-cols-3">{['Execute internally', 'Ask Tongqian Strategy', 'Consult expert hour'].map((label) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={label} type="button">{label}</button>)}</section>
      <AiDisclaimer variant="banner" customText="AI suggestions do not guarantee fund approval. Keep source policy documents and submission evidence." />
    </main>
  );
}
