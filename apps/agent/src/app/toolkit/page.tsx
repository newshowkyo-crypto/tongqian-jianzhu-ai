import { AiDisclaimer } from '@tongqian/ui';

const tools = ['qual-material-check', 'qual-performance-archive', 'qual-personnel-gap', 'tender-qualify-match', 'tender-proposal-draft', 'tender-qa-response', 'financing-proposal', 'credit-report', 'quick-reply'];

export default function AgentToolkitPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Nine real business tools</p><h1 className="text-2xl font-semibold">AI toolkit</h1></section><section className="grid gap-4 md:grid-cols-3">{tools.map((tool) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={tool}>{tool}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
