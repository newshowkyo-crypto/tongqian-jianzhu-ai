'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { zhCN } from '../../../../../i18n/zh-CN';

interface RuleCandidate {
  confidence: number;
  id: string;
  riskLevel: string;
  sourceUrl: string;
  timelinessScore: number;
  title: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function RuleCandidatesPage(): ReactNode {
  const copy = zhCN.ruleCandidates;
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const query = useQuery({
    queryFn: () => requestJson<{ data: { items: RuleCandidate[] } }>('/api/v1/admin/rule-candidates?status=pending&sortBy=timeliness_score'),
    queryKey: ['admin', 'rule-candidates'],
  });
  const batch = useMutation({
    mutationFn: (action: 'approve' | 'reject') => requestJson('/api/v1/admin/rule-candidates/batch', { body: JSON.stringify({ action, ids: selected.slice(0, 50), reason: copy.batchReason }), method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'rule-candidates'] }),
  });
  const items = query.data?.data.items ?? [];

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{copy.description}</p>
      </header>
      <div className="flex flex-wrap gap-4">
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => batch.mutate('approve')} type="button">{copy.batchApprove}</button>
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => batch.mutate('reject')} type="button">{copy.batchReject}</button>
        <span className="text-sm text-[var(--text-secondary)]">{copy.batchLimit}</span>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border-silver)] bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-left">
            <tr>{copy.columns.map((column) => <th className="p-4" key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-t border-[var(--border-silver)]" key={item.id}>
                <td className="p-4"><input checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id].slice(0, 50) : selected.filter((id) => id !== item.id))} type="checkbox" /></td>
                <td><Link className="text-[var(--accent-gold)]" href={`/admin/rules/candidates/${item.id}`}>{item.title}</Link></td>
                <td><a href={item.sourceUrl} rel="noreferrer" target="_blank">{copy.source}</a></td>
                <td>{item.riskLevel}</td>
                <td>{Math.round(item.confidence * 100)}%</td>
                <td>{item.timelinessScore}</td>
                <td><Link className="rounded-md border border-[var(--border-silver)] px-3 py-2" href={`/admin/rules/candidates/${item.id}`}>{copy.review}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
