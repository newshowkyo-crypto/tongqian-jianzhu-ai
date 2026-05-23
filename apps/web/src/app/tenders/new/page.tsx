'use client';

import { apiClient } from '@tongqian/api-client';
import { Badge, Button, CyberHero, FileSearch, Input, Radio, Select, SectionCard, Spinner } from '@tongqian/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'step1' | 'step2' | 'step3';

export default function NewTenderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('step1');
  const [fileName, setFileName] = useState('东湖高新区道路改造招标文件.pdf');
  const [projectType, setProjectType] = useState('市政道路');
  const [qualification, setQualification] = useState('市政公用工程二级');
  const [amount, setAmount] = useState('3200 万元');
  const [task, setTask] = useState<'framework' | 'summary'>('summary');
  const [pending, setPending] = useState(false);

  async function submitTender() {
    if (pending) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, apiClient.mock ? 3000 : 30000));
    const reply = await apiClient.aiGateway.invoke({
      context: { amount, projectType, qualification },
      taskType: task === 'summary' ? 'tender.summary' : 'tender.framework',
      userInput: `解析 ${fileName}，项目类型 ${projectType}，我方资质 ${qualification}，拟投金额 ${amount}。`,
    });
    const created = await apiClient.tender.create({ amount, fileName, projectType, qualification, task, traceId: reply.traceId });
    router.push(`/tenders/${created.tenderId ?? 'demo-active'}`);
  }

  return (
    <main className="space-y-6 p-6">
      <CyberHero>
        <p className="text-sm text-[var(--text-secondary)]">招标文件上传向导</p>
        <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">新建招标解析</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">三步确认文件、资质和扣点，提交后进入速读详情。</p>
      </CyberHero>
      <div className="grid gap-4 md:grid-cols-3">{['step1', 'step2', 'step3'].map((item) => <Badge key={item} tone={step === item ? 'success' : 'neutral'}>{item}</Badge>)}</div>

      {step === 'step1' && (
        <SectionCard title="Step 1 文件">
          <label className="grid min-h-48 cursor-pointer place-items-center rounded-lg border border-dashed border-[var(--border-silver)] bg-[var(--bg-glass)] p-8 text-center">
            <FileSearch className="mb-4 h-10 w-10 text-[var(--accent-blue)]" />
            <span className="text-base font-semibold text-[var(--text-primary)]">{fileName}</span>
            <span className="mt-2 text-sm text-[var(--text-secondary)]">支持 .pdf / .docx，单文件不超过 100MB。</span>
            <input className="sr-only" type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? fileName)} />
          </label>
          <Button className="mt-4" onClick={() => setStep('step2')}>下一步</Button>
        </SectionCard>
      )}

      {step === 'step2' && (
        <SectionCard title="Step 2 项目信息">
          <div className="grid gap-4 md:grid-cols-3">
            <Select aria-label="项目类型" onChange={(event) => setProjectType(event.target.value)} options={[{ label: '市政道路', value: '市政道路' }, { label: '学校维修', value: '学校维修' }, { label: '厂房建设', value: '厂房建设' }]} value={projectType} />
            <Select aria-label="我方资质" onChange={(event) => setQualification(event.target.value)} options={[{ label: '市政公用工程二级', value: '市政公用工程二级' }, { label: '建筑工程二级', value: '建筑工程二级' }, { label: '建筑工程一级', value: '建筑工程一级' }]} value={qualification} />
            <Input aria-label="拟投标金额" onChange={(event) => setAmount(event.target.value)} value={amount} />
          </div>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm"><Radio checked={task === 'summary'} name="task" onChange={() => setTask('summary')} />速读 50 点</label>
            <label className="flex items-center gap-2 text-sm"><Radio checked={task === 'framework'} name="task" onChange={() => setTask('framework')} />完整解析 500 点</label>
          </div>
          <Button className="mt-4" onClick={() => setStep('step3')}>进入确认</Button>
        </SectionCard>
      )}

      {step === 'step3' && (
        <SectionCard title="Step 3 确认解析">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">扣点预览</p><strong>{task === 'summary' ? 50 : 500} 点</strong></div>
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">预计耗时</p><strong>{apiClient.mock ? '3 秒' : '30 秒'}</strong></div>
            <div className="rounded-lg border border-[var(--border-silver)] p-4"><p className="text-sm text-[var(--text-secondary)]">输出</p><strong>10 项速读</strong></div>
          </div>
          <Button className="mt-4 bg-[var(--accent-rose)] text-[var(--text-primary)]" disabled={pending} onClick={submitTender}>{pending ? <><Spinner className="mr-2 h-4 w-4" />解析中</> : '立即解析'}</Button>
        </SectionCard>
      )}
    </main>
  );
}
