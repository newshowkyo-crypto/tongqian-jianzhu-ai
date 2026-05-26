import { AiDisclaimer, VoiceInputButton } from '@tongqian/ui';

import { dexieCompatibleStore, enqueueOffline, queueStatus } from '@/lib/offline-queue';

const items = ['Upload site photo', 'Detect work zone', 'Draft daily report', 'Submit for PM review'];
const status = queueStatus();
const draft = enqueueOffline({ payload: { store: dexieCompatibleStore }, type: 'photo-report' });

export default function MobilePhotoReportPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">Photo daily report</h1>
      <div className="mt-3 text-xs">{status.online ? 'online' : 'offline'} · pending {status.pending} · draft {draft.id.slice(0, 6)}</div>
      <VoiceInputButton className="mb-4" />
        <ol className="mt-6 space-y-4">
        {items.map((item, index) => <li className="rounded-lg border border-stitch-outline-variant p-4" key={item}>{index + 1}. {item}</li>)}
      </ol>
      <AiDisclaimer variant="footer" />
    </main>
  );
}
