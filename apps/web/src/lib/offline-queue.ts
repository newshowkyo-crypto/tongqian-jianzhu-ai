export type OfflineQueueItem = {
  createdAt: string;
  id: string;
  payload: Record<string, unknown>;
  type: 'drawing-query' | 'hazard-report' | 'photo-report' | 'regulation';
};

const memoryQueue: OfflineQueueItem[] = [];

export function enqueueOffline(item: Omit<OfflineQueueItem, 'createdAt' | 'id'>): OfflineQueueItem {
  const record = { ...item, createdAt: new Date().toISOString(), id: crypto.randomUUID() };
  memoryQueue.push(record);
  return record;
}

export function queueStatus(): { online: boolean; pending: number } {
  return { online: typeof navigator === 'undefined' ? true : navigator.onLine, pending: memoryQueue.length };
}

export async function flushOfflineQueue(): Promise<{ flushed: number }> {
  const flushed = memoryQueue.length;
  memoryQueue.splice(0, memoryQueue.length);
  return { flushed };
}

export const dexieCompatibleStore = 'pm-offline-queue';
