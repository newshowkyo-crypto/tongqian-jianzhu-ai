'use client';

import { apiClient, type Receivable } from '@tongqian/api-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ReceivablesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Receivable[]>([]);
  const [selected, setSelected] = useState<Receivable>();
  useEffect(() => { void apiClient.cashflow.receivables().then(setRows); }, []);
  async function generateReminder(receivableId: string) {
    const reply = await apiClient.cashflow.generateReminder(receivableId, 'formal');
    router.push(`/cashflow/reminders/${reply.reminderId}`);
  }
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">应收账款台账</h1>
      <section className="overflow-hidden rounded-lg border">{rows.map((row) => <button className="grid w-full gap-3 border-b p-4 text-left md:grid-cols-6" key={row.id} onClick={() => setSelected(row)} type="button"><span>{row.client}</span><span>{row.project}</span><span>{row.amount}</span><span>{row.aging} 天</span><span>{row.riskLevel}</span><select onClick={(event) => event.stopPropagation()}><option>发起催收</option><option>转法务</option><option>标记坏账</option><option>转同乾方略咨询</option></select></button>)}</section>
      {selected ? <aside className="rounded-lg border p-4"><h2 className="font-semibold">{selected.client}</h2><p>{selected.project} · {selected.amount}</p><button className="mt-3 rounded-md bg-rose-main px-4 py-2 text-navy-deepest" onClick={() => void generateReminder(selected.id)} type="button">生成催款函</button></aside> : null}
    </main>
  );
}
