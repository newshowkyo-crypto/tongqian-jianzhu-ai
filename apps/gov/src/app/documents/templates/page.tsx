import { AiDisclaimer } from '@tongqian/ui';

const templates = ['request', 'report', 'bulletin', 'reply', 'supervise', 'research', 'speech', 'minute', 'outline', 'summary', 'scheme', 'project_proposal', 'feasibility_study'];

export default function GovDocumentTemplatesPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Watermark · IP trace · China-hosted AI</p><h1 className="text-2xl font-semibold">Official document AI matrix</h1></section><section className="grid gap-4 md:grid-cols-4">{templates.map((item) => <article className="rounded-md border border-neutral-300 p-4 text-sm" key={item}>{item}</article>)}</section><AiDisclaimer variant="banner" /></main>;
}
