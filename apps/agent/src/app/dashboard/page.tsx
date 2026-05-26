import { AiDisclaimer } from '@tongqian/ui';

const stats = ['deal pipeline', 'bound customers', 'renewal risk', 'commission ledger', 'toolkit'];

export default function Page(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Intelligent steward</p><h1 className="text-2xl font-semibold">Business cockpit</h1></section><section className="grid gap-4 md:grid-cols-5">{stats.map((item) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={item}>{item}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
