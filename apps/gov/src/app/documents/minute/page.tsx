import { AiDisclaimer } from '@tongqian/ui';

export default function GovMinutePage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">ASR · structured minute</p><h1 className="text-2xl font-semibold">Meeting minute extractor</h1></section><textarea className="h-40 w-full rounded-md border border-neutral-300 p-4 text-sm" defaultValue="Upload audio or paste transcript for topics, decisions, actions, and attendees." /><AiDisclaimer variant="banner" /></main>;
}
