import { AiDisclaimer } from '@tongqian/ui';

const rows = ['AGENT_QUAL', 'AGENT_TENDER', 'AGENT_FIN'];

export default function AgentOpportunitiesPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Opportunity scan</p><h1 className="text-2xl font-semibold">Intelligent steward opportunities</h1></section><section className="grid gap-4 md:grid-cols-3">{rows.map((row) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={row}>{row} · 5 sources · AI pitch</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
