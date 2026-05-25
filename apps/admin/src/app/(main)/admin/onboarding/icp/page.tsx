'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { zhCN } from '../../../../../i18n/zh-CN';

interface IcpState {
  aliyunAccountId?: string;
  companyName?: string;
  contactPhone?: string;
  legalRepIdLast4?: string;
  legalRepName?: string;
  materialsChecklist: Array<{ name: string; required: boolean; uploaded: boolean }>;
  recordNo?: string;
  status: string;
  websiteDomains: string[];
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function IcpOnboardingPage(): ReactNode {
  const copy = zhCN.icpOnboarding;
  const queryClient = useQueryClient();
  const query = useQuery({ queryFn: () => requestJson<IcpState>('/api/v1/admin/icp'), queryKey: ['admin', 'icp'] });
  const data = query.data;
  const [form, setForm] = useState({
    aliyunAccountId: '',
    companyName: '',
    contactPhone: '',
    legalRepIdLast4: '',
    legalRepName: '',
    recordNo: '',
    websiteDomains: '',
  });
  const save = useMutation({
    mutationFn: () =>
      requestJson('/api/v1/admin/icp', {
        body: JSON.stringify({ ...form, status: form.recordNo ? 'approved' : data?.status ?? 'not_started', websiteDomains: form.websiteDomains.split(',').map((item) => item.trim()).filter(Boolean) }),
        method: 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'icp'] }),
  });
  const upload = useMutation({
    mutationFn: (name: string) => requestJson(`/api/v1/admin/icp/materials/${encodeURIComponent(name)}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'icp'] }),
  });

  const uploaded = data?.materialsChecklist.filter((item) => item.uploaded).length ?? 0;
  const total = data?.materialsChecklist.length ?? 0;
  const progress = total ? Math.round((uploaded / total) * 100) : 0;

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{data?.recordNo ? `${copy.approvedPrefix}${data.recordNo}` : copy.pendingBanner}</p>
      </header>
      <form className="grid gap-4 rounded-md border border-[var(--border-silver)] bg-white/5 p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        {copy.fields.map((field) => (
          <label className="space-y-2 text-sm" key={field.key}>
            <span>{field.label}</span>
            <input className="w-full rounded-md border border-[var(--border-silver)] bg-black/20 px-4 py-3" onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} value={form[field.key as keyof typeof form]} />
          </label>
        ))}
        <button className="rounded-md bg-[var(--accent-gold)] px-4 py-3 text-black md:col-span-2" type="submit">{copy.save}</button>
      </form>
      <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{copy.checklist}</h2>
          <a className="text-sm text-[var(--accent-gold)]" href="https://beian.aliyun.com/" rel="noreferrer" target="_blank">{copy.aliyunLink}</a>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--accent-gold)]" style={{ width: `${progress}%` }} /></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(data?.materialsChecklist ?? []).map((item) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--border-silver)] p-4" key={item.name}>
              <span>{item.name}</span>
              <button className="rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm" onClick={() => upload.mutate(item.name)} type="button">{item.uploaded ? copy.uploaded : copy.upload}</button>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <h2 className="text-lg font-semibold">{copy.progress}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {copy.steps.map((step, index) => (
            <div className={`rounded-md border p-4 text-sm ${index * 25 <= progress ? 'border-emerald-300/60 bg-emerald-500/10' : 'border-[var(--border-silver)] bg-black/20'}`} key={step}>{step}</div>
          ))}
        </div>
      </section>
    </section>
  );
}
