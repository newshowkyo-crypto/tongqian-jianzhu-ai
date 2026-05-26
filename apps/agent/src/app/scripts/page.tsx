import { AiDisclaimer } from '@tongqian/ui';

const categories = ['first_contact', 'objection_handling', 'negotiation', 'closing', 'reactivation'];

export default function AgentScriptsPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">AI scripts</p><h1 className="text-2xl font-semibold">Business scripts</h1></section><section className="grid gap-4 md:grid-cols-5">{categories.map((category) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={category}>{category}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
