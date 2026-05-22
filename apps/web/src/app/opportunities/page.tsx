'use client';

import { apiClient } from '@tongqian/api-client';
import { Badge, Button, CyberDataGrid, EmptyState, PageContent, PageLayout, Radar, SectionCard, Spinner } from '@tongqian/ui';
import { useMemo, useState } from 'react';

type Opportunity = {
  amount: string;
  deadline: string;
  district: string;
  id: string;
  match: number;
  specialty: string;
  status: string;
  title: string;
};

const rows: Opportunity[] = [
  { amount: '¥3,200万', deadline: '今日 17:00', district: '武汉', id: 'OP-2026-001', match: 92, specialty: '市政道路', status: '可投', title: '东湖高新区道路改造施工总包' },
  { amount: '¥860万', deadline: '明日 10:30', district: '黄陂', id: 'OP-2026-002', match: 87, specialty: '学校维修', status: '需复核', title: '中小学暑期维修项目' },
  { amount: '¥5,100万', deadline: '3 天后', district: '鄂州', id: 'OP-2026-003', match: 84, specialty: '园区厂房', status: '建议联合体', title: '临空经济区标准厂房二期' },
  { amount: '¥1,480万', deadline: '5 天后', district: '孝感', id: 'OP-2026-004', match: 79, specialty: '水电安装', status: '待补证据', title: '产业园机电安装工程' },
  { amount: '¥2,260万', deadline: '本周五', district: '咸宁', id: 'OP-2026-005', match: 81, specialty: '房建总包', status: '可投', title: '社区服务中心建设项目' },
];

const filterOptions = {
  amount: ['全部金额', '1000万以下', '1000万-3000万', '3000万以上'],
  deadline: ['全部截止', '今日截止', '3天内', '本周内'],
  district: ['全部地区', '武汉', '黄陂', '鄂州', '孝感', '咸宁'],
  specialty: ['全部业务线', '市政道路', '学校维修', '园区厂房', '水电安装', '房建总包'],
} as const;

const aiActions = ['生成投标优先级清单', '复核废标风险', '给老板 3 分钟摘要'] as const;

export default function OpportunitiesPage() {
  const [filters, setFilters] = useState({ amount: '全部金额', deadline: '全部截止', district: '全部地区', specialty: '全部业务线' });
  const [selected, setSelected] = useState<Opportunity | null>(rows[0] ?? null);
  const [running, setRunning] = useState<string | null>(null);
  const [reply, setReply] = useState<{ text: string; traceId?: string } | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => (filters.district === '全部地区' || row.district === filters.district) && (filters.specialty === '全部业务线' || row.specialty === filters.specialty)),
    [filters],
  );

  async function runAi(label: string) {
    if (running) return;
    setRunning(label);
    setReply(null);
    try {
      const result = await apiClient.aiGateway.invoke({
        context: { filters, selected, visibleRows },
        taskType: 'contract.review.basic',
        userInput: `请基于机会雷达当前列表，${label}，输出可执行步骤和风险提示。`,
      });
      setReply({ text: result.summary ?? result.text ?? result.message?.content ?? 'AI 已生成建议。', traceId: result.traceId });
    } finally {
      setRunning(null);
    }
  }

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">Stitch 机会雷达</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">商机雷达</h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">把地区、业务线、金额和截止日期统一压缩成可投优先级，先看高匹配，再看废标风险。</p>
              </div>
            </div>
            <Button className="bg-[var(--accent-rose)] text-[var(--text-primary)] hover:bg-rose-deep">订阅机会偏好</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['今日新增', '18', '+12%'],
            ['高匹配', '9', '80分以上'],
            ['可投机会', '6', '证据完整'],
            ['本周中标率', '23%', '+4.8%'],
          ].map(([label, value, trend]) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
              <p className="mt-2 text-xs text-success-700">{trend}</p>
            </article>
          ))}
        </section>

        <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="筛选条件">
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <label key={key} className="space-y-2 text-sm text-[var(--text-secondary)]">
                <span>{key === 'district' ? '地区' : key === 'specialty' ? '业务线' : key === 'amount' ? '金额' : '截止日期'}</span>
                <select
                  className="h-10 w-full rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm text-[var(--text-primary)]"
                  onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                  value={filters[key as keyof typeof filters]}
                >
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="机会列表">
            {visibleRows.length === 0 ? <EmptyState description="换一个地区或业务线再试。" title="暂无匹配机会" /> : null}
            <CyberDataGrid
              columns={[
                { key: 'title', header: '项目' },
                { key: 'district', header: '地区' },
                { key: 'specialty', header: '业务线' },
                { key: 'amount', header: '金额' },
                { key: 'deadline', header: '截止' },
                { key: 'match', header: '匹配' },
              ]}
              data={visibleRows.map((row) => ({
                amount: row.amount,
                deadline: row.deadline,
                district: row.district,
                id: row.id,
                match: `${row.match}分`,
                specialty: row.specialty,
                status: row.status,
                title: <button className="text-left font-semibold text-[var(--primary)]" onClick={() => setSelected(row)} type="button">{row.title}</button>,
              }))}
              getRowKey={(row) => String(row.id)}
            />
          </SectionCard>

          <aside className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-[var(--surface-container-low)] text-[var(--primary)]"><Radar className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">{selected.id}</p>
                    <h2 className="mt-1 text-lg font-semibold leading-7 text-[var(--text-primary)]">{selected.title}</h2>
                  </div>
                </div>
                <div className="grid gap-4 text-sm">
                  <p><span className="text-[var(--text-secondary)]">金额：</span><strong>{selected.amount}</strong></p>
                  <p><span className="text-[var(--text-secondary)]">状态：</span><strong>{selected.status}</strong></p>
                  <p><span className="text-[var(--text-secondary)]">匹配：</span><strong>{selected.match} 分</strong></p>
                </div>
                <div className="grid gap-4">
                  {aiActions.map((label, index) => (
                    <Button key={label} data-testid={index === 0 ? 'm13-ai-primary' : undefined} disabled={!!running} onClick={() => runAi(label)} variant={label === aiActions[0] ? 'primary' : 'outline'}>
                      {running === label ? <><Spinner className="mr-2" />DeepSeek 生成中</> : label}
                    </Button>
                  ))}
                </div>
                {reply ? (
                  <article className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-sm leading-6 text-[var(--text-primary)]">
                    <p className="mb-2 text-xs text-[var(--text-secondary)]">traceId: {reply.traceId ?? 'mock'}</p>
                    {reply.text}
                  </article>
                ) : null}
              </div>
            ) : null}
          </aside>
        </section>
      </PageContent>
    </PageLayout>
  );
}
