import { AiDisclaimer } from '@tongqian/ui';

import { enqueueOffline, queueStatus } from '@/lib/offline-queue';

const queries = ['Site fire rule', 'Concrete acceptance basis', 'Bill pricing scope'];
const status = queueStatus();
const draft = enqueueOffline({ payload: { query: queries[0] }, type: 'regulation' });

export default function MobileRegulationPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">Regulation quick query</h1>
      <div className="mt-3 text-xs">{status.online ? 'online' : 'offline'} · pending {status.pending} · draft {draft.id.slice(0, 6)}</div>
      <div className="mt-6 space-y-4">
        {queries.map((query) => <div className="rounded-lg border border-stitch-outline-variant p-4" key={query}>{query}</div>)}
      </div>
      <AiDisclaimer variant="footer" />
    </main>
  );
}
