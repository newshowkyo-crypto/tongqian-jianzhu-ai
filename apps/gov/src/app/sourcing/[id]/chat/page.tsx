import { AiDisclaimer } from '@tongqian/ui';

export default function SourcingChatPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Sanitized chat · platform witness</p><h1 className="text-2xl font-semibold">Sourcing chat</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="All messages remove company identity, contact, and exact sensitive project details before matching." /><AiDisclaimer variant="banner" /></main>;
}
