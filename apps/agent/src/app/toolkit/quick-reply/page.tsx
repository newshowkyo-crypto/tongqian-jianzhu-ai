import { AiDisclaimer } from '@tongqian/ui';

const tones = ['professional', 'friendly', 'urgent'];

export default function AgentQuickReplyPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Most frequent tool · 50 credits</p><h1 className="text-2xl font-semibold">Customer quick reply</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Paste customer question from chat or phone note." /><section className="grid gap-4 md:grid-cols-3">{tones.map((tone) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={tone} type="button">{tone}</button>)}</section><AiDisclaimer variant="banner" /></main>;
}
