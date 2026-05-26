import { AiDisclaimer } from '@tongqian/ui';

const categories = ['qual_policy', 'bid_rules', 'financing_window', 'industry_news', 'best_practice'];

export default function AgentKnowledgePage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Knowledge feed</p><h1 className="text-2xl font-semibold">Business knowledge</h1></section><section className="grid gap-4 md:grid-cols-5">{categories.map((category) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={category}>{category}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
