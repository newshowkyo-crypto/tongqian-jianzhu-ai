import { AiDisclaimer } from '@tongqian/ui';

export default function RectificationDetailPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · confidence medium</p><h1 className="text-2xl font-semibold">Rectification order</h1><p className="max-w-3xl text-sm text-neutral-600">Status flow: open, rectifying, verifying, closed, rejected.</p></section>
      <section className="grid gap-4 md:grid-cols-5">{['open', 'rectifying', 'verifying', 'closed', 'rejected'].map((status) => <article className="rounded-md border border-outline-variant p-4 text-sm" key={status}>{status}</article>)}</section>
      <section className="rounded-md border border-outline-variant p-4 text-sm">AI suggests adding close-up photos, standardRef comparison, and verifier note before closure.</section>
      <AiDisclaimer variant="banner" customText="AI cannot replace onsite acceptance. Keep photo evidence and verifier signatures for every closure." />
    </main>
  );
}
