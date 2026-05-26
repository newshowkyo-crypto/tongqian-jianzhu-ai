import { AiDisclaimer } from '@tongqian/ui';

const cards = ['GMV', 'managed customers', 'commission status', 'renewal calendar', 'knowledge new'];

export default function AgentCockpitPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Business cockpit</p><h1 className="text-2xl font-semibold">Intelligent steward cockpit</h1></section><section className="grid gap-4 md:grid-cols-5">{cards.map((card) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={card}>{card}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
