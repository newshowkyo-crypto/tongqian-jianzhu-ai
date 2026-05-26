import { AiDisclaimer } from '@tongqian/ui';

const notes = ['call', 'wechat', 'meeting', 'other'];

export default function AgentCustomerTimelinePage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Customer timeline</p><h1 className="text-2xl font-semibold">Follow-up notes</h1></section><section className="grid gap-4 md:grid-cols-4">{notes.map((note) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={note}>{note}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
