import { AiDisclaimer } from '@tongqian/ui';

import { enqueueOffline, queueStatus } from '@/lib/offline-queue';

const prompts = ['Beam height changed?', 'Door-window table matches drawing?', 'Quantity impact points'];
const status = queueStatus();
const draft = enqueueOffline({ payload: { prompt: prompts[0] }, type: 'drawing-query' });

export default function MobileDrawingQueryPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">Drawing quick query</h1>
      <div className="mt-3 text-xs">{status.online ? 'online' : 'offline'} · pending {status.pending} · draft {draft.id.slice(0, 6)}</div>
      <div className="mt-6 space-y-4">
        {prompts.map((prompt) => <button className="w-full rounded-lg border border-stitch-outline-variant p-4 text-left" key={prompt}>{prompt}</button>)}
      </div>
      <AiDisclaimer variant="footer" />
    </main>
  );
}
