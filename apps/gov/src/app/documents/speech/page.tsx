import { AiDisclaimer } from '@tongqian/ui';

export default function GovSpeechPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">5 / 15 / 30 minute versions</p><h1 className="text-2xl font-semibold">Speech generator</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Meeting theme, audience, policy points, and required tone." /><AiDisclaimer variant="banner" /></main>;
}
