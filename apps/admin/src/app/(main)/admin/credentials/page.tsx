'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';

import { zhCN } from '../../../../i18n/zh-CN';

type CredentialGroup = 'ai' | 'collector' | 'notification' | 'payment' | 'storage';
type CredentialMode = 'mock' | 'real';

interface CredentialRow {
  audit: Array<{ action: string; at: string; reason?: string }>;
  group: CredentialGroup;
  healthCheck: { lastTestAt?: string; latencyMs?: number; ok: boolean; reason?: string };
  key: string;
  lastSwitchAt?: string;
  mode: CredentialMode;
  provider: string;
}

const groupOrder: CredentialGroup[] = ['payment', 'notification', 'storage', 'ai', 'collector'];

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function CredentialsPage(): ReactNode {
  const copy = zhCN.credentialsPage;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ key: string; reason: string; value: string }>();
  const [group, setGroup] = useState<CredentialGroup | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState<string>();

  const credentialsQuery = useQuery({
    queryFn: () => requestJson<CredentialRow[]>('/api/v1/admin/credentials'),
    queryKey: ['admin', 'credentials'],
    staleTime: 15_000,
  });

  const saveCredential = useMutation({
    mutationFn: (input: { key: string; reason: string; value: string }) =>
      requestJson(`/api/v1/admin/credentials/${input.key}`, { body: JSON.stringify(input), method: 'POST' }),
    onSuccess: async () => {
      setNotice(copy.messages.saved);
      setDraft(undefined);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'credentials'] });
    },
  });

  const testCredential = useMutation({
    mutationFn: (key: string) => requestJson<{ latencyMs: number; ok: boolean; reason?: string }>(`/api/v1/admin/credentials/${key}/test`, { method: 'POST' }),
    onSuccess: async (result) => {
      setNotice(result.ok ? `${copy.messages.connected} ${result.latencyMs}ms` : `${copy.messages.failed}${result.reason ?? copy.messages.unknown}`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'credentials'] });
    },
  });

  const switchMode = useMutation({
    mutationFn: (input: { key: string; to: CredentialMode }) =>
      requestJson(`/api/v1/admin/credentials/${input.key}/switch`, { body: JSON.stringify({ to: input.to }), method: 'POST' }),
    onSuccess: async () => {
      setNotice(copy.messages.switched);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'credentials'] });
    },
  });

  const rows = credentialsQuery.data ?? [];
  const filteredRows = rows.filter((row) => (group === 'all' || row.group === group) && row.key.toLowerCase().includes(keyword.toLowerCase()));
  const p0Real = rows.filter((row) => row.mode === 'real' && ['ai', 'notification', 'payment'].includes(row.group)).length;
  const groupCards = useMemo(
    () =>
      groupOrder.map((item) => {
        const groupRows = rows.filter((row) => row.group === item);
        const realRows = groupRows.filter((row) => row.mode === 'real').length;
        return { count: groupRows.length, group: item, isReady: groupRows.length > 0 && realRows / groupRows.length >= 0.8, realRows };
      }),
    [rows],
  );

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">{copy.description}</p>
      </header>
      {notice ? <div className="rounded-md border border-emerald-300/50 bg-emerald-500/10 p-4 text-sm">{notice}</div> : null}
      <div className="grid gap-4 md:grid-cols-5">
        {groupCards.map((card) => (
          <button className={`rounded-md border p-4 text-left ${card.isReady ? 'border-emerald-300/70 bg-emerald-500/15' : 'border-[var(--border-silver)] bg-white/5'}`} key={card.group} onClick={() => setGroup(card.group)} type="button">
            <div className="text-xs text-[var(--text-secondary)]">{copy.groups[card.group]}</div>
            <div className="mt-2 text-xl font-semibold">{card.realRows}/{card.count}</div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{card.isReady ? copy.groupReady : copy.groupPending}</p>
          </button>
        ))}
      </div>
      <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">{copy.progressLabel}</div>
            <div className="mt-1 text-xl font-semibold">{copy.p0Label} {p0Real}/8</div>
          </div>
          <input className="rounded-md border border-[var(--border-silver)] bg-black/20 px-4 py-2 text-sm" onChange={(event) => setKeyword(event.target.value)} placeholder={copy.searchPlaceholder} value={keyword} />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border-silver)] bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-left">
            <tr>
              <th className="p-4">{copy.table.key}</th>
              <th>{copy.table.provider}</th>
              <th>{copy.table.mode}</th>
              <th>{copy.table.health}</th>
              <th>{copy.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr className="border-t border-[var(--border-silver)]" key={row.key}>
                <td className="p-4 font-mono">{row.key}</td>
                <td>{row.provider}</td>
                <td>{row.mode === 'real' ? copy.form.real : copy.form.mock}</td>
                <td>{row.healthCheck.ok ? `${copy.messages.connected} ${row.healthCheck.latencyMs ?? 0}ms` : row.healthCheck.reason ?? copy.messages.notTested}</td>
                <td className="flex flex-wrap gap-2 py-3">
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-2" onClick={() => setDraft({ key: row.key, reason: '', value: '' })} type="button">{copy.actions.edit}</button>
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-2" onClick={() => testCredential.mutate(row.key)} type="button">{copy.actions.test}</button>
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-2" onClick={() => switchMode.mutate({ key: row.key, to: 'real' })} type="button">{copy.actions.real}</button>
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-2" onClick={() => switchMode.mutate({ key: row.key, to: 'mock' })} type="button">{copy.actions.mock}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {draft ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-6">
          <form className="w-full max-w-xl space-y-4 rounded-md border border-[var(--border-silver)] bg-[var(--panel-elevated)] p-6" onSubmit={(event) => { event.preventDefault(); saveCredential.mutate(draft); }}>
            <h2 className="text-lg font-semibold">{copy.form.title}</h2>
            <p className="font-mono text-sm text-[var(--text-secondary)]">{draft.key}</p>
            <textarea className="min-h-28 w-full rounded-md border border-[var(--border-silver)] bg-black/20 p-4" onChange={(event) => setDraft({ ...draft, value: event.target.value })} placeholder={copy.form.value} value={draft.value} />
            <input className="w-full rounded-md border border-[var(--border-silver)] bg-black/20 px-4 py-3" onChange={(event) => setDraft({ ...draft, reason: event.target.value })} placeholder={copy.form.reason} value={draft.reason} />
            <div className="flex justify-end gap-4">
              <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => setDraft(undefined)} type="button">{copy.actions.cancel}</button>
              <button className="rounded-md bg-[var(--accent-gold)] px-4 py-2 text-black" type="submit">{copy.form.submit}</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
