import { AiDisclaimer } from '@tongqian/ui';

export default function ProjectProposalPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · 800 credits</p><h1 className="text-2xl font-semibold">Project proposal</h1></section><section className="grid gap-4 md:grid-cols-5">{['background', 'necessity', 'content', 'investment', 'benefit'].map((item) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={item}>{item}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
