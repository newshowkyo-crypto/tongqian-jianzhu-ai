import { AiDisclaimer } from '@tongqian/ui';

export default function AgentFinToolPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">FIN tool · 200-1000 credits</p><h1 className="text-2xl font-semibold">Finance business tool</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Financing proposal or credit report interpretation input." /><AiDisclaimer variant="banner" /></main>;
}
