import { AiDisclaimer } from '@tongqian/ui';

const chapters = ['overview', 'necessity', 'market', 'construction', 'technology', 'site', 'organization', 'investment', 'funding', 'benefit', 'risk', 'conclusion'];

export default function FeasibilityStudyPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · 1500 credits</p><h1 className="text-2xl font-semibold">Feasibility study</h1></section><section className="grid gap-4 md:grid-cols-4">{chapters.map((item) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={item}>{item}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
