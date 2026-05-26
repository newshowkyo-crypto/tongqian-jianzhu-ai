import { AiDisclaimer } from '@tongqian/ui';

import { enqueueOffline, queueStatus } from '@/lib/offline-queue';

const fields = ['Hazard location', 'Risk level', 'Owner', 'Deadline'];
const status = queueStatus();
const draft = enqueueOffline({ payload: { fields }, type: 'hazard-report' });

export default function MobileHazardReportPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">Hazard report</h1>
      <div className="mt-3 text-xs">{status.online ? 'online' : 'offline'} · pending {status.pending} · draft {draft.id.slice(0, 6)}</div>
      <div className="mt-6 space-y-4">
        {fields.map((field) => <label className="block rounded-lg border border-stitch-outline-variant p-4 text-sm" key={field}>{field}<input className="mt-2 w-full bg-transparent outline-none" /></label>)}
      </div>
      <AiDisclaimer variant="footer" />
    </main>
  );
}
