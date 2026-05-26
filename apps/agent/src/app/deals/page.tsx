import { AiDisclaimer } from '@tongqian/ui';

const stages = ['lead', 'contacted', 'quoting', 'negotiating', 'won', 'lost'];

export default function AgentDealsPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Deal pipeline</p><h1 className="text-2xl font-semibold">Six-stage pipeline</h1></section><section className="grid gap-4 md:grid-cols-6">{stages.map((stage) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={stage}>{stage}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
