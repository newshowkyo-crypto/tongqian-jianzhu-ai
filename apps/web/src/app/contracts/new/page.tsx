'use client';

import { apiClient } from '@tongqian/api-client';
import { Badge, Button, CyberHero, FileSearch, Input, Radio, Select, SectionCard, Shield, Spinner } from '@tongqian/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'step1' | 'step2' | 'step3';

export default function NewContractReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('step1');
  const [fileName, setFileName] = useState('示例施工合同.pdf');
  const [type, setType] = useState('施工总承包');
  const [counterparty, setCounterparty] = useState('武汉某建设单位');
  const [amount, setAmount] = useState('2860 万元');
  const [role, setRole] = useState('contractor');
  const [reviewLevel, setReviewLevel] = useState<'basic' | 'pro'>('pro');
  const [pending, setPending] = useState(false);

  async function submitReview() {
    if (pending) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, apiClient.mock ? 3000 : 30000));
    const reply = await apiClient.aiGateway.invoke({
      context: { amount, counterparty, role, type },
      taskType: reviewLevel === 'pro' ? 'contract.review.pro' : 'contract.review.basic',
      userInput: `请审查 ${fileName}，合同类型 ${type}，对方 ${counterparty}，金额 ${amount}，我方角色 ${role}。`,
    });
    const created = await apiClient.riskReview.create({ amount, counterparty, fileName, reviewLevel, role, type, traceId: reply.traceId });
    router.push(`/contracts/${created.reviewId ?? 'demo-yellow'}`);
  }

  return (
    <main className="space-y-6 p-6">
      <CyberHero>
        <p className="text-sm text-[var(--text-secondary)]">上传向导</p>
        <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">新建合同审查</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">三步确认文件、业务背景和扣点预览，提交后进入 AI 审查与风险详情。</p>
      </CyberHero>
      <div className="grid gap-4 md:grid-cols-3">
        {['step1', 'step2', 'step3'].map((item) => <Badge key={item} tone={step === item ? 'success' : 'neutral'}>{item}</Badge>)}
      </div>

      {step === 'step1' && (
        <SectionCard title="Step 1 文件">
          <label className="grid min-h-48 cursor-pointer place-items-center rounded-lg border border-dashed border-[var(--border-silver)] bg-[var(--bg-glass)] p-8 text-center">
            <FileSearch className="mb-3 h-10 w-10 text-[var(--accent-blue)]" />
            <span className="text-base font-semibold text-[var(--text-primary)]">{fileName}</span>
            <span className="mt-2 text-sm text-[var(--text-secondary)]">支持 .pdf / .docx，单文件不超过 50MB；mock 模式直接接受文件名。</span>
            <input className="sr-only" type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? fileName)} />
          </label>
          <Button className="mt-4" onClick={() => setStep('step2')}>下一步</Button>
        </SectionCard>
      )}

      {step === 'step2' && (
        <SectionCard title="Step 2 业务信息">
          <div className="grid gap-4 md:grid-cols-2">
            <Select aria-label="合同类型" onChange={(event) => setType(event.target.value)} options={[{ label: '施工总承包', value: '施工总承包' }, { label: '专业分包', value: '专业分包' }, { label: '材料采购', value: '材料采购' }]} value={type} />
            <Input aria-label="对方公司" onChange={(event) => setCounterparty(event.target.value)} value={counterparty} />
            <Input aria-label="项目金额" onChange={(event) => setAmount(event.target.value)} value={amount} />
            <Select aria-label="我的角色" onChange={(event) => setRole(event.target.value)} options={[{ label: '施工方', value: 'contractor' }, { label: '业主方', value: 'owner' }, { label: '分包方', value: 'subcontractor' }]} value={role} />
          </div>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm"><Radio checked={reviewLevel === 'basic'} name="reviewLevel" onChange={() => setReviewLevel('basic')} />基础 30 点</label>
            <label className="flex items-center gap-2 text-sm"><Radio checked={reviewLevel === 'pro'} name="reviewLevel" onChange={() => setReviewLevel('pro')} />专业 200 点</label>
          </div>
          <Button className="mt-4" onClick={() => setStep('step3')}>进入确认</Button>
        </SectionCard>
      )}

      {step === 'step3' && (
        <SectionCard title="Step 3 确认审查">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">扣点预览</p><strong>{reviewLevel === 'pro' ? 200 : 30} 点</strong></div>
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">余额预览</p><strong>8,220 点</strong></div>
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">预计耗时</p><strong>{apiClient.mock ? '3 秒' : '30 秒'}</strong></div>
          </div>
          <Button className="mt-4 bg-[var(--accent-rose)] text-[var(--text-primary)]" disabled={pending} onClick={submitReview}>
            {pending ? <><Spinner className="mr-2 h-4 w-4" />审查中</> : <><Shield className="mr-2 h-4 w-4" />立即审查</>}
          </Button>
        </SectionCard>
      )}
    </main>
  );
}
