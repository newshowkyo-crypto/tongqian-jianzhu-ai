import { AiDisclaimer } from '@tongqian/ui';

const filters = ['central', 'provincial', 'city', 'county', 'infrastructure', 'debt_relief', 'special_bond', 'state_owned'];

export default function PolicyLearningPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">China-hosted AI · 24h update</p><h1 className="text-2xl font-semibold">Policy learning</h1></section><section className="grid gap-4 md:grid-cols-4">{filters.map((item) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={item} type="button">{item}</button>)}</section><AiDisclaimer variant="banner" /></main>;
}
