import { AiDisclaimer } from '@tongqian/ui';

export default function AgentCustomerBindingPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Permanent binding · BR-102</p><h1 className="text-2xl font-semibold">Customer binding ledger</h1></section><section className="grid gap-4 md:grid-cols-4">{['binding proof', 'commission ledger', 'health score', 'transfer audit'].map((item) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={item}>{item}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
