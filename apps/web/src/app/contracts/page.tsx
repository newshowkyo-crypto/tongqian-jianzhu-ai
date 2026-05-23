'use client';

import { apiClient, type RiskReviewListItem } from '@tongqian/api-client';
import { AlertTriangle, Badge, Button, CyberDataGrid, CyberHero, CyberKpi, FileSearch, Input, Select, SectionCard } from '@tongqian/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useMemo, useState } from 'react';

const fallbackRows: RiskReviewListItem[] = [
  { amount: '2860 万元', counterparty: '武汉某建设单位', createdAt: '2026-05-21', id: 'demo-yellow', riskLevel: 'yellow', status: 'completed', title: '学校改造施工合同' },
  { amount: '5100 万元', counterparty: '鄂州临空园区', createdAt: '2026-05-20', id: 'demo-red', riskLevel: 'red', status: 'completed', title: '厂房二期总承包合同' },
  { amount: '860 万元', counterparty: '黄陂区教育局', createdAt: '2026-05-18', id: 'demo-green', riskLevel: 'green', status: 'completed', title: '暑期维修合同' },
  { amount: '1800 万元', counterparty: '湖北某投资公司', createdAt: '2026-05-17', id: 'demo-bridge', riskLevel: 'yellow', status: 'reviewing', title: '市政桥梁专业分包' },
  { amount: '320 万元', counterparty: '武汉某材料商', createdAt: '2026-05-15', id: 'demo-supply', riskLevel: 'green', status: 'queued', title: '钢材采购框架协议' },
];

export default function ContractsPage() {
  const router = useRouter();
  const [riskLevel, setRiskLevel] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [range, setRange] = useState('30d');
  const [sourceRows, setSourceRows] = useState(fallbackRows);
  const rows = useMemo(() => sourceRows.filter((row) => (riskLevel === 'all' || row.riskLevel === riskLevel) && row.counterparty.includes(keyword)), [sourceRows, riskLevel, keyword]);
  async function refreshRows() {
    setSourceRows(await apiClient.riskReview.list({ keyword, range, riskLevel }));
  }

  return (
    <main className="space-y-6 p-6">
      <CyberHero className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">合同审查闭环</p>
          <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">从上传到风险卡片的一站式审查</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">先把付款、违约、变更和管辖风险看清楚，再决定自己修改、人工复核或交给同乾方略处理。</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent-rose)] px-4 text-sm font-medium text-[var(--text-primary)]" href="/contracts/new">
          <FileSearch className="mr-2 h-4 w-4" />上传新合同
        </Link>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        <CyberKpi label="本月审查" value="28" trend="+9" />
        <CyberKpi label="红灯合同" value="4" trend="需复核" />
        <CyberKpi label="平均节省时间" value="3.6h" trend="每份" />
        <CyberKpi label="处理中" value="6" trend="AI 队列" />
      </section>

      <SectionCard title="筛选与列表">
        <div className="mb-4 grid gap-4 md:grid-cols-[160px_160px_1fr_auto]">
          <Select aria-label="风险等级" onChange={(event) => setRiskLevel(event.target.value)} options={[{ label: '全部风险', value: 'all' }, { label: '红灯', value: 'red' }, { label: '黄灯', value: 'yellow' }, { label: '绿灯', value: 'green' }]} value={riskLevel} />
          <Select aria-label="时间范围" onChange={(event) => setRange(event.target.value)} options={[{ label: '近 7 天', value: '7d' }, { label: '近 30 天', value: '30d' }, { label: '近 90 天', value: '90d' }]} value={range} />
          <Input aria-label="对方关键词" onChange={(event) => setKeyword(event.target.value)} placeholder="搜索对方公司" value={keyword} />
          <Button onClick={refreshRows}>刷新</Button>
        </div>
        <CyberDataGrid
          columns={[
            { header: '合同', key: 'title' },
            { header: '对方', key: 'counterparty' },
            { header: '金额', key: 'amount' },
            { cell: (row) => <Badge tone={row.riskLevel === 'red' ? 'danger' : row.riskLevel === 'yellow' ? 'warning' : 'success'}>{String(row.riskLevel)}</Badge>, header: '风险', key: 'riskLevel' },
            { header: '状态', key: 'status' },
            { cell: (row) => <RowActions id={String(row.id)} />, header: '操作', key: 'id' },
          ]}
          data={rows as unknown as Array<Record<string, ReactNode>>}
          getRowKey={(row) => String(row.id)}
        />
        <div className="mt-4 rounded-lg border border-warning-100 bg-warning-50 p-4 text-sm text-warning-700">
          <AlertTriangle className="mr-2 inline h-4 w-4" />点击行内查看详情会进入五张风险卡片页；下拉操作当前记录为审计 mock。
        </div>
      </SectionCard>
    </main>
  );

  function RowActions({ id }: { id: string }) {
    return (
      <Select aria-label="合同操作" onChange={(event) => {
        const action = event.target.value;
        if (action === 'view') router.push(`/contracts/${id}`);
        if (action) console.info(`contract:${action}:${id}`);
      }} options={[{ label: '查看详情', value: 'view' }, { label: '重新审查', value: 'rerun' }, { label: '下载 PDF', value: 'download' }, { label: '删除', value: 'delete' }]} placeholder="选择" value="" />
    );
  }
}
