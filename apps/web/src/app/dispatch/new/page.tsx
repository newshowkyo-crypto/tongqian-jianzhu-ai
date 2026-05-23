'use client';

import { apiClient } from '@tongqian/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewDispatchPage() {
  const router = useRouter();
  const [step, setStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [form, setForm] = useState({ type: '资质代办', detail: '', expectedDate: '2026-06-05', mode: '公开池', budget: '5000' });
  async function submit() {
    const reply = await apiClient.dispatch.create(form);
    router.push(`/dispatch/${reply.dispatchId}`);
  }
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">发起派单</h1>
      <div className="rounded-lg border p-6">
        {step === 'step1' ? (
          <section className="space-y-4">
            <h2 className="font-semibold">Step 1 选择服务类型</h2>
            <select className="min-h-11 w-full rounded-md border p-2" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{['资质代办', '标书代写', '应收催收', '政府关系', '其他'].map((item) => <option key={item}>{item}</option>)}</select>
            <button className="rounded-md bg-navy-deepest px-4 py-2 text-white" onClick={() => setStep('step2')} type="button">下一步</button>
          </section>
        ) : null}
        {step === 'step2' ? (
          <section className="space-y-4">
            <h2 className="font-semibold">Step 2 填写需求与材料</h2>
            <textarea className="min-h-32 w-full rounded-md border p-4" onChange={(event) => setForm({ ...form, detail: event.target.value })} placeholder="详细需求 textarea" value={form.detail} />
            <input className="min-h-11 rounded-md border p-2" onChange={(event) => setForm({ ...form, expectedDate: event.target.value })} type="date" value={form.expectedDate} />
            <input className="block" type="file" />
            <button className="rounded-md bg-navy-deepest px-4 py-2 text-white" onClick={() => setStep('step3')} type="button">下一步</button>
          </section>
        ) : null}
        {step === 'step3' ? (
          <section className="space-y-4">
            <h2 className="font-semibold">Step 3 派单方式与预算</h2>
            {['公开池', '指定智能管家', '跨域池'].map((mode) => <label className="mr-4" key={mode}><input checked={form.mode === mode} onChange={() => setForm({ ...form, mode })} type="radio" /> {mode}</label>)}
            <input className="min-h-11 rounded-md border p-2" onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="预算上限" value={form.budget} />
            <button className="rounded-md bg-rose-main px-4 py-2 font-semibold text-navy-deepest" onClick={() => void submit()} type="button">提交派单</button>
          </section>
        ) : null}
      </div>
    </main>
  );
}
