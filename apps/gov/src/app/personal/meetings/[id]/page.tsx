'use client';

import { AiDisclaimer, VoiceInputButton } from '@tongqian/ui';

export default function PersonalMeetingDetailPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Tier 1 · confidence medium</p><h1 className="text-2xl font-semibold">Meeting transcript</h1><p className="max-w-3xl text-sm text-neutral-600">Use voice input for rough capture, then generate minutes and todos.</p></section>
      <VoiceInputButton />
      <textarea className="h-48 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Discuss payment progress, material loss, and next quality check." />
      <section className="grid gap-4 md:grid-cols-3">{['Generate minute', 'Create todos', 'Send to owner'].map((label) => <button className="rounded-md border border-neutral-300 p-4 text-left text-sm" key={label} type="button">{label}</button>)}</section>
      <AiDisclaimer variant="banner" customText="AI generated action items should be checked against the original transcript and meeting owner intent." />
    </main>
  );
}
