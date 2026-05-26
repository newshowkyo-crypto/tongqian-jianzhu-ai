import { AiDisclaimer } from '@tongqian/ui';

export default function AgentOpportunityDetailPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · confidence medium</p><h1 className="text-2xl font-semibold">Opportunity detail</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="AI pitch, evidence, customer need, next action, and status transition." /><section className="grid gap-4 md:grid-cols-5">{['new', 'viewed', 'contacted', 'won', 'lost'].map((item) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={item} type="button">{item}</button>)}</section><AiDisclaimer variant="banner" /></main>;
}
